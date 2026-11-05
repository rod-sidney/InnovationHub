// DetalleIniciativa.jsx
// Detalle de una iniciativa
// El identificador sale del parámetro de la ruta (/iniciativas/:id) y el servidor decide si se ve completa o solo el resumen (campo access de respuesta)

import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';

import { obtenerIniciativa } from '../api/iniciativas.js';
import Cargando from '../componentes/comunes/Cargando.jsx';
import MensajeError from '../componentes/comunes/MensajeError.jsx';
import Estado from '../componentes/comunes/Estado.jsx';
import Tarjeta from '../componentes/comunes/Tarjeta.jsx';
import DatoMeta from '../componentes/iniciativas/DatoMeta.jsx';
import EquipoIniciativa from '../componentes/iniciativas/EquipoIniciativa.jsx';
import { TIPOS, CATEGORIAS, VISIBILIDADES, ESTADOS_INICIATIVA } from '../utils/etiquetas.js';
import { formatearFecha } from '../utils/formato.js';

function DetalleIniciativa() {
    // useParams lee los parámetros de la dirección en /iniciativas/670...1, id = "670...1"
    const { id } = useParams();
    const [iniciativa, setIniciativa] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    // Al aumentar este número se vuelven a pedir los datos (ej: después de cambio)
    const [version, setVersion] = useState(0);

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
    }, [id, version]);   // si cambia el id de la ruta, se pide la otra iniciativa

    if (cargando) {
        return (
            <section className="container py-5">
                <Cargando texto="Cargando la iniciativa..." />
            </section>
        );
    }

    if (error) {
        return (
            <section className="container py-5">
                <MensajeError error={error} onReintentar={() => setVersion((valor) => valor + 1)} />
                <Link to="/iniciativas">&larr; Volver al catálogo</Link>
            </section>
        );
    }

    const accesoCompleto = iniciativa.access === 'full';

    return (
        <article className="container py-5">
            <Link to="/iniciativas" className="d-inline-block mb-3">&larr; Volver al catálogo</Link>

            <h1 className="fw-bold text-dark mb-4">{iniciativa.title}</h1>

            {/* La portada se muestra solo si la iniciativa tiene imagen. --bs-aspect-ratio da una
                proporción propia (alto = 35 % del ancho) para que no empuje el contenido */}
            {iniciativa.image && (
                <div className="ratio mb-4" style={{ '--bs-aspect-ratio': '35%' }}>
                    <img
                        src={iniciativa.image}
                        alt={`Foto de la iniciativa ${iniciativa.title}`}
                        className="rounded shadow-sm object-fit-cover"
                    />
                </div>
            )}

            <div className="d-flex flex-wrap gap-3 mb-4">
                <DatoMeta titulo="Tipo">{TIPOS[iniciativa.type]}</DatoMeta>
                <DatoMeta titulo="Categoría">{CATEGORIAS[iniciativa.category]}</DatoMeta>
                <DatoMeta titulo="Propietario">{iniciativa.owner.fullName}</DatoMeta>
                <DatoMeta titulo="Estado">
                    <Estado valor={iniciativa.status} etiqueta={ESTADOS_INICIATIVA[iniciativa.status]} />
                </DatoMeta>
                <DatoMeta titulo="Visibilidad">{VISIBILIDADES[iniciativa.visibility]}</DatoMeta>
                <DatoMeta titulo="Integrantes">
                    {iniciativa.memberCount} de {iniciativa.memberLimit} · {iniciativa.availableSlots}{' '}
                    {iniciativa.availableSlots === 1 ? 'espacio' : 'espacios'}
                </DatoMeta>
            </div>

            {!accesoCompleto && (
                <div className="alert alert-warning" role="note">
                    <span aria-hidden="true">🔒 </span>
                    Esta iniciativa es <strong>restringida</strong>: solo ves su resumen. La descripción, el
                    problema y el equipo solo los ven el propietario y los miembros aceptados.
                </div>
            )}

            {accesoCompleto && iniciativa.visibility === 'private' && (
                <div className="alert alert-info" role="note">
                    Esta iniciativa es <strong>privada</strong>: no aparece en el catálogo y solo la ve su equipo.
                </div>
            )}

            {iniciativa.status === 'archived' && (
                <div className="alert alert-secondary" role="note">
                    Esta iniciativa está <strong>archivada</strong>: se conserva como historial y ya no admite cambios.
                </div>
            )}

            <div className="row g-4">
                <div className="col-12 col-lg-8 d-flex flex-column gap-4">
                    <Tarjeta titulo="Resumen">
                        <p className="mb-0">{iniciativa.summary}</p>
                    </Tarjeta>

                    {accesoCompleto && (
                        <>
                            <Tarjeta titulo="Descripción">
                                <p className="texto-con-saltos mb-0">{iniciativa.description}</p>
                            </Tarjeta>
                            <Tarjeta titulo="Problema identificado">
                                <p>{iniciativa.problem || 'No se especificó.'}</p>
                                <h3 className="h6 fw-bold text-primary">Beneficiarios</h3>
                                <p className="mb-0">{iniciativa.beneficiaries || 'No se especificaron.'}</p>
                            </Tarjeta>
                        </>
                    )}
                </div>

                <div className="col-12 col-lg-4 d-flex flex-column gap-4">
                    <Tarjeta titulo="Competencias requeridas">
                        <ul className="list-unstyled mb-0">
                            {iniciativa.skills.map((competencia) => (
                                <li key={competencia.id}>· {competencia.name}</li>
                            ))}
                        </ul>
                    </Tarjeta>

                    {accesoCompleto && (
                        <Tarjeta titulo="Equipo">
                            <EquipoIniciativa miembros={iniciativa.members} />
                        </Tarjeta>
                    )}

                    <Tarjeta titulo="Etiquetas">
                        {iniciativa.tags.length > 0 ? (
                            <div className="d-flex flex-wrap gap-2">
                                {iniciativa.tags.map((etiqueta) => (
                                    <span key={etiqueta} className="badge border border-primary text-primary px-3 py-2">
                                        {etiqueta}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted small mb-0">Sin etiquetas.</p>
                        )}
                    </Tarjeta>

                    <p className="small text-muted mb-0">
                        Publicada el {formatearFecha(iniciativa.createdAt)}
                        <br />
                        Última modificación: {formatearFecha(iniciativa.updatedAt)}
                    </p>
                </div>
            </div>
        </article>
    );
}

export default DetalleIniciativa;
