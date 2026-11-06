// RutaProtegida.jsx
// Envuelve las páginas que requieren sesión
// Sin sesión, lleva al inicio de sesión y recuerda a qué página quería ir la persona (state.desde) para volver allí después de entrar
// server responde 401

import { Navigate, useLocation } from 'react-router';

import { useSesion } from '../../contexto/SesionContexto.jsx';

function RutaProtegida({ children }) {
    const { usuario } = useSesion();
    const ubicacion = useLocation();

    if (!usuario) {
        return <Navigate to="/iniciar-sesion" replace state={{ desde: ubicacion.pathname }} />;
    }

    return children;
}

export default RutaProtegida;
