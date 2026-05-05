import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import DashboardSupervisor from './pages/DashboardSupervisor';
import DashboardGranjero from './pages/DashboardGranjero';

// IMPORTAMOS EL LAYOUT NUEVO
import Layout from './components/Layout';

// Tu componente de seguridad (¡Intocable!)
function PrivateRoute({ children, allowedRoles }) {
    const token = localStorage.getItem('token');
    const rol = localStorage.getItem('rol');
    
    if (!token) {
        return <Navigate to="/login" />;
    }
    
    if (allowedRoles && !allowedRoles.includes(rol)) {
        return <Navigate to="/login" />;
    }
    
    return children;
}

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* RUTA PÚBLICA: Sin Layout (sin Footer) */}
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<Navigate to="/login" />} />
                
                {/* RUTAS PRIVADAS Y CON DISEÑO: Envueltas en el Layout */}
                <Route element={<Layout />}>
                    
                    <Route 
                        path="/dashboard" 
                        element={
                            <PrivateRoute allowedRoles={['supervisor']}>
                                <DashboardSupervisor />
                            </PrivateRoute>
                        } 
                    />
                    
                    <Route 
                        path="/carga-diaria" 
                        element={
                            <PrivateRoute allowedRoles={['granjero']}>
                                <DashboardGranjero />
                            </PrivateRoute>
                        } 
                    />

                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;