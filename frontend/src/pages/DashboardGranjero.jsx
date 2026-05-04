import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container, Grid, Card, CardContent, Typography, Box, IconButton,
    Avatar, Button, TextField, Alert, Chip, Divider, Paper, LinearProgress,
    Table, TableBody, TableRow, TableCell
} from '@mui/material';
import {
    Logout as LogoutIcon,
    Save as SaveIcon,
    Schedule as ScheduleIcon,
    WaterDrop as WaterIcon,
    Thermostat as TempIcon,
    History as HistoryIcon,
    Warning as WarningIcon,
    CheckCircle as CheckCircleIcon,
    TrendingDown as TrendingDownIcon,
    Egg as EggIcon,
    LocalDining as FoodIcon
} from '@mui/icons-material';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '../styles/theme';

// Componente de Tarjeta de Métricas
const MetricCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <Card sx={{ height: '100%' }}>
        <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" color="textSecondary">
                    {title}
                </Typography>
                <Icon sx={{ color: color }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                {value}
            </Typography>
            {subtitle && (
                <Typography variant="caption" color="textSecondary">
                    {subtitle}
                </Typography>
            )}
        </CardContent>
    </Card>
);

// Componente de Header
const Header = ({ nombre, offlineMode, onLogout }) => (
    <Box sx={{ bgcolor: 'primary.main', color: 'white', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <Container maxWidth="xl">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <EggIcon sx={{ fontSize: 28 }} />
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            Avícola <span style={{ color: '#c6a43f' }}>Suite</span>
                        </Typography>
                    </Box>
                    <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        Módulo Granjero
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {offlineMode ? (
                        <Chip icon={<WarningIcon />} label="Modo Offline" color="error" size="small" />
                    ) : (
                        <Chip icon={<CheckCircleIcon />} label="En línea" color="success" size="small" />
                    )}
                    <Chip 
                        avatar={<Avatar sx={{ bgcolor: 'secondary.main' }}>{nombre?.charAt(0) || 'G'}</Avatar>}
                        label={nombre || 'Granjero'}
                        sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'white' }}
                    />
                    <IconButton onClick={onLogout} sx={{ color: 'white' }}>
                        <LogoutIcon />
                    </IconButton>
                </Box>
            </Box>
        </Container>
    </Box>
);

// Componente de Lote Actual
const LoteActualCard = ({ calculo, mortalidadPorcentaje }) => (
    <Card>
        <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Lote Actual - Galpón Norte A
                </Typography>
                <Chip 
                    label={`Día ${calculo?.edad_dias || 0} de 50`} 
                    icon={<ScheduleIcon />} 
                    color="primary" 
                    variant="outlined"
                />
            </Box>
            <Grid container spacing={3}>
                <Grid item xs={6} sm={3}>
                    <Typography variant="body2" color="textSecondary">Aves iniciales</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {calculo?.aves_iniciales?.toLocaleString()}
                    </Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                    <Typography variant="body2" color="textSecondary">Aves actuales</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                        {calculo?.aves_vivas?.toLocaleString()}
                    </Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                    <Typography variant="body2" color="textSecondary">Mortalidad</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#ef4444' }}>
                        {mortalidadPorcentaje}%
                    </Typography>
                    <LinearProgress 
                        variant="determinate" 
                        value={parseFloat(mortalidadPorcentaje) || 0} 
                        sx={{ mt: 1, height: 4, borderRadius: 2 }}
                        color="error"
                    />
                </Grid>
                <Grid item xs={6} sm={3}>
                    <Typography variant="body2" color="textSecondary">FA completado</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        62%
                    </Typography>
                    <LinearProgress 
                        variant="determinate" 
                        value={62} 
                        sx={{ mt: 1, height: 4, borderRadius: 2 }}
                        color="success"
                    />
                </Grid>
            </Grid>
        </CardContent>
    </Card>
);

// Componente de Cálculo de Alimento
const CalculoAlimentoCard = ({ calculo }) => (
    <Card sx={{ height: '100%' }}>
        <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <FoodIcon color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Cálculo de Alimento Automatizado
                </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Table size="small">
                <TableBody>
                    <TableRow>
                        <TableCell component="th" scope="row">Aves vivas</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 500 }}>
                            {calculo?.aves_vivas?.toLocaleString()}
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell component="th" scope="row">Edad del lote</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 500 }}>
                            {calculo?.edad_dias} días
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell component="th" scope="row">Consumo por ave</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 500 }}>
                            {calculo?.consumo_por_ave} g/día
                        </TableCell>
                    </TableRow>
                    <TableRow sx={{ bgcolor: '#f8fafc' }}>
                        <TableCell component="th" scope="row">
                            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                Alimento requerido hoy
                            </Typography>
                        </TableCell>
                        <TableCell align="right">
                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#c6a43f' }}>
                                {calculo?.alimento_requerido?.toLocaleString()} kg
                            </Typography>
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </CardContent>
    </Card>
);

