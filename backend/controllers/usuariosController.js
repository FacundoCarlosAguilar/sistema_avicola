const { pool } = require('../config/database');

async function registrarGranjero(req, res) {
    const { nombre, usuario, password, id_granja_asignada } = req.body;

    try {
        // Leemos el rol directamente de los headers que mandaste en Thunder Client
        // Express convierte los nombres de los headers a minúsculas automáticamente
        const rolUsuario = req.headers['x-user-role']; 
        
        console.log("🔍 Rol detectado en los headers:", rolUsuario); 

        // Verificamos si es supervisor
        if (rolUsuario !== 'supervisor') {
            return res.status(403).json({ 
                error: `Bloqueado por el código NUEVO. El sistema detectó tu rol como: '${rolUsuario}'` 
            });
        }

        const [existe] = await pool.query('SELECT id FROM usuarios WHERE usuario = ?', [usuario]);
        if (existe.length > 0) {
            return res.status(400).json({ error: 'El nombre de usuario ya está ocupado.' });
        }

        await pool.query(
            `INSERT INTO usuarios (nombre, usuario, password_hash, perfil, id_granja_asignada) 
             VALUES (?, ?, ?, 'granjero', ?)`,
            [nombre, usuario, password, id_granja_asignada]
        );

        res.json({ success: true, message: `Granjero ${nombre} registrado con éxito y asignado a la granja.` });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error en el servidor al registrar el usuario' });
    }
}

module.exports = { registrarGranjero };