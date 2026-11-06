// EditarIniciativa.jsx
// Página para modificar una iniciativa propia
// Pide al mismo tiempo la iniciativa y el catálogo de competencias
// llena el formulario con los datos actuales

import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';

import { obtenerIniciativa, actualizarIniciativa } from '../api/iniciativas.js';
import { listarCompetencias } from '../api/competencias.js';
import Cargando from '../componentes/comunes/Cargando.jsx';
import MensajeError from '../componentes/comunes/MensajeError.jsx';
import FormularioIniciativa from '../componentes/iniciativas/FormularioIniciativa.jsx';

// Convierte la iniciativa de la API en los valores que usa el formulario
function valoresDesdeIniciativa(iniciativa) {
    return {
        title: iniciativa.title,
        type: iniciativa.type,
        category: iniciativa.category,
        visibility: iniciativa.visibility,
        memberLimit: String(iniciativa.memberLimit),
        summary: iniciativa.summary,
        description: iniciativa.description,
        problem: iniciativa.problem,
        beneficiaries: iniciativa.beneficiaries,
        skills: iniciativa.skills.map((competencia) => competencia.id),
        tags: iniciativa.tags,
        image: iniciativa.image
    };
}

function EditarIniciativa() {
    const { id } = useParams();
    const navegar = useNavigate();
    const [iniciativa, setIniciativa] = useState(null);
    const [competencias, setCompetencias] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const controlador = new AbortController();

        async function cargar() {
            setCargando(true);
            setError(null);
            try {
                // Promise.all espera las dos peticiones que viajan al mismo tiempo
                const [datos, lista] = await Promise.all([
                    obtenerIniciativa(id, controlador.signal),
                    listarCompetencias(controlador.signal)
                ]);
                if (!controlador.signal.aborted) {
                    setIniciativa(datos);
                    setCompetencias(lista);
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
        await actualizarIniciativa(id, datos);
        navegar(`/iniciativas/${id}`, { state: { aviso: 'Los cambios se guardaron correctamente.' } });
    }

    let contenido;
    if (cargando) {
        contenido = <Cargando texto="Cargando la iniciativa..." />;
    } else if (error) {
        contenido = <MensajeError error={error} />;
    } else if (!iniciativa.viewer.isOwner) {
        // server respondería 403 al guardar, aquí se evita mostrar un formulario inútil
        contenido = <div className="alert alert-warning" role="alert">Solo el propietario puede modificar esta iniciativa.</div>;
    } else if (iniciativa.status === 'archived') {
        contenido = <div className="alert alert-secondary" role="alert">La iniciativa está archivada y ya no se puede modificar.</div>;
    } else {
        contenido = (
            <FormularioIniciativa
                valoresIniciales={valoresDesdeIniciativa(iniciativa)}
                competencias={competencias}
                miembrosActuales={iniciativa.memberCount}
                textoBoton="Guardar cambios"
                onGuardar={guardar}
                onCancelar={() => navegar(`/iniciativas/${id}`)}
            />
        );
    }

    return (
        <section className="container py-5" aria-labelledby="titulo-editar">
            <div className="row justify-content-center">
                <div className="col-12 col-lg-9">
                    <Link to={`/iniciativas/${id}`} className="d-inline-block mb-3">&larr; Volver a la iniciativa</Link>
                    <h1 id="titulo-editar" className="fw-bold text-dark text-center mb-4">Modificar iniciativa</h1>
                    <div className="card bg-secondary bg-opacity-50 shadow-sm border-0 p-4 p-md-5">
                        {contenido}
                    </div>
                </div>
            </div>
        </section>
    );
}

export default EditarIniciativa;