// Componente de Formulario Registro Diario
const RegistroDiarioForm = ({ 
    mortandad, setMortandad, 
    alimento, setAlimento, 
    novedades, setNovedades,
    calculo,
    sincronizando,
    onSubmit 
}) => (
    <Card sx={{ height: '100%' }}>
        <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Registro Diario
            </Typography>
            <form onSubmit={onSubmit}>
                <TextField
                    fullWidth
                    label="Mortandad del día"
                    type="number"
                    value={mortandad}
                    onChange={(e) => setMortandad(e.target.value)}
                    margin="normal"
                    required
                    placeholder="0"
                    InputProps={{
                        startAdornment: <TrendingDownIcon sx={{ mr: 1, color: '#ef4444' }} />
                    }}
                />
                <TextField
                    fullWidth
                    label="Alimento suministrado (kg)"
                    type="number"
                    value={alimento}
                    onChange={(e) => setAlimento(e.target.value)}
                    margin="normal"
                    required
                    helperText={`Requerido: ${calculo?.alimento_requerido?.toLocaleString() || 0} kg`}
                    InputProps={{
                        startAdornment: <FoodIcon sx={{ mr: 1, color: '#c6a43f' }} />
                    }}
                />
                <TextField
                    fullWidth
                    label="Novedades e incidencias"
                    multiline
                    rows={3}
                    value={novedades}
                    onChange={(e) => setNovedades(e.target.value)}
                    margin="normal"
                    placeholder="Registrar cualquier incidente, observación o anomalía..."
                />
                <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    startIcon={sincronizando ? <ScheduleIcon /> : <SaveIcon />}
                    disabled={sincronizando}
                    sx={{ mt: 3, py: 1.5, textTransform: 'none', borderRadius: 2 }}
                >
                    {sincronizando ? 'Guardando...' : 'Registrar Datos'}
                </Button>
            </form>
        </CardContent>
    </Card>
);

// Componente de Condiciones Galpón
const CondicionesGalponCard = ({ calculo }) => (
    <Card sx={{ height: '100%' }}>
        <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Condiciones del Galpón
            </Typography>
            <Grid container spacing={2}>
                <Grid item xs={6}>
                    <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 2, 
                        p: 1.5, 
                        bgcolor: '#fef3c7', 
                        borderRadius: 2 
                    }}>
                        <TempIcon sx={{ color: '#d97706' }} />
                        <Box>
                            <Typography variant="caption" color="textSecondary">Temperatura</Typography>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>{calculo?.temperatura}°C</Typography>
                        </Box>
                    </Box>
                </Grid>
                <Grid item xs={6}>
                    <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 2, 
                        p: 1.5, 
                        bgcolor: '#dbeafe', 
                        borderRadius: 2 
                    }}>
                        <WaterIcon sx={{ color: '#2563eb' }} />
                        <Box>
                            <Typography variant="caption" color="textSecondary">Humedad</Typography>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>{calculo?.humedad}%</Typography>
                        </Box>
                    </Box>
                </Grid>
            </Grid>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="body2" color="textSecondary">Próximo pesaje</Typography>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {calculo?.proximoPesaje}
                    </Typography>
                </Box>
                <Button 
                    size="small" 
                    startIcon={<HistoryIcon />}
                    sx={{ textTransform: 'none' }}
                >
                    Ver Historial
                </Button>
            </Box>
        </CardContent>
    </Card>
);

// Componente de Últimos Registros
const UltimosRegistrosCard = () => {
    const registros = [
        { fecha: '2026-04-30', mortandad: 3, alimento: 1650, dia: 25 },
        { fecha: '2026-04-29', mortandad: 2, alimento: 1640, dia: 24 },
        { fecha: '2026-04-28', mortandad: 4, alimento: 1620, dia: 23 },
        { fecha: '2026-04-27', mortandad: 1, alimento: 1610, dia: 22 },
    ];

    return (
        <Card sx={{ height: '100%' }}>
            <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Últimos Registros
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                    {registros.map((reg, idx) => (
                        <Paper 
                            key={idx} 
                            elevation={0}
                            sx={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center', 
                                p: 1.5,
                                mb: 1,
                                bgcolor: '#f8fafc',
                                borderRadius: 2
                            }}
                        >
                            <Box>
                                <Typography variant="body2" color="textSecondary">
                                    {reg.fecha}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                    Día {reg.dia}
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Chip 
                                    label={`🪦 ${reg.mortandad}`} 
                                    size="small" 
                                    variant="outlined"
                                    color="error"
                                />
                                <Chip 
                                    label={`🍗 ${reg.alimento} kg`} 
                                    size="small" 
                                    variant="outlined"
                                    color="primary"
                                />
                            </Box>
                        </Paper>
                    ))}
                </Box>
            </CardContent>
        </Card>
    );
};

