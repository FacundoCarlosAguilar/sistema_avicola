import API_URL from './config';

export const login = async (usuario, password) => {
    const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario, password })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
        throw new Error(data.detail || 'Error de autenticación');
    }
    
    return data;
};

export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
    localStorage.removeItem('nombre');
};

export const getToken = () => localStorage.getItem('token');
export const getRol = () => localStorage.getItem('rol');
export const getNombre = () => localStorage.getItem('nombre');