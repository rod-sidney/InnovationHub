// DetalleIniciativa.jsx
// Detalle de una iniciativa
// El identificador sale del parámetro de la ruta (/iniciativas/:id) y el servidor decide si se ve completa o solo el resumen (campo access de respuesta)
// El propietario puede eliminarla o archivarla y retirar miembros, siempre con confirmación

import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';

import { obtenerIniciativa, eliminarIniciativa, retirarMiembro } from '../api/iniciativas.js';
import { useSesion } from '../contexto/SesionContexto.jsx';
import Aviso from '../componentes/comunes/Aviso.jsx';
import Cargando from '../componentes/comunes/Cargando.jsx';
import MensajeError from '../componentes/comunes/MensajeError.jsx';
import Estado from '../componentes/comunes/Estado.jsx';
import Tarjeta from '../componentes/comunes/Tarjeta.jsx';
import ModalConfirmacion from '../componentes/comunes/ModalConfirmacion.jsx';
import DatoMeta from '../componentes/iniciativas/DatoMeta.jsx';
import EquipoIniciativa from '../componentes/iniciativas/EquipoIniciativa.jsx';
import AccionesIniciativa from '../componentes/iniciativas/AccionesIniciativa.jsx';
import { TIPOS, CATEGORIAS, VISIBILIDADES, ESTADOS_INICIATIVA } from '../utils/etiquetas.js';
import { formatearFecha } from '../utils/formato.js';

function DetalleIniciativa() {
    // useParams lee los parámetros de la dirección en /iniciativas/670...1, id = "670...1"
    const { id } = useParams();
    const { usuario } = useSesion();
    const navegar = useNavigate();

    const [iniciativa, setIniciativa] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    // Al aumentar este número se vuelven a pedir los datos (ej: después de cambio)
    const [version, setVersion] = useState(0);

    // Estado de las acciones con confirmación
    const [confirmandoEliminar, setConfirmandoEliminar] = useState(false);
    const [miembroARetirar, setMiembroARetirar] = useState(null);
    const [motivo, setMotivo] = useState('');
    const [procesando, setProcesando] = useState(false);
    const [errorAccion, setErrorAccion] = useState(null);

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

    function cerrarModales() {
        setConfirmandoEliminar(false);
        setMiembroARetirar(null);
        setMotivo('');
        setErrorAccion(null);
    }

    // Muestra un aviso en esta misma página y vuelve a pedir los datos actualizados
    function recargarConAviso(texto) {
        cerrarModales();
        navegar(`/iniciativas/${id}`, { replace: true, state: { aviso: texto } });
        setVersion((valor) => valor + 1);
    }

    // el server decide si elimina (204) o archiva (200) según la información relacionada
    async function confirmarEliminar() {
        setProcesando(true);
        setErrorAccion(null);
        try {
            const resultado = await eliminarIniciativa(id);
            if (resultado === null) {
                navegar('/iniciativas', { state: { aviso: `La iniciativa «${iniciativa.title}» se eliminó.` } });
            } else {
                recargarConAviso('La iniciativa tenía información relacionada (solicitudes, miembros o proyecto), así que se archivó en lugar de eliminarse.');
            }
        } catch (errorRecibido) {
            setErrorAccion(errorRecibido);
        } finally {
            setProcesando(false);
        }
    }

    async function confirmarRetiro() {
        setProcesando(true);
        setErrorAccion(null);
        try {
            await retirarMiembro(id, miembroARetirar.user.id, motivo.trim());
            recargarConAviso(`${miembroARetirar.user.fullName} ya no forma parte del equipo.`);
        } catch (errorRecibido) {
            setErrorAccion(errorRecibido);
        } finally {
            setProcesando(false);
        }
    }

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
    const puedeGestionar = iniciativa.viewer.isOwner && iniciativa.status !== 'archived';

    return (
        <article className="container py-5">
            <Aviso />

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
                    Esta iniciativa es <strong>privada</strong>: solo la ve su equipo; para las demás personas no aparece en el catálogo.
                </div>
            )}

            {iniciativa.projectId && (
                <div className="alert alert-primary" role="note">
                    Esta iniciativa se convirtió en proyecto.{' '}
                    <Link to={`/proyectos/${iniciativa.projectId}`} className="alert-link">Ver el proyecto</Link>
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
                            <EquipoIniciativa
                                miembros={iniciativa.members}
                                puedeRetirar={puedeGestionar}
                                onRetirar={(miembro) => setMiembroARetirar(miembro)}
                            />
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

            <div className="mt-5 pt-4 border-top text-center text-md-end">
                <AccionesIniciativa
                    iniciativa={iniciativa}
                    usuario={usuario}
                    onEliminar={() => setConfirmandoEliminar(true)}
                />
            </div>

            {/* antes de confirmar se muestran el título, la acción y un mensaje */}
            <ModalConfirmacion
                abierto={confirmandoEliminar}
                titulo="Eliminar o archivar iniciativa"
                textoConfirmar="Sí, continuar"
                procesando={procesando}
                onConfirmar={confirmarEliminar}
                onCancelar={cerrarModales}
            >
                <p>¿Quieres eliminar «{iniciativa.title}»?</p>
                <p className="mb-0 small text-muted">
                    Si no tiene solicitudes, miembros ni proyecto, se eliminará definitivamente. Si tiene información
                    relacionada, se archivará para conservar el historial.
                </p>
                {errorAccion && <div className="alert alert-danger mt-3 mb-0" role="alert">{errorAccion.message}</div>}
            </ModalConfirmacion>

            <ModalConfirmacion
                abierto={miembroARetirar !== null}
                titulo="Retirar miembro del equipo"
                textoConfirmar="Retirar"
                procesando={procesando}
                onConfirmar={confirmarRetiro}
                onCancelar={cerrarModales}
            >
                <p>¿Quieres retirar a {miembroARetirar?.user.fullName} del equipo?</p>
                <label htmlFor="motivo-retiro" className="form-label small fw-semibold">Motivo (opcional)</label>
                <textarea
                    id="motivo-retiro"
                    className="form-control"
                    rows={2}
                    maxLength={300}
                    value={motivo}
                    onChange={(evento) => setMotivo(evento.target.value)}
                ></textarea>
                {errorAccion && <div className="alert alert-danger mt-3 mb-0" role="alert">{errorAccion.message}</div>}
            </ModalConfirmacion>

        </article>
    );
}

export default DetalleIniciativa;
