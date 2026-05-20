const { pool } = require('../config/database');

// Guardar registro diario (mortalidad + alimento) - ¡AHORA PROTEGIDO!
async function guardarRegistroDiario(req, res) {
    const { 
        fecha, 
        mortandad, 
        aves_vivas, 
        alimento_kg, 
        novedades, 
        id_lote,
        id_usuario_granjero // <-- Pedimos el ID de quien carga el dato
    } = req.body;
    
    try {
        // Validar fecha futura
        const hoy = new Date().toISOString().split('T')[0];
        if (fecha > hoy) {
            return res.status(400).json({ error: 'No se permiten fechas futuras' });
        }

        // 1. VALIDACIÓN: Buscar la granja asignada al granjero
        const [usuario] = await pool.query(
            'SELECT id_granja_asignada FROM usuarios WHERE id = ?',
            [id_usuario_granjero]
        );

        if (usuario.length === 0 || usuario[0].id_granja_asignada === null) {
            return res.status(403).json({ error: 'El usuario no tiene una granja asignada.' });
        }
        const idGranjaGranjero = usuario[0].id_granja_asignada;

        // 2. VALIDACIÓN: Verificar si el lote pertenece a la granja del granjero
        const [loteInfo] = await pool.query(
            `SELECT g.id_granja 
             FROM lotes l
             JOIN galpones g ON l.id_galpon = g.id
             WHERE l.id = ?`,
            [id_lote]
        );

        if (loteInfo.length === 0 || loteInfo[0].id_granja !== idGranjaGranjero) {
            return res.status(403).json({ error: 'Acceso denegado. Este lote no pertenece a tu granja asignada.' });
        }
        
        // 3. Verificar duplicados
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
            message: 'Registro guardado en Hostinger de manera segura',
            porcentaje: porcentaje,
            alerta: porcentaje > 5
        });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al guardar en Hostinger' });
    }
}

// Obtener registros de control_diario - ¡AHORA FILTRADO POR GRANJA!
async function obtenerRegistros(req, res) {
    const { fechaInicio, fechaFin, id_lote, id_usuario_granjero, perfil_usuario } = req.query;
    
    try {
        // Buscamos la granja si es un granjero para obligar al filtro
        let idGranjaAsignada = null;
        if (perfil_usuario === 'granjero') {
            const [user] = await pool.query('SELECT id_granja_asignada FROM usuarios WHERE id = ?', [id_usuario_granjero]);
            if (user.length > 0) idGranjaAsignada = user[0].id_granja_asignada;
        }

        let query = `
            SELECT c.*, l.cantidad_aves, g.nombre as galpon_nombre, gr.nombre as granja_nombre
            FROM control_diario c
            JOIN lotes l ON c.id_lote = l.id
            JOIN galpones g ON l.id_galpon = g.id
            JOIN granjas gr ON g.id_granja = gr.id
            WHERE c.fecha BETWEEN ? AND ?
        `;
        let params = [fechaInicio, fechaFin];
        
        // Si es granjero, forzar que solo traiga lo de su granja
        if (perfil_usuario === 'granjero' && idGranjaAsignada) {
            query += ' AND gr.id = ?';
            params.push(idGranjaAsignada);
        }

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

// Obtener lote activo por galpón - ¡AHORA COMPROBANDO PERMISOS!
async function obtenerLoteActivo(req, res) {
    const { id_galpon } = req.params;
    const { id_usuario_granjero, perfil_usuario } = req.query; // Filtros opcionales de seguridad
    
    try {
        const [lote] = await pool.query(`
            SELECT l.*, g.nombre as galpon_nombre, g.id_granja
            FROM lotes l
            JOIN galpones g ON l.id_galpon = g.id
            WHERE l.id_galpon = ? AND l.activo = 1
            ORDER BY l.fecha_ingreso DESC
            LIMIT 1
        `, [id_galpon]);
        
        if (lote.length === 0) {
            return res.json({ existe: false });
        }

        // CONTROL: Si es un granjero, verificar que no intente fisgar un galpón ajeno
        if (perfil_usuario === 'granjero') {
            const [user] = await pool.query('SELECT id_granja_asignada FROM usuarios WHERE id = ?', [id_usuario_granjero]);
            if (user.length === 0 || user[0].id_granja_asignada !== lote[0].id_granja) {
                return res.status(403).json({ error: 'No tenés permisos sobre este galpón' });
            }
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
            percentage_mortandad: porcentaje,
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