// backend/controllers/mortalidadController.js
const db = require('../config/database');

// REGLA 1: Registrar mortalidad (validando fecha futura)
exports.registrarMortalidad = async (req, res) => {
    const { id_lote, fecha, mortalidad, observaciones } = req.body;
    const { id_usuario, rol, id_granja } = req.usuario;
    
    try {
        // Verificar si el lote pertenece a la granja del usuario (granjeros)
        let query = `
            SELECT l.*, g.id_granja, g.estado as estado_galpon, 
                   gl.estado as estado_lote
            FROM lotes l
            JOIN galpones g ON l.id_galpon = g.id_galpon
            WHERE l.id_lote = ?
        `;
        
        const [lote] = await db.query(query, [id_lote]);
        
        if (!lote || lote.length === 0) {
            return res.status(404).json({ error: 'Lote no encontrado' });
        }
        
        // VALIDACIÓN DE ROL: Granjero solo puede registrar en su granja
        if (rol === 'granjero' && lote[0].id_granja !== id_granja) {
            return res.status(403).json({ error: 'No tienes permiso para este lote' });
        }
        
        // VALIDACIÓN: Lote debe estar activo
        if (lote[0].estado !== 'activo') {
            return res.status(400).json({ error: 'El lote no está activo' });
        }
        
        // VALIDACIÓN CRÍTICA: No fechas futuras
        const fechaActual = new Date().toISOString().split('T')[0];
        if (fecha > fechaActual) {
            return res.status(400).json({ error: 'No se pueden registrar datos con fechas futuras' });
        }
        
        // Verificar si ya existe registro para esa fecha
        const [existente] = await db.query(
            'SELECT id_registro FROM mortalidad_diaria WHERE id_lote = ? AND fecha = ?',
            [id_lote, fecha]
        );
        
        if (existente.length > 0) {
            return res.status(400).json({ error: 'Ya existe un registro para esta fecha' });
        }
        
        // Insertar registro
        await db.query(
            `INSERT INTO mortalidad_diaria (id_lote, fecha, mortalidad, observaciones, sincronizado)
             VALUES (?, ?, ?, ?, 1)`,
            [id_lote, fecha, mortalidad, observaciones || null]
        );
        
        // Calcular nuevo porcentaje para verificar alerta
        const [stats] = await db.query(`
            SELECT 
                l.cantidad_inicial,
                COALESCE(SUM(m.mortalidad), 0) as total_muertes,
                ROUND((COALESCE(SUM(m.mortalidad), 0) / l.cantidad_inicial) * 100, 2) as porcentaje
            FROM lotes l
            LEFT JOIN mortalidad_diaria m ON l.id_lote = m.id_lote
            WHERE l.id_lote = ?
            GROUP BY l.id_lote
        `, [id_lote]);
        
        res.json({
            success: true,
            message: 'Mortalidad registrada correctamente',
            porcentaje_mortandad: stats[0].porcentaje,
            alerta: stats[0].porcentaje > 5
        });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al registrar mortalidad' });
    }
};

// Obtener estadísticas con alerta >5%
exports.getEstadisticasLote = async (req, res) => {
    const { id_galpon } = req.params;
    const { rol, id_granja } = req.usuario;
    
    try {
        let query = `
            SELECT 
                l.id_lote,
                l.cantidad_inicial,
                l.fecha_ingreso,
                l.estado,
                g.numero_galpon,
                g.id_granja,
                gr.nombre_granja,
                COALESCE(SUM(m.mortalidad), 0) as total_muertes,
                ROUND((COALESCE(SUM(m.mortalidad), 0) / l.cantidad_inicial) * 100, 2) as porcentaje_mortandad,
                CASE 
                    WHEN (COALESCE(SUM(m.mortalidad), 0) / l.cantidad_inicial * 100) > 5 THEN TRUE
                    ELSE FALSE
                END as alerta_roja
            FROM lotes l
            JOIN galpones g ON l.id_galpon = g.id_galpon
            JOIN granjas gr ON g.id_granja = gr.id_granja
            LEFT JOIN mortalidad_diaria m ON l.id_lote = m.id_lote
            WHERE g.id_galpon = ? AND l.estado = 'activo'
            GROUP BY l.id_lote
        `;
        
        const [lote] = await db.query(query, [id_galpon]);
        
        if (lote.length === 0) {
            return res.json({ existe_lote_activo: false });
        }
        
        // Validar que el granjero solo vea su granja
        if (rol === 'granjero' && lote[0].id_granja !== id_granja) {
            return res.status(403).json({ error: 'Acceso denegado' });
        }
        
        // Obtener detalle diario
        const [detalle] = await db.query(`
            SELECT fecha, mortalidad, observaciones, created_at
            FROM mortalidad_diaria
            WHERE id_lote = ?
            ORDER BY fecha DESC
            LIMIT 10
        `, [lote[0].id_lote]);
        
        res.json({
            existe_lote_activo: true,
            lote: lote[0],
            detalle_diario: detalle
        });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener estadísticas' });
    }
};