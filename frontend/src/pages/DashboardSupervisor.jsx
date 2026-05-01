import { useEffect, useState } from 'react';
import { Container, Grid, Card, CardContent, Typography } from '@mui/material';
import { listarGranjas } from '../api/granjas';

function DashboardSupervisor() {
    const [granjas, setGranjas] = useState([]);
    const nombre = localStorage.getItem('nombre');

    useEffect(() => {
        const cargarDatos = async () => {
            const datos = await listarGranjas();
            setGranjas(datos);
        };
        cargarDatos();
    }, []);

    return (
        <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Typography variant="h4" gutterBottom>
                Bienvenido, {nombre}
            </Typography>
            <Typography variant="h6" color="textSecondary" gutterBottom>
                Dashboard del Supervisor
            </Typography>

            <Grid container spacing={3} sx={{ mt: 2 }}>
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6">Total Granjas</Typography>
                            <Typography variant="h3">{granjas.length}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6">Lotes Activos</Typography>
                            <Typography variant="h3">4</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6">Aves Totales</Typography>
                            <Typography variant="h3">39,800</Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Container>
    );
}

export default DashboardSupervisor;