// backend/controllers/alimentoController.js
const db = require('../config/database');

// Estándares de consumo por fase (igual que en Python)
const ESTANDARES_CONSUMO = {
    'F1': 0.25,
    'F2': 0.85,
    'F3': 1.0,
    'F4': 1.5,
    'F5': 2.0
};

exports.registrarIngresoAlimento = async (req, res) => {
    const { id_granja, fecha, fase, cantidad_recibida_kg, remito, observaciones } = req.body;
    const { rol, id_granja: id_granja_usuario } = req.usuario;
    
    try {
        // Validar fecha futura
        const hoy = new Date().toISOString().split('T')[0];
        if (fecha > hoy) {
            return res.status(400).json({ error: 'No se pueden registrar ingresos con fechas futuras' });
        }
        
        // Granjero solo puede registrar en su granja
        if (rol === 'granjero' && parseInt(id_granja) !== id_granja_usuario) {
            return res.status(403).json({ error: 'No puedes registrar en esta granja' });
        }
        
        // Validar que la fase exista
        if (!ESTANDARES_CONSUMO[fase]) {
            return res.status(400).json({ error: 'Fase inválida. Use F1, F2, F3, F4 o F5' });
        }
        
        await db.query(
            `INSERT INTO ingresos_alimento (id_granja, fecha, fase, cantidad_recibida_kg, remito, observaciones, sincronizado)
             VALUES (?, ?, ?, ?, ?, ?, 1)`,
            [id_granja, fecha, fase, cantidad_recibida_kg, remito, observaciones || null]
        );
        
        // Calcular proyección actualizada
        const proyeccion = await calcularProyeccion(id_granja, fase);
        
        res.json({
            success: true,
            message: 'Ingreso registrado correctamente',
            proyeccion
        });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al registrar ingreso' });
    }
};

// Función para calcular proyección (misma lógica que en Python)
async function calcularProyeccion(id_granja, fase) {
    const consumo_por_ave = ESTANDARES_CONSUMO[fase];
    
    // Obtener población total de aves vivas en lotes activos
    const [poblacion] = await db.query(`
        SELECT SUM(l.cantidad_inicial - COALESCE(SUM(m.mortalidad), 0)) as total_aves
        FROM lotes l
        JOIN galpones g ON l.id_galpon = g.id_galpon
        LEFT JOIN mortalidad_diaria m ON l.id_lote = m.id_lote
        WHERE g.id_granja = ? AND l.estado = 'activo'
        GROUP BY l.id_lote
    `, [id_granja]);
    
    let poblacion_total = 0;
    if (poblacion && poblacion.length > 0) {
        poblacion_total = poblacion.reduce((sum, row) => sum + (parseInt(row.total_aves) || 0), 0);
    }
    
    const kilos_requeridos = poblacion_total * consumo_por_ave;
    
    // Obtener kilos ya recibidos
    const [recibido] = await db.query(`
        SELECT SUM(cantidad_recibida_kg) as total_recibido
        FROM ingresos_alimento
        WHERE id_granja = ? AND fase = ?
    `, [id_granja, fase]);
    
    const kilos_recibidos = recibido[0]?.total_recibido || 0;
    const faltante = Math.max(0, kilos_requeridos - kilos_recibidos);
    
    return {
        poblacion_total,
        kilos_requeridos: Math.round(kilos_requeridos * 100) / 100,
        kilos_recibidos: Math.round(kilos_recibidos * 100) / 100,
        kilos_faltantes: Math.round(faltante * 100) / 100,
        consumo_por_ave
    };
}

exports.getProyeccionAlimento = async (req, res) => {
    const { id_granja, fase } = req.params;
    const { rol, id_granja: id_granja_usuario } = req.usuario;
    
    try {
        if (rol === 'granjero' && parseInt(id_granja) !== id_granja_usuario) {
            return res.status(403).json({ error: 'Acceso denegado' });
        }
        
        const proyeccion = await calcularProyeccion(id_granja, fase);
        res.json(proyeccion);
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al calcular proyección' });
    }
};