// frontend/src/services/registrosService.js
import api from './api';

export const registrosService = {
    // Obtener registros de mortalidad por fecha
    getMortalidadPorFecha: async (fechaInicio, fechaFin) => {
        const response = await api.get('/registros/mortalidad', {
            params: { fechaInicio, fechaFin }
        });
        return response;
    },
    
    // Obtener registros de alimento por fecha
    getAlimentoPorFecha: async (fechaInicio, fechaFin) => {
        const response = await api.get('/registros/alimento', {
            params: { fechaInicio, fechaFin }
        });
        return response;
    },
    
    // Obtener registros por fecha (genérico)
    getRegistrosPorFecha: async (tipo, fechaInicio, fechaFin) => {
        const response = await api.get(`/registros/${tipo}`, {
            params: { fechaInicio, fechaFin }
        });
        return response;
    },
    
    // Guardar nuevo registro de mortalidad
    guardarMortalidad: async (data) => {
        const response = await api.post('/registros/mortalidad', data);
        return response;
    },
    
    // Guardar nuevo registro de alimento
    guardarAlimento: async (data) => {
        const response = await api.post('/registros/alimento', data);
        return response;
    }
};