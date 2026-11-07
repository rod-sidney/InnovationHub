// DetalleProyecto.jsx
// Detalle de un proyecto, a partir del parámetro de la ruta (/proyectos/:id)
// El equipo es el de la iniciativa de origen: el servidor no lo copia al proyecto

import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';

import { obtenerProyecto } from '../api/proyectos.js';
import Aviso from '../componentes/comunes/Aviso.jsx';
import Cargando from '../componentes/comunes/Cargando.jsx';
import MensajeError from '../componentes/comunes/MensajeError.jsx';
import Estado from '../componentes/comunes/Estado.jsx';
import Tarjeta from '../componentes/comunes/Tarjeta.jsx';
import DatoMeta from '../componentes/iniciativas/DatoMeta.jsx';
import EquipoIniciativa from '../componentes/iniciativas/EquipoIniciativa.jsx';
import { ESTADOS_PROYECTO } from '../utils/etiquetas.js';
import { formatearFecha } from '../utils/formato.js';

function DetalleProyecto() {
    const { id } = useParams();
    const [proyecto, setProyecto] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [intento, setIntento] = useState(0);

    useEffect(() => {
        const controlador = new AbortController();

        async function cargar() {
            setCargando(true);
            setError(null);
            try {
                const datos = await obtenerProyecto(id, controlador.signal);
                if (!controlador.signal.aborted) setProyecto(datos);
            } catch (errorRecibido) {
                if (!controlador.signal.aborted) setError(errorRecibido);
            } finally {
                if (!controlador.signal.aborted) setCargando(false);
            }
        }

        cargar();
        return () => controlador.abort();
    }, [id, intento]);

    if (cargando) {
        return (
            <section className="container py-5">
                <Cargando texto="Cargando el proyecto..." />
            </section>
        );
    }

    if (error) {
        return (
            <section className="container py-5">
                <MensajeError error={error} onReintentar={() => setIntento((valor) => valor + 1)} />
                <Link to="/proyectos">&larr; Volver a los proyectos</Link>
            </section>
        );
    }

    return (
        <article className="container py-5">
            <Aviso />

            <Link to="/proyectos" className="d-inline-block mb-3">&larr; Volver a los proyectos</Link>

            <h1 className="fw-bold text-dark mb-2">{proyecto.name}</h1>
            <p className="text-muted mb-4">
                Iniciativa de origen: <Link to={`/iniciativas/${proyecto.initiative.id}`}>{proyecto.initiative.title}</Link>
            </p>

            <div className="d-flex flex-wrap gap-3 mb-4">
                <DatoMeta titulo="Estado">
                    <Estado valor={proyecto.status} etiqueta={ESTADOS_PROYECTO[proyecto.status]} />
                </DatoMeta>
                <DatoMeta titulo="Propietario">{proyecto.owner.fullName}</DatoMeta>
                <DatoMeta titulo="Inicio">{formatearFecha(proyecto.startDate)}</DatoMeta>
                <DatoMeta titulo="Finalización estimada">
                    {proyecto.estimatedEndDate ? formatearFecha(proyecto.estimatedEndDate) : 'Sin definir'}
                </DatoMeta>
                <DatoMeta titulo="Integrantes">{proyecto.memberCount}</DatoMeta>
            </div>

            <div className="row g-4">
                <div className="col-12 col-lg-8 d-flex flex-column gap-4">
                    <Tarjeta titulo="Objetivo">
                        <p className="mb-0">{proyecto.objective}</p>
                    </Tarjeta>
                    <Tarjeta titulo="Descripción">
                        <p className="texto-con-saltos mb-0">{proyecto.description}</p>
                    </Tarjeta>
                    <Tarjeta titulo="Repositorio">
                        {proyecto.repository ? (
                            <a href={proyecto.repository.url} target="_blank" rel="noopener noreferrer">
                                {proyecto.repository.owner}/{proyecto.repository.name}
                            </a>
                        ) : (
                            <p className="text-muted small mb-0">El proyecto no tiene un repositorio asociado.</p>
                        )}
                    </Tarjeta>
                </div>

                <div className="col-12 col-lg-4 d-flex flex-column gap-4">
                    <Tarjeta titulo="Tecnologías">
                        <ul className="list-unstyled d-flex flex-wrap gap-2 mb-0">
                            {proyecto.technologies.map((tecnologia) => (
                                <li key={tecnologia} className="badge border border-primary text-primary px-3 py-2">{tecnologia}</li>
                            ))}
                        </ul>
                    </Tarjeta>
                    <Tarjeta titulo="Equipo">
                        <EquipoIniciativa miembros={proyecto.members} />
                    </Tarjeta>
                    <p className="small text-muted mb-0">Proyecto creado el {formatearFecha(proyecto.createdAt)}</p>
                </div>
            </div>
        </article>
    );
}

export default DetalleProyecto;
