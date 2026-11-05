// MensajeError.jsx
// Estado de error muestra el mensaje que envió la API (o el de falta de conexión)
// Con 401 ofrece iniciar sesión, con un error de red o del servidor, intentar de nuevo

import { Link, useLocation } from 'react-router';

// Título según el código de estado HTTP que respondió la API
function tituloDelError(status) {
    if (status === 0) return 'Sin conexión con el servidor';
    if (status === 401) return 'Necesitas iniciar sesión';
    if (status === 403) return 'No tienes permiso';
    if (status === 404) return 'No se encontró';
    return 'Ocurrió un error';
}

function MensajeError({ error, onReintentar }) {
    const ubicacion = useLocation();

    return (
        <div className="alert alert-danger" role="alert">
            <h2 className="h5 alert-heading">{tituloDelError(error.status)}</h2>
            <p className="mb-0">{error.message}</p>

            {error.status === 401 && (
                <Link className="btn btn-primary btn-sm mt-3" to="/iniciar-sesion" state={{ desde: ubicacion.pathname }}>
                    Iniciar sesión
                </Link>
            )}

            {onReintentar && (error.status === 0 || error.status >= 500) && (
                <button type="button" className="btn btn-outline-danger btn-sm mt-3" onClick={onReintentar}>
                    Intentar de nuevo
                </button>
            )}
        </div>
    );
}

export default MensajeError;
