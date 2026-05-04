// backend/controllers/lotesController.js
const db = require('../config/database');

exports.crearLote = async (req, res) => {
    const { id_galpon, cantidad_inicial, fecha_ingreso } = req.body;
    const { id_usuario, rol, id_granja } = req.usuario;
    
    try {
        // Verificar estado del galpón
        const [galpon] = await db.query(`
            SELECT g.*, gr.id_granja 
            FROM galpones g
            JOIN granjas gr ON g.id_granja = gr.id_granja
            WHERE g.id_galpon = ?
        `, [id_galpon]);
        
        if (!galpon || galpon.length === 0) {
            return res.status(404).json({ error: 'Galpón no encontrado' });
        }
        
        // REGLA DE NEGOCIO: Validar que el galpón esté vacío
        if (galpon[0].estado !== 'vacio') {
            return res.status(400).json({ 
                error: 'El galpón no está vacío. No se puede iniciar un nuevo lote.' 
            });
        }
        
        // Granjero solo puede crear lotes en su granja asignada
        if (rol === 'granjero' && galpon[0].id_granja !== id_granja) {
            return res.status(403).json({ error: 'No puedes crear lotes en esta granja' });
        }
        
        // Validar que la fecha no sea futura
        const hoy = new Date().toISOString().split('T')[0];
        if (fecha_ingreso > hoy) {
            return res.status(400).json({ error: 'La fecha de ingreso no puede ser futura' });
        }
        
        // Iniciar transacción
        const connection = await db.getConnection();
        await connection.beginTransaction();
        
        try {
            // Crear lote
            const [result] = await connection.query(
                `INSERT INTO lotes (id_galpon, fecha_ingreso, cantidad_inicial, estado)
                 VALUES (?, ?, ?, 'activo')`,
                [id_galpon, fecha_ingreso, cantidad_inicial]
            );
            
            // ACTUALIZAR estado del galpón a 'activo'
            await connection.query(
                `UPDATE galpones SET estado = 'activo' WHERE id_galpon = ?`,
                [id_galpon]
            );
            
            await connection.commit();
            
            res.json({
                success: true,
                id_lote: result.insertId,
                message: 'Lote creado exitosamente'
            });
            
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear el lote' });
    }
};

// Finalizar lote (liberar galpón)
exports.finalizarLote = async (req, res) => {
    const { id_lote } = req.params;
    const { rol, id_granja } = req.usuario;
    
    try {
        // Verificar lote y su galpón
        const [lote] = await db.query(`
            SELECT l.*, g.id_granja, g.id_galpon
            FROM lotes l
            JOIN galpones g ON l.id_galpon = g.id_galpon
            WHERE l.id_lote = ?
        `, [id_lote]);
        
        if (!lote.length) {
            return res.status(404).json({ error: 'Lote no encontrado' });
        }
        
        if (rol === 'granjero' && lote[0].id_granja !== id_granja) {
            return res.status(403).json({ error: 'Acceso denegado' });
        }
        
        const connection = await db.getConnection();
        await connection.beginTransaction();
        
        try {
            // Finalizar lote
            await connection.query(
                `UPDATE lotes SET estado = 'finalizado', fecha_finalizacion = CURDATE()
                 WHERE id_lote = ?`,
                [id_lote]
            );
            
            // Liberar galpón (cambiar a 'vacio')
            await connection.query(
                `UPDATE galpones SET estado = 'vacio' WHERE id_galpon = ?`,
                [lote[0].id_galpon]
            );
            
            await connection.commit();
            
            res.json({ success: true, message: 'Lote finalizado y galpón liberado' });
            
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al finalizar el lote' });
    }
};