require('dotenv').config({ path: './.env' });

const express = require('express');
const cors = require('cors');

console.log('🌍 Variables de entorno cargadas:');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('PORT:', process.env.PORT);

const { pool, testConnection } = require('./config/database');
const { initTables, insertTestData } = require('./models/avicolaModels');
const { 
    guardarRegistroDiario, 
    obtenerRegistros,
    obtenerLoteActivo 
} = require('./controllers/registrosController');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Middleware de autenticación (simplificado)
const authMiddleware = (req, res, next) => {
    // Temporal: usuario fijo para pruebas
    req.usuario = {
        id_usuario: 1,
        username: 'granjero',
        rol: 'granjero',
        id_granja: 1
    };
    next();
};

// Rutas
app.post('/api/registros', authMiddleware, guardarRegistroDiario);
app.get('/api/registros', authMiddleware, obtenerRegistros);
app.get('/api/lote-activo/:id_galpon', authMiddleware, obtenerLoteActivo);
app.get('/api/health', (req, res) => res.json({ 
    status: 'ok', 
    db_host: process.env.DB_HOST,
    db_name: process.env.DB_NAME,
    tables: ['granjas', 'galpones', 'lotes', 'control_diario']
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
            console.log(`   GET /api/health - Verificar estado\n`);
        });
    } else {
        console.error('❌ No se pudo conectar a Hostinger.');
    }
}

startServer();