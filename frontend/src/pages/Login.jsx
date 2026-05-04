import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Container, Paper, Typography, Alert } from '@mui/material';
import { login } from '../api/auth';

function Login() {
    const [usuario, setUsuario] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
            const data = await login(usuario, password);
            localStorage.setItem('token', data.access_token);
            localStorage.setItem('rol', data.rol);
            localStorage.setItem('nombre', data.nombre);
            
            if (data.rol === 'supervisor') {
                navigate('/dashboard');
            } else {
                navigate('/carga-diaria');
            }
        } catch (err) {
            setError(err.message);
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
                
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                
                <form onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Usuario"
                        value={usuario}
                        onChange={(e) => setUsuario(e.target.value)}
                        required
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
            </Paper>
        </Container>
    );
}

export default Login;