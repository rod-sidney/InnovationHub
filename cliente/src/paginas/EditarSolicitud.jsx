// EditarSolicitud.jsx
// Modificar una solicitud propia mientras está pendiente (/solicitudes/:id/editar)
// Primero pide la solicitud y después su iniciativa, para ofrecer sus competencias

import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';

import { obtenerSolicitud, actualizarSolicitud } from '../api/solicitudes.js';
import { obtenerIniciativa } from '../api/iniciativas.js';
import Cargando from '../componentes/comunes/Cargando.jsx';
import MensajeError from '../componentes/comunes/MensajeError.jsx';
import FormularioSolicitud from '../componentes/solicitudes/FormularioSolicitud.jsx';

function EditarSolicitud() {
    const { id } = useParams();
    const navegar = useNavigate();
    const [solicitud, setSolicitud] = useState(null);
    const [competencias, setCompetencias] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const controlador = new AbortController();

        async function cargar() {
            setCargando(true);
            setError(null);
            try {
                // La segunda petición necesita un dato de la primera, van una después de la otra
                const datos = await obtenerSolicitud(id, controlador.signal);
                const iniciativa = await obtenerIniciativa(datos.initiative.id, controlador.signal);
                if (!controlador.signal.aborted) {
                    setSolicitud(datos);
                    setCompetencias(iniciativa.skills);
                }
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
        await actualizarSolicitud(id, datos);
        navegar('/solicitudes', { state: { aviso: 'Los cambios de tu solicitud se guardaron.' } });
    }

    let contenido;
    if (cargando) {
        contenido = <Cargando texto="Cargando la solicitud..." />;
    } else if (error) {
        contenido = <MensajeError error={error} />;
    } else if (solicitud.status !== 'pending') {
        // una solicitud aceptada, rechazada o cancelada ya no se modifica
        contenido = <div className="alert alert-info" role="status">Solo se pueden modificar las solicitudes pendientes.</div>;
    } else {
        contenido = (
            <>
                <p className="mb-4">Iniciativa: <strong>{solicitud.initiative.title}</strong></p>
                <FormularioSolicitud
                    competencias={competencias}
                    valoresIniciales={{
                        role: solicitud.role,
                        skillId: solicitud.skill ? solicitud.skill.id : '',
                        availability: solicitud.availability,
                        message: solicitud.message
                    }}
                    textoBoton="Guardar cambios"
                    onGuardar={guardar}
                    onCancelar={() => navegar('/solicitudes')}
                />
            </>
        );
    }

    return (
        <section className="container py-5" aria-labelledby="titulo-editar-solicitud">
            <div className="row justify-content-center">
                <div className="col-12 col-lg-8">
                    <Link to="/solicitudes" className="d-inline-block mb-3">&larr; Volver a mis solicitudes</Link>
                    <h1 id="titulo-editar-solicitud" className="fw-bold text-dark text-center mb-4">Modificar solicitud</h1>
                    <div className="card bg-secondary bg-opacity-50 shadow-sm border-0 p-4 p-md-5">
                        {contenido}
                    </div>
                </div>
            </div>
        </section>
    );
}

export default EditarSolicitud;
