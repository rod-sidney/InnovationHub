// TarjetaIniciativa.jsx
// Tarjeta de una iniciativa en el catálogo y en la página de inicio (diseño del Avance 1)
// Recibe por props el resumen que envía la API (InitiativeSummary)

import { Link } from 'react-router';

import Estado from '../comunes/Estado.jsx';
import InsigniaVisibilidad from './InsigniaVisibilidad.jsx';
import { TIPOS, CATEGORIAS, ESTADOS_INICIATIVA } from '../../utils/etiquetas.js';

function TarjetaIniciativa({ iniciativa, idUsuario }) {
    // El botón Editar solo se muestra al propietario, el servidor verifica el permiso
    const esPropietario = idUsuario === iniciativa.owner.id;

    return (
        <article className="card card-iniciativa h-100 shadow-sm">
            <div className="ratio ratio-16x9">
                {/* Sin foto se usa la imagen predeterminada */}
                <img
                    src={iniciativa.image || '/img/iniciativa.svg'}
                    alt={iniciativa.image ? `Foto de la iniciativa ${iniciativa.title}` : ''}
                    className="card-img-top object-fit-cover"
                />
            </div>

            <div className="card-body d-flex flex-column">
                <div className="d-flex flex-wrap gap-2 mb-2">
                    <span className="badge bg-secondary text-dark">
                        {TIPOS[iniciativa.type]} · {CATEGORIAS[iniciativa.category]}
                    </span>
                    <InsigniaVisibilidad visibilidad={iniciativa.visibility} />
                </div>

                <h3 className="card-title h5 fw-bold">{iniciativa.title}</h3>
                <p className="card-text text-muted small">{iniciativa.summary}</p>
                <p className="small text-muted mb-3">Publicada por <strong>{iniciativa.owner.fullName}</strong></p>

                <div className="mt-auto">
                    <h4 className="h6 fw-bold mb-1">Competencias:</h4>
                    <ul className="small text-muted mb-3 list-unstyled">
                        {iniciativa.skills.map((competencia) => (
                            <li key={competencia.id}>· {competencia.name}</li>
                        ))}
                    </ul>

                    <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 border-top pt-3 small">
                        <Estado valor={iniciativa.status} etiqueta={ESTADOS_INICIATIVA[iniciativa.status]} />
                        <span className="text-muted">
                            {iniciativa.memberCount} de {iniciativa.memberLimit} integrantes
                        </span>
                    </div>
                </div>
            </div>

            <div className="card-footer bg-white border-0 pb-3 d-flex gap-2">
                <Link to={`/iniciativas/${iniciativa.id}`} className="btn btn-outline-primary w-100">
                    Ver iniciativa
                </Link>
                {esPropietario && (
                    <Link to={`/iniciativas/${iniciativa.id}/editar`} className="btn btn-outline-primary w-100">
                        Editar
                    </Link>
                )}
            </div>
        </article>
    );
}

export default TarjetaIniciativa;
