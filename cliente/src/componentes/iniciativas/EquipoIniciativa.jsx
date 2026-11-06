// EquipoIniciativa.jsx
// Lista de integrantes del equipo: nombre, carrera, competencias, rol y fecha de incorporación
// Recibe los miembros por props
// Si el padre lo permite (puedeRetirar), muestra "Retirar" junto a cada miembro que no es el propietario y avisa al padre con onRetirar

import { formatearFecha } from '../../utils/formato.js';

function EquipoIniciativa({ miembros, puedeRetirar = false, onRetirar }) {
    return (
        <ul className="list-unstyled mb-0">
            {miembros.map((miembro) => (
                <li key={miembro.user.id} className="d-flex gap-3 mb-3">
                    <img
                        src={miembro.user.photo || '/img/avatar.svg'}
                        alt=""
                        width="48"
                        height="48"
                        className="avatar border flex-shrink-0"
                    />
                    <div className="flex-grow-1">
                        <strong>{miembro.user.fullName}</strong>
                        {miembro.isOwner && <span className="badge text-bg-primary ms-2">Propietario</span>}
                        <div className="small text-muted">{miembro.role} · {miembro.user.career}</div>
                        {miembro.user.skills.length > 0 && (
                            <div className="small text-muted">
                                {miembro.user.skills.map((elemento) => elemento.skill.name).join(', ')}
                            </div>
                        )}
                        <div className="small text-muted">Desde el {formatearFecha(miembro.joinedAt)}</div>
                    </div>
                    {/* El propietario no puede retirarse a sí mismo (RF-I-EQU-04) */}
                    {puedeRetirar && !miembro.isOwner && (
                        <button
                            type="button"
                            className="btn btn-outline-danger btn-sm align-self-start"
                            onClick={() => onRetirar(miembro)}
                            aria-label={`Retirar a ${miembro.user.fullName} del equipo`}
                        >
                            Retirar
                        </button>
                    )}
                </li>
            ))}
        </ul>
    );
}

export default EquipoIniciativa;
