// src/components/granjero/RegistroMortalidad.jsx
import { useState, useEffect } from 'react';
import {
  Card, CardContent, Typography, TextField, Button, Alert,
  FormControl, InputLabel, Select, MenuItem, CircularProgress,
  Box, Chip
} from '@mui/material';
import { Warning as WarningIcon, CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import { mortalidadService } from '../../services/mortalidadService';
import { lotesService } from '../../services/lotesService';

function RegistroMortalidad() {
  const [galpones, setGalpones] = useState([]);
  const [selectedGalpon, setSelectedGalpon] = useState('');
  const [loteInfo, setLoteInfo] = useState(null);
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [mortalidad, setMortalidad] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Cargar galpones activos de la granja del usuario
  useEffect(() => {
    cargarGalponesActivos();
  }, []);

  const cargarGalponesActivos = async () => {
    try {
      const response = await lotesService.getGalponesConLoteActivo();
      setGalpones(response.data);
    } catch (err) {
      setError('Error al cargar galpones');
    }
  };

  const handleGalponChange = async (event) => {
    const idGalpon = event.target.value;
    setSelectedGalpon(idGalpon);
    
    if (idGalpon) {
      try {
        const response = await mortalidadService.getEstadisticasLote(idGalpon);
        setLoteInfo(response.data);
      } catch (err) {
        setError('Error al cargar información del lote');
      }
    }
  };

  const validarFecha = () => {
    const hoy = new Date().toISOString().split('T')[0];
    if (fecha > hoy) {
      setError('No se pueden registrar datos con fechas futuras');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedGalpon) {
      setError('Seleccione un galpón');
      return;
    }
    
    if (!mortalidad || parseInt(mortalidad) < 0) {
      setError('Ingrese una cantidad válida de mortalidad');
      return;
    }
    
    if (!validarFecha()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await mortalidadService.registrarMortalidad({
        id_lote: loteInfo.lote.id_lote,
        fecha: fecha,
        mortalidad: parseInt(mortalidad),
        observaciones: observaciones
      });
      
      // Mostrar alerta si supera el 5%
      if (response.data.alerta) {
        setError(`⚠️ ALERTA: La mortandad ha alcanzado ${response.data.porcentaje_mortandad}% (supera el 5% recomendado)`);
      } else {
        setSuccess(`Registro guardado. Mortandad actual: ${response.data.porcentaje_mortandad}%`);
      }
      
      // Resetear formulario
      setMortalidad('');
      setObservaciones('');
      
      // Recargar información actualizada
      const updatedInfo = await mortalidadService.getEstadisticasLote(selectedGalpon);
      setLoteInfo(updatedInfo.data);
      
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrar mortalidad');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
          Registro de Mortandad Diaria
        </Typography>
        
        {error && (
          <Alert severity={error.includes('ALERTA') ? 'error' : 'warning'} sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}
        
        <form onSubmit={handleSubmit}>
          <FormControl fullWidth margin="normal">
            <InputLabel>Seleccione Galpón</InputLabel>
            <Select
              value={selectedGalpon}
              onChange={handleGalponChange}
              label="Seleccione Galpón"
            >
              {galpones.map((galpon) => (
                <MenuItem key={galpon.id_galpon} value={galpon.id_galpon}>
                  {galpon.numero_galpon} - {galpon.nombre_granja}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          {loteInfo && loteInfo.existe_lote_activo && (
            <Box sx={{ mt: 2, p: 2, bgcolor: '#f8fafc', borderRadius: 2 }}>
              <Typography variant="subtitle2" color="textSecondary">
                Información del Lote Activo
              </Typography>
              <Typography>
                Aves iniciales: {loteInfo.lote.cantidad_inicial?.toLocaleString()}
              </Typography>
              <Typography color={loteInfo.lote.alerta_roja ? 'error' : 'textPrimary'}>
                Mortandad acumulada: {loteInfo.lote.porcentaje_mortandad}%
                {loteInfo.lote.alerta_roja && (
                  <Chip 
                    icon={<WarningIcon />} 
                    label="ALERTA >5%" 
                    color="error" 
                    size="small" 
                    sx={{ ml: 1 }}
                  />
                )}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Ingreso: {loteInfo.lote.fecha_ingreso}
              </Typography>
            </Box>
          )}
          
          <TextField
            fullWidth
            label="Fecha"
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            margin="normal"
            required
            InputLabelProps={{ shrink: true }}
          />
          
          <TextField
            fullWidth
            label="Cantidad de Aves Muertas"
            type="number"
            value={mortalidad}
            onChange={(e) => setMortalidad(e.target.value)}
            margin="normal"
            required
            placeholder="0"
            helperText="Ingrese solo el número de aves muertas en esta fecha"
          />
          
          <TextField
            fullWidth
            label="Observaciones (opcional)"
            multiline
            rows={3}
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            margin="normal"
            placeholder="Registrar síntomas, condiciones climáticas, etc."
          />
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading || !selectedGalpon}
            sx={{ mt: 3 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Registrar Mortandad'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default RegistroMortalidad;