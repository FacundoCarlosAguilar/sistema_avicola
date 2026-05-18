import React, { useEffect, useState } from 'react';
import {
    Container, Card, CardContent, Typography, Box, IconButton,
    Button, Divider, Chip, Table, TableBody, TableRow, TableCell,
    LinearProgress, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Grid
} from '@mui/material';
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    Visibility as ViewIcon,
    ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export default function GestionLotes() {
    const navigate = useNavigate();
    const [lotes, setLotes] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Estados para el Modal (Creación y Visualización)
    const [openModal, setOpenModal] = useState(false);
    const [modalMode, setModalMode] = useState('view'); // 'create' o 'view'
    const [loteActual, setLoteActual] = useState({ 
        fecha_ingreso: '', 
        cantidad_aves: '', 
        proveedor: '', 
        id_galpon: '', 
        cantidad_galpon: '',
        activo: 1 
    });

    useEffect(() => {
        cargarLotes();
    }, []);

    const cargarLotes = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:8000/api/lotes');
            if (response.ok) {
                setLotes(await response.json());
            }
        } catch (error) {
            console.error('Error al conectar con la API de lotes:', error);
            // Datos estáticos de respaldo para que puedas trabajar aunque el backend no esté corriendo
            setLotes([
                { id: 1, fecha_ingreso: '2026-05-10', cantidad_aves: 14500, proveedor: 'Distribuidora Avícola S.A.', id_galpon: 2, cantidad_galpon: 1, activo: 1 },
                { id: 2, fecha_ingreso: '2026-04-18', cantidad_aves: 25480, proveedor: 'Granja Criadores Sur', id_galpon: 5, cantidad_galpon: 2, activo: 1 }
            ]);
        }
        setLoading(false);
    };

    const handleOpenCreate = () => {
        setLoteActual({ fecha_ingreso: '', cantidad_aves: '', proveedor: '', id_galpon: '', cantidad_galpon: '', activo: 1 });
        setModalMode('create');
        setOpenModal(true);
    };

    const handleOpenView = (lote) => {
        setLoteActual(lote);
        setModalMode('view');
        setOpenModal(true);
    };

    const handleSaveLote = async () => {
        if (modalMode === 'create') {
            try {
                const response = await fetch('http://localhost:8000/api/lotes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        fecha_ingreso: loteActual.fecha_ingreso,
                        cantidad_aves: parseInt(loteActual.cantidad_aves),
                        proveedor: loteActual.proveedor,
                        id_galpon: parseInt(loteActual.id_galpon),
                        cantidad_galpon: parseInt(loteActual.cantidad_galpon)
                    })
                });
                if (response.ok) {
                    const nuevoLote = await response.json();
                    setLotes([...lotes, nuevoLote]);
                }
            } catch (error) {
                console.error("Error al guardar en el servidor:", error);
                // Inserción local de prueba por si estás probando solo Frontend
                setLotes([...lotes, { ...loteActual, id: Date.now() }]);
            }
        }
        setOpenModal(false);
    };

    const handleDeleteLote = (id) => {
        console.log("Eliminando lote localmente con ID:", id);
        setLotes(lotes.filter(l => l.id !== id));
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Encabezado con retorno */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconButton onClick={() => navigate('/dashboard')} color="primary">
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                        Módulo Especializado: Gestor de Lotes
                    </Typography>
                </Box>
                <Button 
                    variant="contained" 
                    color="secondary" 
                    startIcon={<AddIcon />}
                    onClick={handleOpenCreate}
                    sx={{ textTransform: 'none', fontWeight: 600 }}
                >
                    Ingresar Nuevo Lote
                </Button>
            </Box>

            <Divider sx={{ mb: 4 }} />

            {/* Tabla Principal */}
            <Card sx={{ borderRadius: 2, boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.05)' }}>
                <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                        Monitoreo y Control General de Lotes
                    </Typography>
                    {loading ? (
                        <LinearProgress color="secondary" />
                    ) : (
                        <Table size="medium">
                            <TableBody>
                                <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                                    <TableCell><b>ID Lote</b></TableCell>
                                    <TableCell><b>Proveedor</b></TableCell>
                                    <TableCell><b>Fecha Ingreso</b></TableCell>
                                    <TableCell><b>Aves Iniciales</b></TableCell>
                                    <TableCell><b>Galpón Asignado</b></TableCell>
                                    <TableCell><b>Galpones Ocupados</b></TableCell>
                                    <TableCell><b>Estado</b></TableCell>
                                    <TableCell align="right"><b>Acciones</b></TableCell>
                                </TableRow>

                                {lotes.map((lote) => (
                                    <TableRow key={lote.id} hover>
                                        <TableCell sx={{ fontWeight: 600 }}>#{lote.id}</TableCell>
                                        <TableCell>{lote.proveedor}</TableCell>
                                        <TableCell>{lote.fecha_ingreso}</TableCell>
                                        <TableCell>{lote.cantidad_aves?.toLocaleString()}</TableCell>
                                        <TableCell>Galpón {lote.id_galpon}</TableCell>
                                        <TableCell>{lote.cantidad_galpon || 1} galpón(es)</TableCell>
                                        <TableCell>
                                            <Chip 
                                                label={lote.activo ? "En Crianza" : "Cerrado"} 
                                                color={lote.activo ? "success" : "default"} 
                                                size="small" 
                                                sx={{ fontSize: '0.75rem', fontWeight: 500 }}
                                            />
                                        </TableCell>
                                        <TableCell align="right">
                                            <IconButton size="small" onClick={() => handleOpenView(lote)}>
                                                <ViewIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton size="small" onClick={() => handleDeleteLote(lote.id)} color="error">
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* MODAL DE ENTRADA Y DETALLES DE LOTES */}
            <Dialog open={openModal} onClose={() => setOpenModal(false)} PaperProps={{ sx: { borderRadius: 3, padding: 1, minWidth: '450px' } }}>
                <DialogTitle sx={{ fontWeight: 600 }}>
                    {modalMode === 'create' ? 'Registrar Alta de Lote' : 'Detalles e Inspección del Lote'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1.5 }}>
                        <TextField
                            label="Fecha de Ingreso de las Aves"
                            type="date"
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            value={loteActual.fecha_ingreso || ''}
                            onChange={(e) => setLoteActual({ ...loteActual, fecha_ingreso: e.target.value })}
                            disabled={modalMode === 'view'}
                        />
                        <TextField
                            label="Cantidad Inicial de Aves"
                            type="number"
                            fullWidth
                            value={loteActual.cantidad_aves || ''}
                            onChange={(e) => setLoteActual({ ...loteActual, cantidad_aves: e.target.value })}
                            disabled={modalMode === 'view'}
                        />
                        <TextField
                            label="Proveedor / Incubadora"
                            type="text"
                            fullWidth
                            value={loteActual.proveedor || ''}
                            onChange={(e) => setLoteActual({ ...loteActual, proveedor: e.target.value })}
                            disabled={modalMode === 'view'}
                        />
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <TextField
                                    label="ID Galpón Base"
                                    type="number"
                                    fullWidth
                                    value={loteActual.id_galpon || ''}
                                    onChange={(e) => setLoteActual({ ...loteActual, id_galpon: e.target.value })}
                                    disabled={modalMode === 'view'}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    label="Cantidad Galpones"
                                    type="number"
                                    fullWidth
                                    value={loteActual.cantidad_galpon || ''}
                                    onChange={(e) => setLoteActual({ ...loteActual, cantidad_galpon: e.target.value })}
                                    disabled={modalMode === 'view'}
                                />
                            </Grid>
                        </Grid>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setOpenModal(false)} sx={{ color: 'text.secondary', textTransform: 'none' }}>
                        {modalMode === 'view' ? 'Volver' : 'Cancelar'}
                    </Button>
                    {modalMode === 'create' && (
                        <Button onClick={handleSaveLote} variant="contained" color="secondary" sx={{ textTransform: 'none' }}>
                            Guardar Lote
                        </Button>
                    )}
                </DialogActions>
            </Dialog>
        </Container>
    );
}