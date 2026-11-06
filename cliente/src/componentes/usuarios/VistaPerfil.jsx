// VistaPerfil.jsx
// Perfil de un usuario: nombre, tipo de miembro, carrera, descripción, competencias con su nivel, intereses, disponibilidad y portafolio
// Nunca hay datos de seguridad, la API no los envía
// children permite agregar acciones (ej: editar)

import { TIPOS_MIEMBRO, DISPONIBILIDADES, NIVELES } from '../../utils/etiquetas.js';
import { formatearFecha } from '../../utils/formato.js';

function VistaPerfil({ perfil, children }) {
    return (
        <div className="card border-0 shadow-sm p-4">
            <div className="d-flex flex-column flex-md-row align-items-md-center gap-4 mb-4">
                <img
                    src={perfil.photo || '/img/avatar.svg'}
                    alt={`Foto de perfil de ${perfil.fullName}`}
                    width="120"
                    height="120"
                    className="avatar border border-4 border-white shadow-sm"
                />
                <div className="flex-grow-1">
                    <h2 className="h3 fw-bold mb-1">
                        {perfil.fullName}
                        {perfil.role === 'admin' && <span className="badge text-bg-primary fs-6 ms-2 align-middle">Administrador</span>}
                    </h2>
                    <p className="text-muted mb-1">{TIPOS_MIEMBRO[perfil.memberType]} · {perfil.career}</p>
                    {perfil.email && <p className="small mb-1">{perfil.email}</p>}
                    <p className="small text-muted mb-0">Miembro desde el {formatearFecha(perfil.createdAt)}</p>
                </div>
                {children}
            </div>

            <div className="row g-4">
                <div className="col-12 col-lg-6">
                    <h3 className="h6 fw-bold text-primary">Descripción personal</h3>
                    <p className="texto-con-saltos">{perfil.description || 'Sin descripción.'}</p>

                    <h3 className="h6 fw-bold text-primary">Disponibilidad</h3>
                    <p>{perfil.availability ? DISPONIBILIDADES[perfil.availability] : 'Sin indicar.'}</p>

                    <h3 className="h6 fw-bold text-primary">Portafolio</h3>
                    <p className="mb-0">
                        {perfil.portfolio
                            ? <a href={perfil.portfolio} target="_blank" rel="noopener noreferrer">{perfil.portfolio}</a>
                            : 'Sin portafolio.'}
                    </p>
                </div>

                <div className="col-12 col-lg-6">
                    <h3 className="h6 fw-bold text-primary">Competencias</h3>
                    {perfil.skills.length > 0 ? (
                        <ul className="list-unstyled d-flex flex-wrap gap-2">
                            {perfil.skills.map((elemento) => (
                                <li key={elemento.skill.id} className="badge bg-secondary text-dark px-3 py-2">
                                    {elemento.skill.name} · {NIVELES[elemento.level]}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-muted small">Sin competencias registradas.</p>
                    )}

                    <h3 className="h6 fw-bold text-primary">Intereses</h3>
                    {perfil.interests.length > 0 ? (
                        <ul className="list-unstyled d-flex flex-wrap gap-2 mb-0">
                            {perfil.interests.map((interes) => (
                                <li key={interes} className="badge border border-primary text-primary px-3 py-2">{interes}</li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-muted small mb-0">Sin intereses registrados.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default VistaPerfil;
