// src/components/granjero/RegistroAlimento.jsx
import { useState, useEffect } from 'react';
import {
  Card, CardContent, Typography, TextField, Button, Alert,
  FormControl, InputLabel, Select, MenuItem, CircularProgress,
  Grid, Paper, Box
} from '@mui/material';
import { alimentoService } from '../../services/alimentoService';

function RegistroAlimento() {
  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split('T')[0],
    fase: 'F1',
    cantidad_recibida_kg: '',
    remito: '',
    observaciones: ''
  });
  
  const [proyeccion, setProyeccion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [calculando, setCalculando] = useState(false);

  // Calcular proyección al cambiar de fase
  useEffect(() => {
    if (formData.fase) {
      calcularProyeccion();
    }
  }, [formData.fase]);

  const calcularProyeccion = async () => {
    setCalculando(true);
    try {
      const response = await alimentoService.getProyeccion(formData.fase);
      setProyeccion(response.data);
    } catch (err) {
      console.error('Error calculando proyección:', err);
    } finally {
      setCalculando(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validarFecha = () => {
    const hoy = new Date().toISOString().split('T')[0];
    if (formData.fecha > hoy) {
      setError('No se pueden registrar ingresos con fechas futuras');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.cantidad_recibida_kg || parseFloat(formData.cantidad_recibida_kg) <= 0) {
      setError('Ingrese una cantidad válida en kilogramos');
      return;
    }
    
    if (!formData.remito) {
      setError('El número de remito es obligatorio');
      return;
    }
    
    if (!validarFecha()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await alimentoService.registrarIngreso(formData);
      
      setSuccess(`✅ Ingreso registrado: ${formData.cantidad_recibida_kg} Kg de fase ${formData.fase}`);
      
      // Actualizar proyección
      setProyeccion(response.data.proyeccion);
      
      // Resetear campos
      setFormData({
        ...formData,
        cantidad_recibida_kg: '',
        remito: '',
        observaciones: ''
      });
      
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrar ingreso');
    } finally {
      setLoading(false);
    }
  };

  const fases = [
    { codigo: 'F1', nombre: 'Pre-Inicio', consumo: '0.25 kg/ave' },
    { codigo: 'F2', nombre: 'Inicio Engorde', consumo: '0.85 kg/ave' },
    { codigo: 'F3', nombre: 'Engorde 1', consumo: '1.0 kg/ave' },
    { codigo: 'F4', nombre: 'Engorde 2', consumo: '1.5 kg/ave' },
    { codigo: 'F5', nombre: 'Terminación', consumo: '2.0 kg/ave' }
  ];

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
          Registro de Ingreso de Alimento
        </Typography>
        
        {error && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Fecha de Recepción"
                name="fecha"
                type="date"
                value={formData.fecha}
                onChange={handleChange}
                margin="normal"
                required
                InputLabelProps={{ shrink: true }}
              />
              
              <FormControl fullWidth margin="normal">
                <InputLabel>Fase de Alimentación</InputLabel>
                <Select
                  name="fase"
                  value={formData.fase}
                  onChange={handleChange}
                  label="Fase de Alimentación"
                >
                  {fases.map((fase) => (
                    <MenuItem key={fase.codigo} value={fase.codigo}>
                      {fase.codigo} - {fase.nombre} ({fase.consumo})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <TextField
                fullWidth
                label="Cantidad Recibida (Kg)"
                name="cantidad_recibida_kg"
                type="number"
                value={formData.cantidad_recibida_kg}
                onChange={handleChange}
                margin="normal"
                required
                placeholder="0.00"
                inputProps={{ step: '0.01' }}
              />
              
              <TextField
                fullWidth
                label="Número de Remito"
                name="remito"
                value={formData.remito}
                onChange={handleChange}
                margin="normal"
                required
              />
              
              <TextField
                fullWidth
                label="Observaciones"
                name="observaciones"
                multiline
                rows={2}
                value={formData.observaciones}
                onChange={handleChange}
                margin="normal"
              />
              
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ mt: 3 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Registrar Ingreso'}
              </Button>
            </form>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, bgcolor: '#f8fafc' }}>
              <Typography variant="h6" gutterBottom>
                📊 Proyección de Alimento
              </Typography>
              
              {calculando ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : proyeccion ? (
                <>
                  <Typography variant="body2" color="textSecondary">
                    Población total de aves
                  </Typography>
                  <Typography variant="h6">
                    {proyeccion.poblacion_total?.toLocaleString()} aves
                  </Typography>
                  
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                    Consumo por ave en fase {formData.fase}
                  </Typography>
                  <Typography variant="h6">
                    {proyeccion.consumo_por_ave} kg/ave
                  </Typography>
                  
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                    Requerimiento total
                  </Typography>
                  <Typography variant="h4" sx={{ color: '#c6a43f', fontWeight: 600 }}>
                    {proyeccion.kilos_requeridos?.toLocaleString()} kg
                  </Typography>
                  
                  <Box sx={{ mt: 2, p: 1.5, bgcolor: 'white', borderRadius: 1 }}>
                    <Typography variant="body2">
                      <strong>✅ Recibido:</strong> {proyeccion.kilos_recibidos?.toLocaleString()} kg
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color={proyeccion.kilos_faltantes > 0 ? 'error' : 'success'}
                    >
                      <strong>🚨 Faltante:</strong> {proyeccion.kilos_faltantes?.toLocaleString()} kg
                    </Typography>
                  </Box>
                </>
              ) : (
                <Typography color="textSecondary">
                  Seleccione una fase para ver la proyección
                </Typography>
              )}
            </Paper>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}

export default RegistroAlimento;