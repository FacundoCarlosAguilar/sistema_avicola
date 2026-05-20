require('dotenv').config({ path: './.env' });

const express = require('express');
const cors = require('cors');

console.log('🌍 Variables de entorno cargadas:');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('PORT:', process.env.PORT);

const { pool, testConnection } = require('./config/database');
const { initTables, insertTestData } = require('./models/avicolaModels');

// Controladores anteriores
const { 
    guardarRegistroDiario, 
    obtenerRegistros,
    obtenerLoteActivo 
} = require('./controllers/registrosController');

// NUEVO CONTROLADOR: Para registrar usuarios
const { registrarGranjero } = require('./controllers/usuariosController');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Middleware de autenticación MEJORADO
// Nota: Cuando implementes login real con JWT, acá leerás el token.
// Por ahora, lee los datos que vienen desde la página web (headers) o mantiene un fallback.
const authMiddleware = (req, res, next) => {
    // Intentamos leer el usuario que manda el frontend, si no viene, dejamos el de pruebas
    req.usuario = {
        id_usuario: parseInt(req.headers['x-user-id']) || 1,
        username: req.headers['x-user-username'] || 'granjero',
        rol: req.headers['x-user-role'] || 'granjero', // 'granjero' o 'supervisor'
        id_granja: parseInt(req.headers['x-user-farm-id']) || 1
    };
    next();
};

// ================= RUTAS DEL SISTEMA =================

// Rutas de Registros (Granjeros)
app.post('/api/registros', authMiddleware, guardarRegistroDiario);
app.get('/api/registros', authMiddleware, obtenerRegistros);
app.get('/api/lote-activo/:id_galpon', authMiddleware, obtenerLoteActivo);

// NUEVA RUTA: Registrar Granjeros (Solo Supervisores)
app.post('/api/usuarios/registrar', authMiddleware, registrarGranjero);

// Verificar Estado
app.get('/api/health', (req, res) => res.json({ 
    status: 'ok', 
    db_host: process.env.DB_HOST,
    db_name: process.env.DB_NAME,
    tables: ['granjas', 'galpones', 'lotes', 'control_diario', 'usuarios']
}));

// Iniciar servidor
async function startServer() {
    console.log('🚀 Iniciando servidor...');
    
    const connected = await testConnection();
    
    if (connected) {
        await initTables();
        await insertTestData();
        
        app.listen(PORT, () => {
            console.log(`\n✅ Servidor corriendo en http://localhost:${PORT}`);
            console.log(`📡 Conectado a Hostinger: ${process.env.DB_HOST}`);
            console.log(`💾 Base de datos: ${process.env.DB_NAME}`);
            console.log(`\n📋 Endpoints disponibles:`);
            console.log(`   POST /api/registros - Guardar registro diario`);
            console.log(`   GET /api/registros - Obtener registros`);
            console.log(`   GET /api/lote-activo/:id_galpon - Obtener lote activo`);
            console.log(`   POST /api/usuarios/registrar - [NUEVO] Registrar Granjero (Supervisor)`);
            console.log(`   GET /api/health - Verificar estado\n`);
        });
    } else {
        console.error('❌ No se pudo conectar a Hostinger.');
    }
}

startServer();