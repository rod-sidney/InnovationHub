// TarjetaSolicitud.jsx
// Una solicitud de participación
// Las acciones llegan por children: cada página decide cuáles mostrar (editar y cancelar, o aceptar y rechazar)

import { Link } from 'react-router';

import Estado from '../comunes/Estado.jsx';
import { ESTADOS_SOLICITUD, DISPONIBILIDADES } from '../../utils/etiquetas.js';
import { formatearFecha } from '../../utils/formato.js';

// mostrarSolicitante: en las solicitudes recibidas interesa saber quién la envió
function TarjetaSolicitud({ solicitud, mostrarSolicitante = false, children }) {
    const { requester } = solicitud;

    return (
        <article className="card border-0 shadow-sm h-100">
            <div className="card-header bg-secondary border-0 d-flex flex-wrap justify-content-between align-items-center gap-2">
                <Link to={`/iniciativas/${solicitud.initiative.id}`} className="fw-bold text-dark">
                    {solicitud.initiative.title}
                </Link>
                <span className="badge bg-white">
                    <Estado valor={solicitud.status} etiqueta={ESTADOS_SOLICITUD[solicitud.status]} />
                </span>
            </div>

            <div className="card-body">
                {mostrarSolicitante && (
                    <div className="d-flex align-items-center gap-2 mb-3">
                        <img src={requester.photo || '/img/avatar.svg'} alt="" width="40" height="40" className="avatar border" />
                        <div>
                            <Link to={`/usuarios/${requester.id}`} className="fw-bold">{requester.fullName}</Link>
                            <div className="small text-muted">{requester.career}</div>
                        </div>
                    </div>
                )}

                <dl className="row small mb-0">
                    <dt className="col-sm-5">Rol solicitado</dt>
                    <dd className="col-sm-7">{solicitud.role}</dd>

                    <dt className="col-sm-5">Competencia ofrecida</dt>
                    <dd className="col-sm-7">{solicitud.skill ? solicitud.skill.name : 'Sin competencia'}</dd>

                    <dt className="col-sm-5">Disponibilidad</dt>
                    <dd className="col-sm-7">{DISPONIBILIDADES[solicitud.availability]}</dd>

                    <dt className="col-sm-5">Fecha</dt>
                    <dd className="col-sm-7">{formatearFecha(solicitud.createdAt)}</dd>

                    {mostrarSolicitante && (
                        <>
                            <dt className="col-sm-5">Competencias</dt>
                            <dd className="col-sm-7">
                                {requester.skills.length > 0
                                    ? requester.skills.map((elemento) => elemento.skill.name).join(', ')
                                    : 'Sin competencias registradas'}
                            </dd>
                        </>
                    )}
                </dl>

                {solicitud.message && <p className="small fst-italic mt-3 mb-0 texto-con-saltos">«{solicitud.message}»</p>}

                {solicitud.responseComment && (
                    <p className="small mt-3 mb-0">
                        <strong>Respuesta del propietario:</strong> {solicitud.responseComment}
                    </p>
                )}
            </div>

            {children && (
                <div className="card-footer bg-white border-0 d-flex flex-wrap gap-2 justify-content-end">
                    {children}
                </div>
            )}
        </article>
    );
}

export default TarjetaSolicitud;
