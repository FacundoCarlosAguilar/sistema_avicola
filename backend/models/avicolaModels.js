const { pool } = require('../config/database');

// Verificar tablas existentes (no crear nuevas)
async function initTables() {
    const connection = await pool.getConnection();
    
    try {
        console.log('🔍 Verificando conexión a Hostinger...');
        
        // Verificar tablas principales
        const [granjas] = await connection.query('SELECT COUNT(*) as count FROM granjas');
        const [galpones] = await connection.query('SELECT COUNT(*) as count FROM galpones');
        const [lotes] = await connection.query('SELECT COUNT(*) as count FROM lotes');
        const [control] = await connection.query('SELECT COUNT(*) as count FROM control_diario');
        
        console.log(`📊 Estadísticas:`);
        console.log(`   - Granjas: ${granjas[0].count}`);
        console.log(`   - Galpones: ${galpones[0].count}`);
        console.log(`   - Lotes: ${lotes[0].count}`);
        console.log(`   - Registros diarios: ${control[0].count}`);
        
        console.log('✅ Tablas verificadas correctamente');
        
    } catch (error) {
        console.error('❌ Error:', error);
        throw error;
    } finally {
        connection.release();
    }
}

// Insertar datos de prueba si es necesario
async function insertTestData() {
    const connection = await pool.getConnection();
    
    try {
        // Verificar si hay alguna granja
        const [granjas] = await connection.query('SELECT COUNT(*) as count FROM granjas');
        
        if (granjas[0].count === 0) {
            console.log('📝 Insertando datos de prueba...');
            
            // Insertar dueño primero (si existe tabla duenos)
            const [duenos] = await connection.query('SELECT COUNT(*) as count FROM duenos');
            let idDueno = 1;
            
            if (duenos[0].count === 0) {
                await connection.query(
                    'INSERT INTO duenos (nombre, apellido, contacto) VALUES (?, ?, ?)',
                    ['Juan', 'Pérez', '0999123456']
                );
            }
            
            // Insertar granja
            const [resultGranja] = await connection.query(
                'INSERT INTO granjas (nombre, ubicacion, id_dueno) VALUES (?, ?, ?)',
                ['Granja Norte', 'Ruta 5 Km 12, Departamento Central', idDueno]
            );
            const idGranja = resultGranja.insertId;
            
            // Insertar galpón
            const [resultGalpon] = await connection.query(
                'INSERT INTO galpones (nombre, capacidad, id_granja) VALUES (?, ?, ?)',
                ['Galpón Norte A', 10000, idGranja]
            );
            const idGalpon = resultGalpon.insertId;
            
            // Insertar lote activo
            await connection.query(
                'INSERT INTO lotes (fecha_ingreso, cantidad_aves, activo, id_galpon) VALUES (?, ?, ?, ?)',
                ['2026-04-10', 10000, 1, idGalpon]
            );
            
            console.log('✅ Datos de prueba insertados');
        } else {
            console.log('📊 Los datos ya existen');
        }
        
    } catch (error) {
        console.error('❌ Error insertando datos:', error);
    } finally {
        connection.release();
    }
}

module.exports = { initTables, insertTestData };