// Componente Principal
function DashboardGranjero() {
    // Estados
    const [mortandad, setMortandad] = useState('');
    const [alimento, setAlimento] = useState('');
    const [novedades, setNovedades] = useState('');
    const [calculo, setCalculo] = useState(null);
    const [mensaje, setMensaje] = useState(null);
    const [sincronizando, setSincronizando] = useState(false);
    const [offlineMode, setOfflineMode] = useState(!navigator.onLine);
    
    const nombre = localStorage.getItem('nombre') || 'Granjero';
    const navigate = useNavigate();
    const mortalidadPorcentaje = calculo 
        ? ((calculo.mortalidad_acumulada / calculo.aves_iniciales) * 100).toFixed(1)
        : '0';

    // Efectos
    useEffect(() => {
        // Datos mock del lote
        setCalculo({
            aves_vivas: 9980,
            aves_iniciales: 10000,
            edad_dias: 25,
            consumo_por_ave: 180,
            alimento_requerido: 1764,
            fecha: new Date().toLocaleDateString(),
            proximoPesaje: '2026-05-05',
            temperatura: 28,
            humedad: 65,
            mortalidad_acumulada: 20,
            conversion: 1.82
        });

        // Listeners de conexión
        const handleOnline = () => setOfflineMode(false);
        const handleOffline = () => setOfflineMode(true);
        
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Handlers
    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!mortandad || !alimento) {
            setMensaje({ type: 'error', text: 'Por favor complete los campos obligatorios' });
            setTimeout(() => setMensaje(null), 3000);
            return;
        }
        
        setSincronizando(true);
        
        // Simular envío
        setTimeout(() => {
            if (!navigator.onLine) {
                setMensaje({ 
                    type: 'warning', 
                    text: '⚠️ Sin conexión a internet. Los datos se guardarán localmente.' 
                });
                // Aquí guardarían en localStorage/indexedDB
            } else {
                setMensaje({ 
                    type: 'success', 
                    text: '✅ Datos sincronizados correctamente con el servidor' 
                });
            }
            
            // Limpiar formulario
            setMortandad('');
            setAlimento('');
            setNovedades('');
            setSincronizando(false);
            
            setTimeout(() => setMensaje(null), 4000);
        }, 1500);
    };

    return (
        <ThemeProvider theme={theme}>
            <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
                <Header 
                    nombre={nombre}
                    offlineMode={offlineMode}
                    onLogout={handleLogout}
                />

                <Container maxWidth="xl" sx={{ py: 4 }}>
                    {/* Mensaje de notificación */}
                    {mensaje && (
                        <Alert 
                            severity={mensaje.type === 'success' ? 'success' : 
                                    mensaje.type === 'warning' ? 'warning' : 'error'} 
                            sx={{ mb: 3, borderRadius: 2 }}
                            onClose={() => setMensaje(null)}
                        >
                            {mensaje.text}
                        </Alert>
                    )}

                    {/* Contenido principal */}
                    <Grid container spacing={3}>
                        {/* Lote Actual */}
                        <Grid item xs={12}>
                            <LoteActualCard 
                                calculo={calculo}
                                mortalidadPorcentaje={mortalidadPorcentaje}
                            />
                        </Grid>

                        {/* Cálculo de Alimento */}
                        <Grid item xs={12} md={6}>
                            <CalculoAlimentoCard calculo={calculo} />
                        </Grid>

                        {/* Formulario Registro */}
                        <Grid item xs={12} md={6}>
                            <RegistroDiarioForm 
                                mortandad={mortandad}
                                setMortandad={setMortandad}
                                alimento={alimento}
                                setAlimento={setAlimento}
                                novedades={novedades}
                                setNovedades={setNovedades}
                                calculo={calculo}
                                sincronizando={sincronizando}
                                onSubmit={handleSubmit}
                            />
                        </Grid>

                        {/* Condiciones del Galpón */}
                        <Grid item xs={12} md={6}>
                            <CondicionesGalponCard calculo={calculo} />
                        </Grid>

                        {/* Últimos Registros */}
                        <Grid item xs={12} md={6}>
                            <UltimosRegistrosCard />
                        </Grid>
                    </Grid>
                </Container>
            </Box>
        </ThemeProvider>
    );
}

export default DashboardGranjero;