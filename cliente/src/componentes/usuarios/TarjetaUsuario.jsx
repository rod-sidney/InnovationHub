// TarjetaUsuario.jsx
// Resultado de la búsqueda de usuarios: nombre, carrera, competencias principales y disponibilidad

import { Link } from 'react-router';

import { DISPONIBILIDADES, TIPOS_MIEMBRO, NIVELES } from '../../utils/etiquetas.js';

// Cuántas competencias se muestran en la tarjeta (las demás están en el perfil)
const COMPETENCIAS_PRINCIPALES = 3;

function TarjetaUsuario({ usuario }) {
    const principales = usuario.skills.slice(0, COMPETENCIAS_PRINCIPALES);

    return (
        <article className="card card-iniciativa h-100 shadow-sm">
            <div className="card-body d-flex flex-column">
                <div className="d-flex align-items-center gap-3 mb-3">
                    <img src={usuario.photo || '/img/avatar.svg'} alt="" width="64" height="64" className="avatar border" />
                    <div>
                        <h3 className="h6 fw-bold mb-0">{usuario.fullName}</h3>
                        <p className="small text-muted mb-0">{TIPOS_MIEMBRO[usuario.memberType]} · {usuario.career}</p>
                    </div>
                </div>

                {principales.length > 0 ? (
                    <ul className="list-unstyled d-flex flex-wrap gap-1 mb-3">
                        {principales.map((elemento) => (
                            <li key={elemento.skill.id} className="badge bg-secondary text-dark">
                                {elemento.skill.name} · {NIVELES[elemento.level]}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="small text-muted mb-3">Sin competencias registradas.</p>
                )}

                <p className="small mb-3">
                    <strong>Disponibilidad:</strong> {usuario.availability ? DISPONIBILIDADES[usuario.availability] : 'Sin indicar'}
                </p>

                <Link to={`/usuarios/${usuario.id}`} className="btn btn-outline-primary btn-sm mt-auto">Ver perfil</Link>
            </div>
        </article>
    );
}

export default TarjetaUsuario;
