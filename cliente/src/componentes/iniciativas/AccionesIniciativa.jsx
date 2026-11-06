// AccionesIniciativa.jsx
// Acciones del detalle según quién mira la iniciativa (campo viewer de la API)
// evita ofrecer opciones que no aplican, como que el propietario solicite unirse a su propia iniciativa

import { Link, useLocation } from 'react-router';

// onEliminar: función del padre que abre la confirmación para eliminar o archivar
function AccionesIniciativa({ iniciativa, usuario, onEliminar }) {
    const ubicacion = useLocation();
    const { viewer } = iniciativa;
    const archivada = iniciativa.status === 'archived';

    if (viewer.isOwner) {
        if (archivada) {
            return <p className="text-muted mb-0">Eres el propietario. La iniciativa está archivada y ya no admite cambios.</p>;
        }

        return (
            <div className="d-flex flex-wrap gap-2 justify-content-center justify-content-md-end">
                <Link to={`/iniciativas/${iniciativa.id}/editar`} className="btn btn-warning fw-bold">
                    Editar iniciativa
                </Link>
                <button type="button" className="btn btn-outline-danger" onClick={onEliminar}>
                    Eliminar o archivar
                </button>
            </div>
        );
    }

    // quien ya es miembro no vuelve a solicitar
    if (viewer.isMember) {
        return (
            <p className="fw-semibold text-success mb-0">
                <span aria-hidden="true">✔ </span>Formas parte del equipo de esta iniciativa.
            </p>
        );
    }

    if (archivada) {
        return <p className="text-muted mb-0">La iniciativa está archivada y no recibe solicitudes.</p>;
    }

    // si ya hay una solicitud pendiente, no se ofrece enviar otra
    if (viewer.pendingRequestId) {
        return (
            <p className="fw-semibold mb-0">
                <span className="badge text-bg-warning me-2">Pendiente</span>
                Ya enviaste una solicitud y espera la respuesta del propietario.{' '}
                <Link to="/solicitudes">Ver mis solicitudes</Link>
            </p>
        );
    }

    if (iniciativa.availableSlots === 0) {
        return <p className="text-muted fw-semibold mb-0">El equipo está completo: no hay espacios disponibles.</p>;
    }

    if (!usuario) {
        return (
            <Link to="/iniciar-sesion" state={{ desde: ubicacion.pathname }} className="btn btn-primary btn-lg fw-bold">
                Inicia sesión para unirte
            </Link>
        );
    }

    return (
        <Link to={`/iniciativas/${iniciativa.id}/solicitar`} className="btn btn-primary btn-lg fw-bold">
            Solicitar unirme a la iniciativa
        </Link>
    );
}

export default AccionesIniciativa;
