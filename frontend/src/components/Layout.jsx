import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Footer from './Footer';

const Layout = () => {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            
            {/* Contenedor dinámico que empuja el footer hacia abajo */}
            <Box sx={{ flexGrow: 1 }}>
                <Outlet /> 
            </Box>

            {/* El Footer global */}
            <Footer />
        </Box>
    );
};

export default Layout;