// TarjetaProyecto.jsx
// Un proyecto en el listado (ProjectSummary): nombre, objetivo, iniciativa de origen, propietario, integrantes, tecnologías y estado

import { Link } from 'react-router';

import Estado from '../comunes/Estado.jsx';
import { CATEGORIAS, ESTADOS_PROYECTO } from '../../utils/etiquetas.js';

function TarjetaProyecto({ proyecto }) {
    return (
        <article className="card card-iniciativa h-100 shadow-sm">
            <div className="card-header bg-secondary border-0 d-flex flex-wrap justify-content-between align-items-center gap-2">
                <span className="fw-bold">{CATEGORIAS[proyecto.initiative.category]}</span>
                <span className="badge bg-white">
                    <Estado valor={proyecto.status} etiqueta={ESTADOS_PROYECTO[proyecto.status]} />
                </span>
            </div>

            <div className="card-body d-flex flex-column">
                <h3 className="h5 fw-bold">{proyecto.name}</h3>
                <p className="small text-muted">{proyecto.objective}</p>
                <p className="small mb-1"><strong>Iniciativa de origen:</strong> {proyecto.initiative.title}</p>
                <p className="small mb-3">
                    <strong>Propietario:</strong> {proyecto.owner.fullName} · {proyecto.memberCount} integrantes
                </p>

                <ul className="list-unstyled d-flex flex-wrap gap-1 mb-3">
                    {proyecto.technologies.map((tecnologia) => (
                        <li key={tecnologia} className="badge border border-primary text-primary">{tecnologia}</li>
                    ))}
                </ul>

                <Link to={`/proyectos/${proyecto.id}`} className="btn btn-outline-primary mt-auto">Ver proyecto</Link>
            </div>
        </article>
    );
}

export default TarjetaProyecto;
