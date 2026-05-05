import * as XLSX from 'xlsx';
import logoOficial from '../assets/logo.png';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container, Grid, Card, CardContent, Typography, Box, IconButton,
    Avatar, Button, TextField, Alert, Chip, Divider, Paper, LinearProgress,
    Tabs, Tab, CircularProgress
} from '@mui/material';
import {
    Logout as LogoutIcon,
    Schedule as ScheduleIcon,
    Warning as WarningIcon,
    CheckCircle as CheckCircleIcon,
    Search as SearchIcon,
    Download as DownloadIcon
} from '@mui/icons-material';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '../styles/theme';
import { apiService } from '../services/apiService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as TooltipGrafico, ResponsiveContainer } from 'recharts';

const HistorialRegistros = () => {
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');
    const [registros, setRegistros] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const hoy = new Date();
        const hace7Dias = new Date();
        hace7Dias.setDate(hoy.getDate() - 7);
        
        setFechaFin(hoy.toISOString().split('T')[0]);
        setFechaInicio(hace7Dias.toISOString().split('T')[0]);
        
        cargarRegistros();
    }, []);

    const cargarRegistros = async () => {
        setLoading(true);
        try {
            const data = await apiService.obtenerRegistros(fechaInicio, fechaFin);
            if (data && data.length > 0) {
                const formateados = data.map(reg => ({
                    id: reg.id,
                    fecha: reg.fecha,
                    galpon: reg.galpon_nombre || 'Galpón Norte A',
                    mortalidad: reg.mortandad || 0,
                    alimento: reg.alimento_kg || 0,
                    observaciones: reg.novedades || '-'
                }));
                setRegistros(formateados);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleBuscar = () => {
        cargarRegistros();
    };

    const totalRegistros = registros.length;
    const totalMortandad = registros.reduce((sum, r) => sum + (r.mortalidad || 0), 0);
    const promedio = totalRegistros > 0 ? (totalMortandad / totalRegistros).toFixed(1) : 0;
    const totalAlimento = registros.reduce((sum, r) => sum + (r.alimento || 0), 0);

    const exportarExcel = () => {
        const datosExportar = registros.map(reg => ({
            'FECHA': reg.fecha,
            'GALPÓN': reg.galpon,
            'MORTANDAD (aves)': reg.mortalidad,
            'ALIMENTO (kg)': reg.alimento,
            'OBSERVACIONES': reg.observaciones
        }));

        const resumenExportar = [
            ['ARGEAVE - SISTEMA AVÍCOLA'],
            [''],
            ['REPORTE DE REGISTROS DIARIOS'],
            [''],
            ['GRANJA:', 'Granja Norte'],
            ['PERIODO:', `${fechaInicio} al ${fechaFin}`],
            ['FECHA EXPORTACIÓN:', new Date().toLocaleString()],
            [''],
            ['INDICADORES'],
            ['Total Registros:', totalRegistros],
            ['Total Mortandad:', `${totalMortandad} aves`],
            ['Total Alimento:', `${totalAlimento} kg`],
            ['Promedio Mortandad Diaria:', `${promedio} aves/día`],
        ];

        const wb = XLSX.utils.book_new();
        const wsDatos = XLSX.utils.json_to_sheet(datosExportar);
        XLSX.utils.book_append_sheet(wb, wsDatos, 'Registros Diarios');
        const wsResumen = XLSX.utils.aoa_to_sheet(resumenExportar);
        XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen');
        
        XLSX.writeFile(wb, `Reporte_Registros_${fechaInicio}_${fechaFin}.xlsx`);
    };

    return (
        <Box>
            <Paper sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={4}>
                        <TextField
                            fullWidth
                            label="Fecha Inicio"
                            type="date"
                            size="small"
                            value={fechaInicio}
                            onChange={(e) => setFechaInicio(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <TextField
                            fullWidth
                            label="Fecha Fin"
                            type="date"
                            size="small"
                            value={fechaFin}
                            onChange={(e) => setFechaFin(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Button
                            fullWidth
                            variant="contained"
                            startIcon={<SearchIcon />}
                            onClick={handleBuscar}
                        >
                            Buscar
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            {registros.length > 0 && (
                <Paper sx={{ p: 2, mb: 3, bgcolor: '#f0fdf4' }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={3}>
                            <Typography variant="caption" color="textSecondary">Total Registros</Typography>
                            <Typography variant="h6">{totalRegistros}</Typography>
                        </Grid>
                        <Grid item xs={3}>
                            <Typography variant="caption" color="textSecondary">Total Mortandad</Typography>
                            <Typography variant="h6" color="error">{totalMortandad} aves</Typography>
                        </Grid>
                        <Grid item xs={3}>
                            <Typography variant="caption" color="textSecondary">Total Alimento</Typography>
                            <Typography variant="h6" color="primary">{totalAlimento.toLocaleString()} kg</Typography>
                        </Grid>
                        <Grid item xs={3}>
                            <Button
                                fullWidth
                                variant="contained"
                                color="success"
                                size="small"
                                startIcon={<DownloadIcon />}
                                onClick={exportarExcel}
                            >
                                Exportar Excel
                            </Button>
                        </Grid>
                    </Grid>
                    <Divider sx={{ my: 1 }} />
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Typography variant="caption" color="textSecondary">
                                Promedio Diario: {promedio} aves/día
                            </Typography>
                        </Grid>
                    </Grid>
                </Paper>
            )}
            
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <Paper sx={{ width: '100%', overflow: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ backgroundColor: '#f8fafc' }}>
                            <tr>
                                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Fecha</th>
                                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Galpón</th>
                                <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #e5e7eb' }}>Mortandad</th>
                                <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #e5e7eb' }}>Alimento (kg)</th>
                                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Observaciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {registros.length === 0 ? (
                                <tr>
                                    <td colSpan={5} style={{ padding: '32px', textAlign: 'center' }}>
                                        <Typography color="textSecondary">
                                            No hay registros en el período seleccionado
                                        </Typography>
                                    </td>
                                </tr>
                            ) : (
                                registros.map((reg) => (
                                    <tr key={reg.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                        <td style={{ padding: '12px' }}>{reg.fecha}</td>
                                        <td style={{ padding: '12px' }}>{reg.galpon}</td>
                                        <td style={{ padding: '12px', textAlign: 'right' }}>
                                            <Chip 
                                                label={`${reg.mortalidad} aves`}
                                                color={reg.mortalidad > 5 ? 'error' : 'default'}
                                                size="small"
                                            />
                                        </td>
                                        <td style={{ padding: '12px', textAlign: 'right' }}>
                                            {reg.alimento} kg
                                        </td>
                                        <td style={{ padding: '12px' }}>{reg.observaciones}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </Paper>
            )}
        </Box>
    );
};

const RegistroDiarioForm = ({ 
    mortandad, setMortandad, alimento, setAlimento, novedades, setNovedades, calculo, sincronizando, onSubmit 
}) => (
    <Card>
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
                    helperText="Ingrese el número de aves muertas hoy"
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
                    disabled={sincronizando}
                    sx={{ mt: 3, py: 1.5, textTransform: 'none', borderRadius: 2 }}
                >
                    {sincronizando ? 'Guardando...' : 'Registrar Datos'}
                </Button>
            </form>
        </CardContent>
    </Card>
);

function DashboardGranjero() {
    const [mortandad, setMortandad] = useState('');
    const [alimento, setAlimento] = useState('');
    const [novedades, setNovedades] = useState('');
    const [calculo, setCalculo] = useState(null);
    const [mensaje, setMensaje] = useState(null);
    const [sincronizando, setSincronizando] = useState(false);
    const [offlineMode, setOfflineMode] = useState(!navigator.onLine);
    const [tabValue, setTabValue] = useState(0);
    
    const nombre = localStorage.getItem('nombre') || 'Granjero';
    const navigate = useNavigate();
    
    const mortalidadPorcentaje = calculo 
        ? ((calculo.mortalidad_acumulada / calculo.aves_iniciales) * 100).toFixed(1)
        : '0';

    const datosTendencia = [
        { dia: '24/04', mortandad: 2 },
        { dia: '25/04', mortandad: 3 },
        { dia: '26/04', mortandad: 1 },
        { dia: '27/04', mortandad: 4 },
        { dia: '28/04', mortandad: 4 },
        { dia: '29/04', mortandad: 2 },
        { dia: '30/04', mortandad: 3 }
    ];

    const cargarDatosReales = async () => {
        try {
            const loteActivo = await apiService.obtenerLoteActivo(1);
            
            if (loteActivo && loteActivo.existe) {
                const lote = loteActivo.lote;
                const avesVivas = lote.cantidad_aves - loteActivo.total_muertes;
                const dias = Math.floor((new Date() - new Date(lote.fecha_ingreso)) / (1000 * 60 * 60 * 24));
                
                setCalculo({
                    aves_vivas: avesVivas,
                    aves_iniciales: lote.cantidad_aves,
                    edad_dias: dias > 0 ? dias : 1,
                    consumo_por_ave: 180,
                    alimento_requerido: Math.round(avesVivas * 0.180),
                    fecha: new Date().toLocaleDateString(),
                    mortalidad_acumulada: loteActivo.total_muertes,
                    conversion: 1.82,
                    temperatura: 28,
                    humedad: 65
                });
            } else {
                setCalculo({
                    aves_vivas: 9980,
                    aves_iniciales: 10000,
                    edad_dias: 25,
                    consumo_por_ave: 180,
                    alimento_requerido: 1764,
                    fecha: new Date().toLocaleDateString(),
                    mortalidad_acumulada: 20,
                    conversion: 1.82,
                    temperatura: 28,
                    humedad: 65
                });
            }
        } catch (error) {
            setCalculo({
                aves_vivas: 9980,
                aves_iniciales: 10000,
                edad_dias: 25,
                consumo_por_ave: 180,
                alimento_requerido: 1764,
                fecha: new Date().toLocaleDateString(),
                mortalidad_acumulada: 20,
                conversion: 1.82,
                temperatura: 28,
                humedad: 65
            });
        }
    };

    useEffect(() => {
        cargarDatosReales();
        
        const handleOnline = () => setOfflineMode(false);
        const handleOffline = () => setOfflineMode(true);
        
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

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
        
        const registroData = {
            fecha: new Date().toISOString().split('T')[0],
            mortandad: parseInt(mortandad),
            aves_vivas: calculo?.aves_vivas || 9980,
            alimento_kg: parseFloat(alimento),
            novedades: novedades || '',
            id_lote: 1
        };
        
        const result = await apiService.guardarRegistro(registroData);
        
        if (result.success) {
            setMensaje({ 
                type: 'success', 
                text: `Datos guardados en la nube, mortandad: ${result.porcentaje}%` 
            });
            
            await cargarDatosReales(); 
            
            if (result.alerta) {
                setTimeout(() => {
                    setMensaje({ 
                        type: 'warning', 
                        text: 'ALERTA: La mortandad ha superado el 5%' 
                    });
                }, 3000);
            }
            
            setMortandad('');
            setAlimento('');
            setNovedades('');
        } else {
            setMensaje({ type: 'error', text: ' Error al guardar: ' + (result.error || 'Desconocido') });
        }
        
        setSincronizando(false);
        setTimeout(() => setMensaje(null), 4000);
    };

    return (
        <ThemeProvider theme={theme}>
            <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
                <Box sx={{ bgcolor: 'primary.main', color: 'white', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <Container maxWidth="xl">
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Box 
                                        component="img"
                                        src={logoOficial}
                                        alt="ArgeAve Logo"
                                        sx={{ height: 40, width: 'auto' }} 
                                    />
                                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#c6a43f' }}>
                                        ArgeAve
                                    </Typography>
                                </Box>
                                <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
                                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                    Módulo Granjero
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                {offlineMode ? (
                                    <Chip icon={<WarningIcon />} label="Offline" color="error" size="small" />
                                ) : (
                                    <Chip icon={<CheckCircleIcon />} label="En línea" color="success" size="small" />
                                )}
                                <Chip 
                                    avatar={<Avatar sx={{ bgcolor: 'secondary.main' }}>{nombre?.charAt(0) || 'G'}</Avatar>}
                                    label={nombre || 'Granjero'}
                                    sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'white' }}
                                />
                                <IconButton onClick={handleLogout} sx={{ color: 'white' }}>
                                    <LogoutIcon />
                                </IconButton>
                            </Box>
                        </Box>
                    </Container>
                </Box>

                <Container maxWidth="xl" sx={{ py: 4 }}>
                    {mensaje && (
                        <Alert 
                            severity={mensaje.type === 'success' ? 'success' : mensaje.type === 'warning' ? 'warning' : 'error'} 
                            sx={{ mb: 3, borderRadius: 2 }}
                            onClose={() => setMensaje(null)}
                        >
                            {mensaje.text}
                        </Alert>
                    )}

                    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
                            <Tab label="Registro Diario" />
                            <Tab label="Ver Historial de Registros" />
                        </Tabs>
                    </Box>

                    {tabValue === 0 ? (
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={7}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                    <Card>
                                        <CardContent>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                                    Lote Actual - Galpón Norte A
                                                </Typography>
                                                <Chip label={`Día ${calculo?.edad_dias || 0} de 50`} icon={<ScheduleIcon />} color="primary" variant="outlined" />
                                            </Box>
                                            <Grid container spacing={3}>
                                                    <Grid item xs={6} sm={3}>
                                                        <Typography variant="body2" color="textSecondary">Aves iniciales</Typography>
                                                        <Typography variant="h6">{calculo?.aves_iniciales?.toLocaleString()}</Typography>
                                                    </Grid>
                                                    <Grid item xs={6} sm={3}>
                                                        <Typography variant="body2" color="textSecondary">Aves actuales</Typography>
                                                        <Typography variant="h6" sx={{ color: 'primary.main' }}>{calculo?.aves_vivas?.toLocaleString()}</Typography>
                                                    </Grid>
                                                    <Grid item xs={6} sm={3}>
                                                        <Typography variant="body2" color="textSecondary">Mortalidad</Typography>
                                                        <Typography variant="h6" sx={{ color: '#ef4444' }}>{mortalidadPorcentaje}%</Typography>
                                                        <LinearProgress variant="determinate" value={parseFloat(mortalidadPorcentaje) || 0} sx={{ mt: 1, height: 4 }} color="error" />
                                                    </Grid>
                                                    <Grid item xs={6} sm={3}>
                                                        <Typography variant="body2" color="textSecondary">FA completado</Typography>
                                                        <Typography variant="h6">62%</Typography>
                                                        <LinearProgress variant="determinate" value={62} sx={{ mt: 1, height: 4 }} color="success" />
                                                    </Grid>
                                                </Grid>
                                        </CardContent>
                                    </Card>

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
                                </Box>
                            </Grid>

                            <Grid item xs={12} md={5}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                    <Card>
                                        <CardContent>
                                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Cálculo de Alimento Automatizado</Typography>
                                            <Divider sx={{ mb: 2 }} />
                                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                                <tbody>
                                                    <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                                                        <td style={{ padding: '8px' }}>Aves vivas</td>
                                                        <td style={{ padding: '8px', textAlign: 'right' }}>{calculo?.aves_vivas?.toLocaleString()}</td>
                                                    </tr>
                                                    <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                                                        <td style={{ padding: '8px' }}>Edad del lote</td>
                                                        <td style={{ padding: '8px', textAlign: 'right' }}>{calculo?.edad_dias} días</td>
                                                    </tr>
                                                    <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                                                        <td style={{ padding: '8px' }}>Consumo por ave</td>
                                                        <td style={{ padding: '8px', textAlign: 'right' }}>{calculo?.consumo_por_ave} g/día</td>
                                                    </tr>
                                                    <tr style={{ backgroundColor: '#f8fafc' }}>
                                                        <td style={{ padding: '8px' }}><strong>Alimento requerido hoy</strong></td>
                                                        <td style={{ padding: '8px', textAlign: 'right' }}>
                                                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#c6a43f' }}>{calculo?.alimento_requerido?.toLocaleString()} kg</Typography>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardContent>
                                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Últimos Registros</Typography>
                                            <Divider sx={{ mb: 2 }} />
                                            <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                                    <thead>
                                                        <tr style={{ backgroundColor: '#f8fafc' }}>
                                                            <th style={{ padding: '10px', textAlign: 'left' }}>Fecha</th>
                                                            <th style={{ padding: '10px', textAlign: 'right' }}>Mortandad</th>
                                                            <th style={{ padding: '10px', textAlign: 'right' }}>Alimento (kg)</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {[
                                                            { fecha: '2026-04-30', mortandad: 3, alimento: 1650 },
                                                            { fecha: '2026-04-29', mortandad: 2, alimento: 1640 },
                                                            { fecha: '2026-04-28', mortandad: 4, alimento: 1620 },
                                                        ].map((reg, idx) => (
                                                            <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                                                <td style={{ padding: '10px' }}>{reg.fecha}</td>
                                                                <td style={{ padding: '10px', textAlign: 'right' }}>
                                                                    <Chip label={` ${reg.mortandad}`} size="small" variant="outlined" color="error" />
                                                                </td>
                                                                <td style={{ padding: '10px', textAlign: 'right' }}>
                                                                    <Chip label={` ${reg.alimento} kg`} size="small" variant="outlined" color="primary" />
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </Box>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardContent>
                                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                                                Tendencia de Mortandad (Últimos 7 días)
                                            </Typography>
                                            <Box sx={{ width: '100%', height: 300 }}>
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <LineChart data={datosTendencia} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                                        <XAxis dataKey="dia" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                                                        <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                                                        <TooltipGrafico 
                                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                                                        />
                                                        <Line 
                                                            type="monotone" 
                                                            dataKey="mortandad" 
                                                            stroke="#ef4444" 
                                                            strokeWidth={3} 
                                                            dot={{ r: 4, fill: '#ef4444' }} 
                                                            activeDot={{ r: 6 }} 
                                                            name="Aves muertas" 
                                                        />
                                                    </LineChart>
                                                </ResponsiveContainer>
                                            </Box>
                                        </CardContent>
                                    </Card>

                                </Box>
                            </Grid>
                            
                        </Grid>
                    ) : (
                        <HistorialRegistros />
                    )}
                </Container>
            </Box>
        </ThemeProvider>
    );
}

export default DashboardGranjero;