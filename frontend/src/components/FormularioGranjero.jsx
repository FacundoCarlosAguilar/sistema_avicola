import { useState } from 'react';

function FormularioGranjero() {
    // 1. Preparamos el "molde" para guardar los datos que la persona escriba
    const [formData, setFormData] = useState({
        nombre: '',
        usuario: '',
        password: '',
        id_granja_asignada: ''
    });

    // Estados para mostrar mensajes de éxito o de error en la pantalla
    const [mensaje, setMensaje] = useState('');
    const [error, setError] = useState('');

    // 2. Cada vez que el supervisor escribe algo, lo guardamos en el molde
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // 3. Esta es la función que se ejecuta al apretar el botón "Registrar"
    const handleSubmit = async (e) => {
        e.preventDefault(); // Evita que la página se recargue sola
        setMensaje('');
        setError('');

        try {
            // ¡Acá está nuestro "Thunder Client" automático!
            const response = await fetch('http://localhost:3000/api/usuarios/registrar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': '99', // Por ahora lo dejamos fijo simulando al supervisor
                    'x-user-role': 'supervisor'
                },
                body: JSON.stringify(formData) // Mandamos los datos del formulario
            });

            const data = await response.json();

            if (response.ok) {
                // Si el backend nos dio luz verde (Status 200)
                setMensaje(data.message);
                // Vaciamos el formulario para que quede limpio
                setFormData({ nombre: '', usuario: '', password: '', id_granja_asignada: '' });
            } else {
                // Si el backend nos bloqueó (ej. "Usuario ya existe")
                setError(data.error);
            }
        } catch (err) {
            console.error("Error al conectar:", err);
            setError('Error de conexión. ¿Está prendido el servidor Node?');
        }
    };

    return (
        <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px', maxWidth: '400px', margin: '20px auto' }}>
            <h3>👨‍🌾 Registrar Nuevo Granjero</h3>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                
                <input 
                    type="text" name="nombre" placeholder="Nombre completo" 
                    value={formData.nombre} onChange={handleChange} required 
                />
                
                <input 
                    type="text" name="usuario" placeholder="Nombre de usuario" 
                    value={formData.usuario} onChange={handleChange} required 
                />
                
                <input 
                    type="password" name="password" placeholder="Contraseña" 
                    value={formData.password} onChange={handleChange} required 
                />
                
                <input 
                    type="number" name="id_granja_asignada" placeholder="ID de la Granja (Ej: 1 o 2)" 
                    value={formData.id_granja_asignada} onChange={handleChange} required 
                />
                
                <button type="submit" style={{ padding: '10px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                    Registrar Granjero
                </button>
            </form>

            {/* Acá se muestran los mensajes verde o rojo según qué pase */}
            {mensaje && <p style={{ color: 'green', fontWeight: 'bold' }}>✅ {mensaje}</p>}
            {error && <p style={{ color: 'red', fontWeight: 'bold' }}>❌ {error}</p>}
        </div>
    );
}

export default FormularioGranjero;