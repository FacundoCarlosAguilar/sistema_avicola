const { pool } = require('../config/database');

// Guardar registro diario (mortalidad + alimento) en control_diario
async function guardarRegistroDiario(req, res) {
    const { 
        fecha, 
        mortandad, 
        aves_vivas, 
        alimento_kg, 
        novedades, 
        id_lote 
    } = req.body;
    
    try {
        // Validar fecha futura
        const hoy = new Date().toISOString().split('T')[0];
        if (fecha > hoy) {
            return res.status(400).json({ error: 'No se permiten fechas futuras' });
        }
        
        // Verificar si ya existe registro para esa fecha y lote
        const [existente] = await pool.query(
            'SELECT id FROM control_diario WHERE fecha = ? AND id_lote = ?',
            [fecha, id_lote]
        );
        
        if (existente.length > 0) {
            return res.status(400).json({ error: 'Ya existe un registro para esta fecha' });
        }
        
        // Guardar en control_diario
        await pool.query(
            `INSERT INTO control_diario 
             (fecha, mortandad, aves_vivas, alimento_kg, novedades, id_lote) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [fecha, mortandad, aves_vivas, alimento_kg, novedades, id_lote]
        );
        
        // Calcular porcentaje de mortandad del lote
        const [stats] = await pool.query(`
            SELECT 
                l.cantidad_aves as cantidad_inicial,
                COALESCE(SUM(c.mortandad), 0) as total_muertes
            FROM lotes l
            LEFT JOIN control_diario c ON l.id = c.id_lote
            WHERE l.id = ?
            GROUP BY l.id
        `, [id_lote]);
        
        const porcentaje = stats[0] && stats[0].cantidad_inicial > 0
            ? ((stats[0].total_muertes / stats[0].cantidad_inicial) * 100).toFixed(2)
            : 0;
        
        res.json({
            success: true,
            message: 'Registro guardado en Hostinger',
            porcentaje: porcentaje,
            alerta: porcentaje > 5
        });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al guardar en Hostinger' });
    }
}

// Obtener registros de control_diario
async function obtenerRegistros(req, res) {
    const { fechaInicio, fechaFin, id_lote } = req.query;
    
    try {
        let query = `
            SELECT c.*, l.cantidad_aves, g.nombre as galpon_nombre, gr.nombre as granja_nombre
            FROM control_diario c
            JOIN lotes l ON c.id_lote = l.id
            JOIN galpones g ON l.id_galpon = g.id
            JOIN granjas gr ON g.id_granja = gr.id
            WHERE c.fecha BETWEEN ? AND ?
        `;
        let params = [fechaInicio, fechaFin];
        
        if (id_lote) {
            query += ' AND c.id_lote = ?';
            params.push(id_lote);
        }
        
        query += ' ORDER BY c.fecha DESC';
        
        const [registros] = await pool.query(query, params);
        res.json(registros);
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener registros' });
    }
}

// Obtener lote activo por galpón
async function obtenerLoteActivo(req, res) {
    const { id_galpon } = req.params;
    
    try {
        const [lote] = await pool.query(`
            SELECT l.*, g.nombre as galpon_nombre
            FROM lotes l
            JOIN galpones g ON l.id_galpon = g.id
            WHERE l.id_galpon = ? AND l.activo = 1
            ORDER BY l.fecha_ingreso DESC
            LIMIT 1
        `, [id_galpon]);
        
        if (lote.length === 0) {
            return res.json({ existe: false });
        }
        
        // Obtener estadísticas de mortandad
        const [stats] = await pool.query(`
            SELECT 
                COALESCE(SUM(mortandad), 0) as total_muertes,
                COUNT(*) as total_registros
            FROM control_diario
            WHERE id_lote = ?
        `, [lote[0].id]);
        
        const porcentaje = lote[0].cantidad_aves > 0
            ? ((stats[0].total_muertes / lote[0].cantidad_aves) * 100).toFixed(2)
            : 0;
        
        res.json({
            existe: true,
            lote: lote[0],
            total_muertes: stats[0].total_muertes,
            porcentaje_mortandad: porcentaje,
            alerta: porcentaje > 5
        });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener lote activo' });
    }
}

module.exports = { 
    guardarRegistroDiario, 
    obtenerRegistros,
    obtenerLoteActivo 
};