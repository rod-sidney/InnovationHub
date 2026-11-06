// SolicitarParticipacion.jsx
// Página para solicitar participación en una iniciativa (/iniciativas/:id/solicitar)
// Antes de mostrar el formulario revisa la relación con la iniciativa (viewer) para explicar por qué no se puede solicitar
// igual el servidor vuelve a verificar cada regla

import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';

import { obtenerIniciativa } from '../api/iniciativas.js';
import { crearSolicitud } from '../api/solicitudes.js';
import Cargando from '../componentes/comunes/Cargando.jsx';
import MensajeError from '../componentes/comunes/MensajeError.jsx';
import FormularioSolicitud from '../componentes/solicitudes/FormularioSolicitud.jsx';

// Si no se puede solicitar, devuelve el motivo, si se puede, null
function motivoParaNoSolicitar(iniciativa) {
    if (iniciativa.viewer.isOwner) return 'No puedes solicitar participación en tu propia iniciativa.';
    if (iniciativa.viewer.isMember) return 'Ya formas parte del equipo de esta iniciativa.';
    if (iniciativa.viewer.pendingRequestId) return 'Ya tienes una solicitud pendiente para esta iniciativa.';
    if (iniciativa.status === 'archived') return 'La iniciativa está archivada y no recibe solicitudes.';
    if (iniciativa.availableSlots === 0) return 'El equipo está completo: no hay espacios disponibles.';
    return null;
}

function SolicitarParticipacion() {
    const { id } = useParams();
    const navegar = useNavigate();
    const [iniciativa, setIniciativa] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const controlador = new AbortController();

        async function cargar() {
            setCargando(true);
            setError(null);
            try {
                const datos = await obtenerIniciativa(id, controlador.signal);
                if (!controlador.signal.aborted) setIniciativa(datos);
            } catch (errorRecibido) {
                if (!controlador.signal.aborted) setError(errorRecibido);
            } finally {
                if (!controlador.signal.aborted) setCargando(false);
            }
        }

        cargar();
        return () => controlador.abort();
    }, [id]);

    async function guardar(datos) {
        await crearSolicitud({ initiativeId: id, ...datos });
        navegar('/solicitudes', { state: { aviso: `Tu solicitud para «${iniciativa.title}» se envió y está pendiente.` } });
    }

    let contenido;
    if (cargando) {
        contenido = <Cargando texto="Cargando la iniciativa..." />;
    } else if (error) {
        contenido = <MensajeError error={error} />;
    } else if (motivoParaNoSolicitar(iniciativa)) {
        contenido = (
            <div className="alert alert-info" role="status">
                <p className="mb-2">{motivoParaNoSolicitar(iniciativa)}</p>
                <Link to={`/iniciativas/${id}`}>Volver a la iniciativa</Link>
            </div>
        );
    } else {
        contenido = (
            <>
                <p className="mb-4">
                    Iniciativa: <strong>{iniciativa.title}</strong>
                </p>
                <FormularioSolicitud
                    competencias={iniciativa.skills}
                    textoBoton="Enviar solicitud"
                    onGuardar={guardar}
                    onCancelar={() => navegar(`/iniciativas/${id}`)}
                />
            </>
        );
    }

    return (
        <section className="container py-5" aria-labelledby="titulo-solicitar">
            <div className="row justify-content-center">
                <div className="col-12 col-lg-8">
                    <Link to={`/iniciativas/${id}`} className="d-inline-block mb-3">&larr; Volver a la iniciativa</Link>
                    <h1 id="titulo-solicitar" className="fw-bold text-dark text-center mb-4">Solicitar participación</h1>
                    <div className="card bg-secondary bg-opacity-50 shadow-sm border-0 p-4 p-md-5">
                        {contenido}
                    </div>
                </div>
            </div>
        </section>
    );
}

export default SolicitarParticipacion;
