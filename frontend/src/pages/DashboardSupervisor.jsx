import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container, Grid, Card, CardContent, Typography, Box, IconButton,
    Avatar, Button, Divider, Chip, Table, TableBody, TableRow, TableCell,
    LinearProgress, Tooltip, Menu, MenuItem, ListItemIcon,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField
} from '@mui/material';
import {
    Logout as LogoutIcon,
    BusinessCenter as BusinessIcon,
    Inventory as LoteIcon,
    Pets as AvesIcon,
    TrendingUp as TrendingUpIcon,
    Assessment as ReportIcon,
    People as UsersIcon,
    LocalHospital as HealthIcon,
    Settings as SettingsIcon,
    ExpandMore as ExpandMoreIcon,
    Refresh as RefreshIcon,
    Download as DownloadIcon,
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Visibility as ViewIcon
} from '@mui/icons-material';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '../styles/theme';

function DashboardSupervisor() {
    const [granjas, setGranjas] = useState([]);
    const [lotes, setLotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [anchorEl, setAnchorEl] = useState(null);
    const [openModal, setOpenModal] = useState(false);
    const [modalMode, setModalMode] = useState('view');
    const [granjaActual, setGranjaActual] = useState({ nombre: '', ubicacion: '', activa: 1 });
    const [openPrefs, setOpenOpenPrefs] = useState(false);
    const [darkMode, setDarkMode] = useState(false); 

    const handleOpenCreate = () => {
        setGranjaActual({ nombre: '', ubicacion: '', activa: 1 });
        setModalMode('create');
        setOpenModal(true);
    };

    const handleOpenEdit = (granja) => {
        setGranjaActual(granja);
        setModalMode('edit');
        setOpenModal(true);
    };

    const handleOpenView = (granja) => {
        setGranjaActual(granja);
        setModalMode('view');
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
    };

    const handleSaveGranja = () => {
        console.log("Guardando datos:", granjaActual);
        
        if (modalMode === 'create') {
            setGranjas([...granjas, { ...granjaActual, id: Date.now() }]);
        } else if (modalMode === 'edit') {
            setGranjas(granjas.map(g => g.id === granjaActual.id ? granjaActual : g));
        }
        
        setOpenModal(false);
    };

    const handleDeleteGranja = (id) => {
        // Acá iría tu llamado DELETE al backend
        console.log("Eliminando granja con id:", id);
        
        // Actualizamos visualmente la tabla filtrando la que borramos
        setGranjas(granjas.filter(g => g.id !== id));
    };
    const nombre = localStorage.getItem('nombre');
    const navigate = useNavigate();

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        setLoading(true);
        try {
            const [granjasRes, lotesRes] = await Promise.all([
                fetch('http://localhost:8000/api/granjas'),
                fetch('http://localhost:8000/api/lotes')
            ]);
            setGranjas(await granjasRes.json());
            setLotes(await lotesRes.json());
        } catch (error) {
            console.error('Error:', error);
        }
        setLoading(false);
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
    const handleMenuClose = () => setAnchorEl(null);

    const totalAves = lotes.reduce((sum, lote) => sum + (lote.cantidad_aves || 0), 0);
    const totalLotesActivos = lotes.filter(l => l.activo === 1 || l.activo === true).length;
    const totalGranjasActivas = granjas.length;

    const metrics = [
        {
            label: 'Granjas Activas',
            value: totalGranjasActivas,
            icon: <BusinessIcon />,
            change: '+2',
            changeType: 'positive',
            color: '#1a3b2f',
            bgColor: '#e8f0ea'
        },
        {
            label: 'Lotes en Producción',
            value: totalLotesActivos,
            icon: <LoteIcon />,
            change: '+1',
            changeType: 'positive',
            color: '#c6a43f',
            bgColor: '#faf8f0'
        },
        {
            label: 'Aves Totales',
            value: totalAves.toLocaleString(),
            icon: <AvesIcon />,
            change: '-2%',
            changeType: 'negative',
            color: '#3b82f6',
            bgColor: '#eff6ff'
        },
        {
            label: 'Índice de Conversión',
            value: '1.82',
            icon: <TrendingUpIcon />,
            change: '+0.05',
            changeType: 'positive',
            color: '#10b981',
            bgColor: '#ecfdf5'
        }
    ];

    const quickActions = [
        { label: 'Gestión de Granjas', icon: <BusinessIcon />, action: () => alert('Módulo en desarrollo') },
        { label: 'Gestión de Lotes', icon: <LoteIcon />, action: () => alert('Módulo en desarrollo') },
        { label: 'Usuarios y Roles', icon: <UsersIcon />, action: () => alert('Módulo en desarrollo') },
        { label: 'Trazabilidad Sanitaria', icon: <HealthIcon />, action: () => alert('Módulo en desarrollo') },
        { label: 'Reportes Ejecutivos', icon: <ReportIcon />, action: () => alert('Módulo en desarrollo') },
        { label: 'Configuración', icon: <SettingsIcon />, action: () => alert('Módulo en desarrollo') },
    ];

    const ultimosMovimientos = [
        { fecha: '2026-05-01', tipo: 'Registro de mortandad', granja: 'Granja Norte', usuario: 'Pedro López', status: 'completado' },
        { fecha: '2026-04-30', tipo: 'Nuevo lote ingresado', granja: 'Granja Sur', usuario: 'Carlos Martínez', status: 'completado' },
        { fecha: '2026-04-29', tipo: 'Aplicación de vacuna', granja: 'Granja Norte', usuario: 'Pedro López', status: 'completado' },
        { fecha: '2026-04-28', tipo: 'Pesaje semanal', granja: 'Granja Este', usuario: 'Admin', status: 'pendiente' },
    ];

    return (
        <ThemeProvider theme={theme}>
            <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
                {/* Header corporativo */}
                <Box sx={{ bgcolor: 'primary.main', color: 'white', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <Container maxWidth="lg">
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Box component="span" sx={{ fontSize: 28 }}></Box>
                                    <Typography variant="h6" sx={{ fontWeight: 600, letterSpacing: '-0.5px' }}>
                                        Avícola <span style={{ color: '#c6a43f' }}>Suite</span>
                                    </Typography>
                                </Box>
                                <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
                                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                    Panel de Control Ejecutivo
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Tooltip title="Actualizar datos">
                                    <IconButton sx={{ color: 'white' }} onClick={cargarDatos}>
                                        <RefreshIcon />
                                    </IconButton>
                                </Tooltip>
                                <Chip 
                                    avatar={<Avatar sx={{ bgcolor: 'secondary.main', width: 32, height: 32 }}>A</Avatar>}
                                    label={nombre || 'Administrador'}
                                    onClick={handleMenuOpen}
                                    icon={<ExpandMoreIcon />}
                                    sx={{ 
                                        bgcolor: 'rgba(255,255,255,0.1)', 
                                        color: 'white',
                                        '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
                                    }}
                                />
                                <Tooltip title="Cerrar sesión">
                                    <IconButton onClick={handleLogout} sx={{ color: 'white' }}>
                                        <LogoutIcon />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                        </Box>
                    </Container>
                </Box>

                {/* Menú de usuario */}
                <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                    <MenuItem>
                        <ListItemIcon><Avatar sx={{ width: 24, height: 24 }}>A</Avatar></ListItemIcon>
                        <Typography variant="body2">Mi Perfil</Typography>
                    </MenuItem>
                    <MenuItem>
                        <ListItemIcon><SettingsIcon fontSize="small" /></ListItemIcon>
                        <Typography variant="body2">Preferencias</Typography>
                    </MenuItem>
                    <Divider />
                    <MenuItem onClick={handleLogout}>
                        <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>
                        <Typography variant="body2">Cerrar sesión</Typography>
                    </MenuItem>
                    
                </Menu>

                <Container maxWidth="lg" sx={{ py: 4 }}>
                    {/* Métricas principales */}
                    <Grid container spacing={3} sx={{ mb: 4 }}justifyContent="center">
                        {metrics.map((metric, idx) => (
                            <Grid item xs={12} sm={6} md={3} key={idx}>
                                <Card>
                                    <CardContent>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <Box>
                                                <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 500 }}>
                                                    {metric.label}
                                                </Typography>
                                                <Typography variant="h4" sx={{ fontWeight: 700, mt: 1 }}>
                                                    {metric.value}
                                                </Typography>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                                                    <Typography variant="caption" color={metric.changeType === 'positive' ? 'success.main' : 'error.main'}>
                                                        {metric.change}
                                                    </Typography>
                                                    <Typography variant="caption" color="textSecondary">
                                                        vs período anterior
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            <Avatar sx={{ bgcolor: metric.bgColor, color: metric.color, width: 48, height: 48 }}>
                                                {metric.icon}
                                            </Avatar>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>

                    {/* Acciones rápidas */}
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                            Acciones Rápidas
                        </Typography>
                        <Grid container spacing={2} justifyContent="center">
                            {quickActions.map((action, idx) => (
                                <Grid item xs={6} sm={4} md={2} key={idx}>
                                    <Button
                                        fullWidth
                                        variant="outlined"
                                        onClick={action.action}
                                        sx={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            gap: 1,
                                            textTransform: 'none',
                                            py: 2,
                                            borderColor: '#e2e8f0',
                                            color: '#1e293b',
                                            height: '100%',
                                            '&:hover': {
                                                borderColor: 'primary.main',
                                                bgcolor: '#f8fafc'
                                            }
                                        }}
                                    >
                                        <Box sx={{ color: 'primary.main' }}>{action.icon}</Box>
                                        <Typography variant="caption" sx={{ fontWeight: 600, textAlign: 'center', lineHeight: 1.2 }}>
                                            {action.label}
                                        </Typography>
                                    </Button>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>

                    <Grid container spacing={3} justifyContent="center">
                        {/* Lista de granjas */}
                        <Grid item xs={12} md={7}>
                            <Card>
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                            Granjas Registradas
                                            </Typography>
                                            <Button size="small" startIcon={<AddIcon />} variant="contained" sx={{ bgcolor: 'primary.main' }} onClick={handleOpenCreate}>
                                                Nueva Granja
                                        </Button>
                                    </Box>
                                    <Divider sx={{ mb: 2 }} />
                                    {loading ? (
                                        <LinearProgress />
                                    ) : (
                                        <Table size="small">
                                            <TableBody>
                                                {granjas.map((granja) => (
                                                    <TableRow key={granja.id} hover>
                                                        <TableCell>
                                                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                                                {granja.nombre}
                                                            </Typography>
                                                            <Typography variant="caption" color="textSecondary">
                                                                📍 {granja.ubicacion}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            <Chip 
                                                                label="Activa" 
                                                                size="small" 
                                                                sx={{ bgcolor: '#ecfdf5', color: '#10b981', fontSize: '0.7rem' }}
                                                            />
                                                        </TableCell>
                                                       <TableCell align="right">
                                                            <Tooltip title="Ver detalles">
                                                                <IconButton size="small" onClick={() => handleOpenView(granja)}>
                                                                    <ViewIcon fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                            <Tooltip title="Editar">
                                                                <IconButton size="small" onClick={() => handleOpenEdit(granja)}>
                                                                    <EditIcon fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                            <Tooltip title="Eliminar">
                                                                <IconButton size="small" onClick={() => handleDeleteGranja(granja.id)} color="error">
                                                                    <DeleteIcon fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Últimos movimientos */}
                        <Grid item xs={12} md={4}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                                    Últimos Movimientos
                                    </Typography>
                                    <Divider sx={{ mb: 2 }} />
                                    {ultimosMovimientos.map((mov, idx) => (
                                        <Box key={idx} sx={{ mb: 2, pb: 2, borderBottom: idx < ultimosMovimientos.length - 1 ? '1px solid #e2e8f0' : 'none' }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <Box>
                                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                        {mov.tipo}
                                                    </Typography>
                                                    <Typography variant="caption" color="textSecondary">
                                                        {mov.granja} • {mov.usuario}
                                                    </Typography>
                                                </Box>
                                                <Chip 
                                                    label={mov.status === 'completado' ? 'Completado' : 'Pendiente'}
                                                    size="small"
                                                    sx={{ 
                                                        bgcolor: mov.status === 'completado' ? '#ecfdf5' : '#fffbeb',
                                                        color: mov.status === 'completado' ? '#10b981' : '#f59e0b',
                                                        fontSize: '0.7rem'
                                                    }}
                                                />
                                            </Box>
                                            <Typography variant="caption" color="textSecondary">
                                                {mov.fecha}
                                            </Typography>
                                        </Box>
                                    ))}
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>

                    {/* Rendimiento */}
                    <Card sx={{ mt: 3 }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    📈 Indicadores de Rendimiento
                                </Typography>
                                <Button 
                                    size="small" 
                                    variant="outlined" 
                                    startIcon={<DownloadIcon />}
                                    sx={{ borderColor: '#e2e8f0', color: 'text.secondary', textTransform: 'none' }}
                                >
                                    Exportar reporte
                                </Button>
                            </Box>
                            
                            <Grid container spacing={4}>
                                <Grid item xs={12} md={4}>
                                    <Typography variant="body2" color="textSecondary" gutterBottom>
                                        Mortandad Acumulada
                                    </Typography>
                                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#ef4444' }}>
                                        2.4%
                                    </Typography>
                                    <LinearProgress variant="determinate" value={2.4} sx={{ mt: 1, height: 6, borderRadius: 3 }} />
                                    <Typography variant="caption" color="textSecondary">
                                        Meta: &lt;5%
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <Typography variant="body2" color="textSecondary" gutterBottom>
                                        Conversión Alimenticia
                                    </Typography>
                                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#10b981' }}>
                                        1.82
                                    </Typography>
                                    <LinearProgress variant="determinate" value={72} sx={{ mt: 1, height: 6, borderRadius: 3 }} />
                                    <Typography variant="caption" color="textSecondary">
                                        Meta: 1.75
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <Typography variant="body2" color="textSecondary" gutterBottom>
                                        Eficiencia de Producción
                                    </Typography>
                                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#c6a43f' }}>
                                        85%
                                    </Typography>
                                    <LinearProgress variant="determinate" value={85} sx={{ mt: 1, height: 6, borderRadius: 3 }} />
                                    <Typography variant="caption" color="textSecondary">
                                        Meta: 90%
                                    </Typography>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Container>
            </Box>
            <Dialog 
                    open={openModal} 
                    onClose={handleCloseModal}
                    PaperProps={{
                        sx: { borderRadius: 3, padding: 1, minWidth: '400px' }
                    }}
                >
                    <DialogTitle sx={{ fontWeight: 600 }}>
                        {modalMode === 'create' && 'Registrar Nueva Granja'}
                        {modalMode === 'edit' && 'Editar Granja'}
                        {modalMode === 'view' && 'Detalles de la Granja'}
                    </DialogTitle>
                    <DialogContent>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                            <TextField
                                label="Nombre de la Granja"
                                fullWidth
                                variant="outlined"
                                value={granjaActual.nombre || ''}
                                onChange={(e) => setGranjaActual({ ...granjaActual, nombre: e.target.value })}
                                disabled={modalMode === 'view'}
                            />
                            <TextField
                                label="Ubicación"
                                fullWidth
                                variant="outlined"
                                value={granjaActual.ubicacion || ''}
                                onChange={(e) => setGranjaActual({ ...granjaActual, ubicacion: e.target.value })}
                                disabled={modalMode === 'view'}
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 2 }}>
                        <Button onClick={handleCloseModal} sx={{ color: 'text.secondary' }}>
                            {modalMode === 'view' ? 'Cerrar' : 'Cancelar'}
                        </Button>
                        {modalMode !== 'view' && (
                            <Button onClick={handleSaveGranja} variant="contained" sx={{ bgcolor: 'primary.main' }}>
                                Guardar
                            </Button>
                        )}
                    </DialogActions>
                </Dialog>
        </ThemeProvider>
    );
}

export default DashboardSupervisor;