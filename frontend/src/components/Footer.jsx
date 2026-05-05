import { Box, Typography, Container, Link } from '@mui/material';

const Footer = () => {
    return (
        <Box 
            component="footer" 
            sx={{ 
                bgcolor: '#f8fafc', 
                py: 3,              
                borderTop: '1px solid #e5e7eb', 
                mt: 'auto'          
            }}
        >
            <Container maxWidth="xl">
                <Typography variant="body2" color="text.secondary" align="center">
                    {'© '}
                    {new Date().getFullYear()}{' '}
                    <Link color="inherit" href="#" sx={{ fontWeight: 600, textDecoration: 'none' }}>
                        ArgeAve
                    </Link>{' '}
                    - Todos los derechos reservados.
                </Typography>
                <Typography variant="caption" color="text.secondary" align="center" sx={{ display: 'block', mt: 0.5 }}>
                    Versión 1.0.0 | Sistema de Gestión Avícola
                </Typography>
            </Container>
        </Box>
    );
};

export default Footer;