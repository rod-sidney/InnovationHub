// ConvertirEnProyecto.jsx
// Convertir una iniciativa propia en proyecto (/iniciativas/:id/proyecto)
// La página explica por qué no se puede cuando falta algo, pero la verificación real de que al menos un miembro además del propietario y de un solo proyecto la hace el servidor

import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';

import { obtenerIniciativa } from '../api/iniciativas.js';
import { crearProyecto } from '../api/proyectos.js';
import Cargando from '../componentes/comunes/Cargando.jsx';
import MensajeError from '../componentes/comunes/MensajeError.jsx';
import FormularioProyecto from '../componentes/proyectos/FormularioProyecto.jsx';

function motivoParaNoConvertir(iniciativa) {
    if (!iniciativa.viewer.isOwner) return 'Solo el propietario puede convertir la iniciativa en proyecto.';
    if (iniciativa.status === 'archived') return 'La iniciativa está archivada.';
    if (iniciativa.projectId) return 'Esta iniciativa ya se convirtió en proyecto.';
    if (iniciativa.memberCount < 2) return 'Para convertirla en proyecto, el equipo necesita al menos un miembro además de ti.';
    return null;
}

function ConvertirEnProyecto() {
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
        const proyecto = await crearProyecto({ initiativeId: id, ...datos });
        navegar(`/proyectos/${proyecto.id}`, { state: { aviso: 'La iniciativa se convirtió en proyecto.' } });
    }

    let contenido;
    if (cargando) {
        contenido = <Cargando texto="Cargando la iniciativa..." />;
    } else if (error) {
        contenido = <MensajeError error={error} />;
    } else if (motivoParaNoConvertir(iniciativa)) {
        contenido = (
            <div className="alert alert-info" role="status">
                <p className="mb-2">{motivoParaNoConvertir(iniciativa)}</p>
                {iniciativa.projectId
                    ? <Link to={`/proyectos/${iniciativa.projectId}`}>Ver el proyecto</Link>
                    : <Link to={`/iniciativas/${id}`}>Volver a la iniciativa</Link>}
            </div>
        );
    } else {
        contenido = (
            <>
                <p className="mb-4">
                    Iniciativa de origen: <strong>{iniciativa.title}</strong> · {iniciativa.memberCount} integrantes.
                    El proyecto conserva el vínculo con la iniciativa y su equipo.
                </p>
                <FormularioProyecto
                    valoresIniciales={{
                        name: iniciativa.title,
                        objective: '',
                        description: '',
                        technologies: [],
                        startDate: '',
                        estimatedEndDate: '',
                        repositoryUrl: ''
                    }}
                    onGuardar={guardar}
                    onCancelar={() => navegar(`/iniciativas/${id}`)}
                />
            </>
        );
    }

    return (
        <section className="container py-5" aria-labelledby="titulo-convertir">
            <div className="row justify-content-center">
                <div className="col-12 col-lg-9">
                    <Link to={`/iniciativas/${id}`} className="d-inline-block mb-3">&larr; Volver a la iniciativa</Link>
                    <h1 id="titulo-convertir" className="fw-bold text-dark text-center mb-4">Convertir en proyecto</h1>
                    <div className="card bg-secondary bg-opacity-50 shadow-sm border-0 p-4 p-md-5">
                        {contenido}
                    </div>
                </div>
            </div>
        </section>
    );
}

export default ConvertirEnProyecto;
