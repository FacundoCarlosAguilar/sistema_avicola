// frontend/src/services/apiService.js
const API_URL = 'http://localhost:8000/api';

// Clave para almacenar datos offline
const OFFLINE_STORAGE_KEY = 'offline_registros';

// Guardar registro offline
const guardarOffline = (registro) => {
    try {
        const offlineRegistros = JSON.parse(localStorage.getItem(OFFLINE_STORAGE_KEY) || '[]');
        const nuevoRegistro = {
            ...registro,
            id_local: Date.now(),
            fecha_offline: new Date().toISOString(),
            pendiente: true
        };
        offlineRegistros.push(nuevoRegistro);
        localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(offlineRegistros));
        return { success: true, offline: true, id_local: nuevoRegistro.id_local };
    } catch (error) {
        console.error('Error guardando offline:', error);
        return { success: false, error: error.message };
    }
};

export const apiService = {
    // Guardar registro (con soporte offline)
    guardarRegistro: async (data) => {
        // Si estamos offline, guardar localmente
        if (!navigator.onLine) {
            console.log('🔌 Modo offline - Guardando localmente');
            const offlineResult = guardarOffline(data);
            
            if (offlineResult.success) {
                return {
                    success: true,
                    message: '⚠️ Sin conexión. Datos guardados localmente',
                    offline: true,
                    porcentaje: 0,
                    alerta: false
                };
            }
            return {
                success: false,
                message: 'Error guardando offline',
                error: offlineResult.error
            };
        }
        
        // Modo online - intentar guardar en el servidor
        try {
            const response = await fetch(`${API_URL}/registros`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const result = await response.json();
            return result;
            
        } catch (error) {
            console.error('Error en modo online:', error);
            
            // Si falla el online, guardar offline
            console.log('📡 Falló conexión - Guardando localmente');
            const offlineResult = guardarOffline(data);
            
            if (offlineResult.success) {
                return {
                    success: true,
                    message: '⚠️ Sin conexión al servidor. Datos guardados localmente',
                    offline: true,
                    porcentaje: 0,
                    alerta: false
                };
            }
            
            return {
                success: false,
                message: 'Error al guardar',
                error: error.message
            };
        }
    },

    // Obtener registros (combina online + offline)
    obtenerRegistros: async (fechaInicio, fechaFin) => {
        // Obtener registros offline locales
        const offlineRegistros = JSON.parse(localStorage.getItem(OFFLINE_STORAGE_KEY) || '[]');
        const offlineFiltrados = offlineRegistros.filter(r => {
            if (!fechaInicio || !fechaFin) return true;
            return r.fecha >= fechaInicio && r.fecha <= fechaFin;
        });
        
        // Si estamos offline, solo devolver locales
        if (!navigator.onLine) {
            console.log('🔌 Modo offline - Mostrando solo registros locales');
            return offlineFiltrados.map(r => ({
                id: r.id_local,
                fecha: r.fecha,
                mortandad: r.mortandad,
                aves_vivas: r.aves_vivas,
                alimento_kg: r.alimento_kg,
                novedades: r.novedades,
                galpon_nombre: 'Local (pendiente sincronizar)',
                offline: true
            }));
        }
        
        // Modo online - obtener del servidor
        try {
            const url = new URL(`${API_URL}/registros`);
            if (fechaInicio) url.searchParams.append('fechaInicio', fechaInicio);
            if (fechaFin) url.searchParams.append('fechaFin', fechaFin);
            
            const response = await fetch(url);
            if (!response.ok) throw new Error('Error obteniendo registros');
            
            const onlineRegistros = await response.json();
            
            // Combinar con offline (marcar los offline como pendientes)
            const todos = [...onlineRegistros];
            offlineFiltrados.forEach(off => {
                todos.push({
                    ...off,
                    id: off.id_local,
                    galpon_nombre: '📱 Local (pendiente sincronizar)',
                    offline: true
                });
            });
            
            return todos;
            
        } catch (error) {
            console.error('Error obteniendo online:', error);
            // Fallback a solo offline
            return offlineFiltrados.map(r => ({
                id: r.id_local,
                fecha: r.fecha,
                mortandad: r.mortandad,
                aves_vivas: r.aves_vivas,
                alimento_kg: r.alimento_kg,
                novedades: r.novedades,
                galpon_nombre: 'Local (offline)',
                offline: true
            }));
        }
    },

    // Sincronizar datos pendientes cuando vuelve la conexión
    sincronizarPendientes: async () => {
        if (!navigator.onLine) {
            console.log('🔌 Sin conexión - no se puede sincronizar');
            return { success: false, reason: 'offline' };
        }
        
        const pendientes = JSON.parse(localStorage.getItem(OFFLINE_STORAGE_KEY) || '[]');
        
        if (pendientes.length === 0) {
            console.log('✅ No hay datos pendientes de sincronizar');
            return { success: true, sincronizados: 0 };
        }
        
        console.log(`📤 Sincronizando ${pendientes.length} registros pendientes...`);
        
        const resultados = [];
        for (const registro of pendientes) {
            try {
                const response = await fetch(`${API_URL}/registros`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        fecha: registro.fecha,
                        mortandad: registro.mortandad,
                        aves_vivas: registro.aves_vivas,
                        alimento_kg: registro.alimento_kg,
                        novedades: registro.novedades,
                        id_lote: registro.id_lote || 1
                    })
                });
                
                if (response.ok) {
                    resultados.push({ id: registro.id_local, success: true });
                } else {
                    resultados.push({ id: registro.id_local, success: false });
                }
            } catch (error) {
                resultados.push({ id: registro.id_local, success: false, error: error.message });
            }
        }
        
        // Eliminar los sincronizados exitosamente
        const exitosos = resultados.filter(r => r.success).map(r => r.id);
        const nuevosPendientes = pendientes.filter(r => !exitosos.includes(r.id_local));
        localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(nuevosPendientes));
        
        console.log(`✅ Sincronizados ${exitosos.length} de ${pendientes.length} registros`);
        
        return {
            success: true,
            sincronizados: exitosos.length,
            pendientes: nuevosPendientes.length
        };
    },

    // Obtener lote activo (con soporte offline)
    obtenerLoteActivo: async (idGalpon) => {
        if (!navigator.onLine) {
            // Datos por defecto para modo offline
            return {
                existe: true,
                lote: {
                    id: 1,
                    cantidad_aves: 10000,
                    fecha_ingreso: '2026-04-10',
                    activo: 1
                },
                total_muertes: 20,
                porcentaje_mortandad: 0.2,
                alerta: false,
                offline: true
            };
        }
        
        try {
            const response = await fetch(`${API_URL}/lote-activo/${idGalpon}`);
            if (!response.ok) throw new Error('Error obteniendo lote');
            return await response.json();
        } catch (error) {
            console.error('Error obteniendo lote online:', error);
            // Fallback offline
            return {
                existe: true,
                lote: {
                    id: 1,
                    cantidad_aves: 10000,
                    fecha_ingreso: '2026-04-10',
                    activo: 1
                },
                total_muertes: 20,
                porcentaje_mortandad: 0.2,
                alerta: false,
                offline: true
            };
        }
    }
};

// Función para sincronizar automáticamente cuando vuelve la conexión
window.addEventListener('online', () => {
    console.log('🔄 Conexión recuperada - Sincronizando datos...');
    setTimeout(() => {
        apiService.sincronizarPendientes().then(result => {
            if (result.sincronizados > 0) {
                console.log(`✅ ${result.sincronizados} registros sincronizados`);
                // Recargar la página para mostrar datos actualizados
                window.location.reload();
            }
        });
    }, 2000);
});