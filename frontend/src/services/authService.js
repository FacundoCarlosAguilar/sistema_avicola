// frontend/src/services/authService.js

// Usuarios de prueba para modo offline
const USUARIOS_OFFLINE = [
    { id: 1, username: 'granjero', password: '123456', rol: 'granjero', nombre: 'Pedro López', id_granja: 1 },
    { id: 2, username: 'supervisor', password: 'admin123', rol: 'supervisor', nombre: 'Admin Principal', id_granja: null }
];

export const authService = {
    // Login con detección de offline
    login: async (usuario, password) => {
        // Verificar si estamos offline
        if (!navigator.onLine) {
            console.log('🔌 Modo offline - Verificando credenciales locales');
            
            // Buscar usuario en lista offline
            const user = USUARIOS_OFFLINE.find(u => 
                u.username === usuario && u.password === password
            );
            
            if (user) {
                // Crear token simulado
                const token = btoa(JSON.stringify({ id: user.id, username: user.username, exp: Date.now() + 28800000 }));
                
                // Guardar sesión offline
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify({
                    id: user.id,
                    username: user.username,
                    rol: user.rol,
                    nombre: user.nombre,
                    id_granja: user.id_granja
                }));
                
                return {
                    success: true,
                    rol: user.rol,
                    nombre: user.nombre,
                    token: token,
                    offline: true
                };
            }
            
            return { success: false, error: 'Usuario o contraseña incorrectos (modo offline)' };
        }
        
        // Modo online - conectar al backend
        try {
            const response = await fetch('http://localhost:8000/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usuario, password })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                localStorage.setItem('token', data.access_token);
                localStorage.setItem('user', JSON.stringify({
                    rol: data.rol,
                    nombre: data.nombre
                }));
                return { success: true, ...data };
            }
            
            return { success: false, error: data.detail || 'Error de autenticación' };
            
        } catch (error) {
            console.error('Error de conexión:', error);
            // Fallback a modo offline
            return authService.loginOffline(usuario, password);
        }
    },
    
    loginOffline: (usuario, password) => {
        const user = USUARIOS_OFFLINE.find(u => u.username === usuario && u.password === password);
        
        if (user) {
            localStorage.setItem('user', JSON.stringify({
                id: user.id,
                username: user.username,
                rol: user.rol,
                nombre: user.nombre,
                id_granja: user.id_granja
            }));
            localStorage.setItem('offline_mode', 'true');
            
            return {
                success: true,
                rol: user.rol,
                nombre: user.nombre,
                offline: true
            };
        }
        
        return { success: false, error: 'Credenciales incorrectas' };
    },
    
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('offline_mode');
    },
    
    getUser: () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },
    
    isAuthenticated: () => {
        return !!localStorage.getItem('user');
    },
    
    isOfflineMode: () => {
        return localStorage.getItem('offline_mode') === 'true' || !navigator.onLine;
    }
};