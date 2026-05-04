// frontend/pages/Login.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Container, Paper, Typography, Alert, Chip, Box } from '@mui/material';
import { login } from '../api/auth';

// Credenciales para modo offline
const USUARIOS_OFFLINE = [
    { username: 'pedro', password: 'pedro123', rol: 'granjero', nombre: 'Pedro López' },
    { username: 'supervisor', password: 'admin123', rol: 'supervisor', nombre: 'Admin Principal' }
];

function Login() {
    const [usuario, setUsuario] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [offlineMode, setOfflineMode] = useState(!navigator.onLine);
    const navigate = useNavigate();

    useEffect(() => {
        // Verificar si ya está logueado
        const token = localStorage.getItem('token');
        const rol = localStorage.getItem('rol');
        if (token && rol) {
            if (rol === 'supervisor') {
                navigate('/dashboard');
            } else {
                navigate('/carga-diaria');
            }
        }
        
        // Escuchar cambios de conexión
        const handleOnline = () => setOfflineMode(false);
        const handleOffline = () => setOfflineMode(true);
        
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [navigate]);

    // Login offline
    const loginOffline = (usuario, password) => {
        const user = USUARIOS_OFFLINE.find(u => u.username === usuario && u.password === password);
        
        if (user) {
            localStorage.setItem('token', 'offline_token_' + Date.now());
            localStorage.setItem('rol', user.rol);
            localStorage.setItem('nombre', user.nombre);
            localStorage.setItem('offline_mode', 'true');
            return { success: true, rol: user.rol, nombre: user.nombre };
        }
        
        return { success: false, error: 'Usuario o contraseña incorrectos (modo offline)' };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        // Si estamos offline, usar login offline
        if (!navigator.onLine || offlineMode) {
            console.log('Modo offline - usando credenciales locales');
            const result = loginOffline(usuario, password);
            
            if (result.success) {
                localStorage.setItem('nombre', result.nombre);
                localStorage.setItem('rol', result.rol);
                
                if (result.rol === 'supervisor') {
                    navigate('/dashboard');
                } else {
                    navigate('/carga-diaria');
                }
            } else {
                setError(result.error);
            }
            
            setLoading(false);
            return;
        }
        
        // Modo online - conectar al backend
        try {
            const data = await login(usuario, password);
            localStorage.setItem('token', data.access_token);
            localStorage.setItem('rol', data.rol);
            localStorage.setItem('nombre', data.nombre);
            localStorage.removeItem('offline_mode');
            
            if (data.rol === 'supervisor') {
                navigate('/dashboard');
            } else {
                navigate('/carga-diaria');
            }
        } catch (err) {
            console.error('Error de conexión:', err);
            
            // Si falla la conexión, intentar modo offline
            const result = loginOffline(usuario, password);
            if (result.success) {
                localStorage.setItem('nombre', result.nombre);
                localStorage.setItem('rol', result.rol);
                localStorage.setItem('offline_mode', 'true');
                
                if (result.rol === 'supervisor') {
                    navigate('/dashboard');
                } else {
                    navigate('/carga-diaria');
                }
            } else {
                setError('No hay conexión con el servidor. Verifica tu internet o usa modo offline.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container component="main" maxWidth="xs">
            <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
                <Typography variant="h5" align="center" gutterBottom>
                Sistema Avícola
                </Typography>
                <Typography variant="body2" align="center" color="textSecondary" gutterBottom>
                    Iniciar Sesión
                </Typography>
                
                {offlineMode && (
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        <strong>Modo Offline</strong>
                        <br />
                        <small>Datos locales: pedro / pedro123</small>
                    </Alert>
                )}
                
                {!offlineMode && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                        <Chip label="En línea" size="small" color="success" />
                    </Box>
                )}
                
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                
                <form onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Usuario"
                        value={usuario}
                        onChange={(e) => setUsuario(e.target.value)}
                        required
                        autoFocus
                    />
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Contraseña"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 2 }}
                        disabled={loading}
                    >
                        {loading ? 'Ingresando...' : 'Ingresar'}
                    </Button>
                </form>
                
                <Typography variant="caption" color="textSecondary" sx={{ mt: 2, display: 'block', textAlign: 'center' }}>
                    {offlineMode ? 'Demo offline: pedro / pedro123' : 'demo: pedro / pedro123'}
                </Typography>
            </Paper>
        </Container>
    );
}

export default Login;