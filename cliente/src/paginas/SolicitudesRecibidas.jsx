// SolicitudesRecibidas.jsx
// Solicitudes que recibieron las iniciativas del usuario
// Los filtros (iniciativa, estado, competencia, rol y orden) y la paginación los resuelve el servidor
// Las pendientes se aceptan o rechazan con un comentario opcional

import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';

import { listarRecibidas, cambiarEstadoSolicitud } from '../api/solicitudes.js';
import { listarIniciativas } from '../api/iniciativas.js';
import { listarCompetencias } from '../api/competencias.js';
import { useSesion } from '../contexto/SesionContexto.jsx';
import Aviso from '../componentes/comunes/Aviso.jsx';
import Cargando from '../componentes/comunes/Cargando.jsx';
import MensajeError from '../componentes/comunes/MensajeError.jsx';
import SinResultados from '../componentes/comunes/SinResultados.jsx';
import Paginacion from '../componentes/comunes/Paginacion.jsx';
import ModalConfirmacion from '../componentes/comunes/ModalConfirmacion.jsx';
import OpcionesCompetencias from '../componentes/comunes/OpcionesCompetencias.jsx';
import PestanasSolicitudes from '../componentes/solicitudes/PestanasSolicitudes.jsx';
import TarjetaSolicitud from '../componentes/solicitudes/TarjetaSolicitud.jsx';
import { ESTADOS_SOLICITUD, opcionesDe } from '../utils/etiquetas.js';

function SolicitudesRecibidas() {
    const { usuario } = useSesion();
    const ubicacion = useLocation();
    const navegar = useNavigate();

    // Si se llegó desde el detalle de una iniciativa, la lista empieza filtrada por ella
    const [consulta, setConsulta] = useState({
        initiative: ubicacion.state?.iniciativa || '',
        status: '',
        skill: '',
        role: '',
        sort: 'recent',
        page: 1,
        size: 6
    });
    const [textoRol, setTextoRol] = useState('');
    const [resultado, setResultado] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [version, setVersion] = useState(0);

    // Opciones de los filtros: las iniciativas propias y el catálogo de competencias
    const [misIniciativas, setMisIniciativas] = useState([]);
    const [competencias, setCompetencias] = useState([]);

    // Solicitud que se está resolviendo: { solicitud, decision: 'accepted' | 'rejected' }
    const [aResolver, setAResolver] = useState(null);
    const [comentario, setComentario] = useState('');
    const [procesando, setProcesando] = useState(false);
    const [errorAccion, setErrorAccion] = useState(null);

    useEffect(() => {
        const controlador = new AbortController();

        async function cargarOpciones() {
            try {
                const [pagina, lista] = await Promise.all([
                    listarIniciativas({ owner: usuario.id, size: 50, sort: 'title' }, controlador.signal),
                    listarCompetencias(controlador.signal)
                ]);
                if (!controlador.signal.aborted) {
                    setMisIniciativas(pagina.data);
                    setCompetencias(lista);
                }
            } catch {
                // Sin estas opciones, los filtros solo muestran "Todas"
            }
        }

        cargarOpciones();
        return () => controlador.abort();
    }, [usuario.id]);

    // El texto del rol se aplica después de una pausa de 400 ms, como la búsqueda del catálogo
    useEffect(() => {
        const temporizador = setTimeout(() => {
            const role = textoRol.trim();
            setConsulta((anterior) => (anterior.role === role ? anterior : { ...anterior, role, page: 1 }));
        }, 400);

        return () => clearTimeout(temporizador);
    }, [textoRol]);

    useEffect(() => {
        const controlador = new AbortController();

        async function cargar() {
            setCargando(true);
            setError(null);
            try {
                const pagina = await listarRecibidas(consulta, controlador.signal);
                if (!controlador.signal.aborted) setResultado(pagina);
            } catch (errorRecibido) {
                if (!controlador.signal.aborted) setError(errorRecibido);
            } finally {
                if (!controlador.signal.aborted) setCargando(false);
            }
        }

        cargar();
        return () => controlador.abort();
    }, [consulta, version]);

    function cambiarFiltro(nombre, valor) {
        setConsulta((anterior) => ({ ...anterior, [nombre]: valor, page: 1 }));
    }

    function abrirResolucion(solicitud, decision) {
        setAResolver({ solicitud, decision });
        setComentario('');
        setErrorAccion(null);
    }

    function cerrarModal() {
        setAResolver(null);
        setErrorAccion(null);
    }

    // al aceptar, el servidor incorpora al solicitante al equipo
    async function confirmarResolucion() {
        setProcesando(true);
        setErrorAccion(null);
        try {
            const { solicitud, decision } = aResolver;
            await cambiarEstadoSolicitud(solicitud.id, { status: decision, comment: comentario.trim() });
            const aviso = decision === 'accepted'
                ? `${solicitud.requester.fullName} ahora forma parte del equipo de «${solicitud.initiative.title}».`
                : 'La solicitud se rechazó.';
            cerrarModal();
            navegar('/solicitudes/recibidas', { replace: true, state: { aviso, iniciativa: consulta.initiative } });
            setVersion((valor) => valor + 1);
        } catch (errorRecibido) {
            // Por ejemplo, 409 si el equipo ya se llenó
            setErrorAccion(errorRecibido);
        } finally {
            setProcesando(false);
        }
    }

    let contenido;
    if (cargando) {
        contenido = <Cargando texto="Cargando las solicitudes recibidas..." />;
    } else if (error) {
        contenido = <MensajeError error={error} onReintentar={() => setVersion((valor) => valor + 1)} />;
    } else if (resultado.data.length === 0) {
        contenido = <SinResultados mensaje="No hay solicitudes recibidas con esos filtros." />;
    } else {
        contenido = (
            <>
                <div className="row g-4">
                    {resultado.data.map((solicitud) => (
                        <div className="col-12 col-lg-6" key={solicitud.id}>
                            <TarjetaSolicitud solicitud={solicitud} mostrarSolicitante>
                                {solicitud.status === 'pending' && (
                                    <>
                                        <button type="button" className="btn btn-success btn-sm" onClick={() => abrirResolucion(solicitud, 'accepted')}>
                                            Aceptar
                                        </button>
                                        <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => abrirResolucion(solicitud, 'rejected')}>
                                            Rechazar
                                        </button>
                                    </>
                                )}
                            </TarjetaSolicitud>
                        </div>
                    ))}
                </div>
                <Paginacion
                    pagina={resultado.page}
                    totalPaginas={resultado.totalPages}
                    onCambiar={(numero) => setConsulta((anterior) => ({ ...anterior, page: numero }))}
                />
            </>
        );
    }

    const aceptando = aResolver?.decision === 'accepted';

    return (
        <section className="container py-5" aria-labelledby="titulo-recibidas">
            <Aviso />

            <h1 id="titulo-recibidas" className="fw-bold text-dark mb-4">Solicitudes</h1>
            <PestanasSolicitudes />

            <form className="card border-0 shadow-sm p-3 mb-4" role="search" aria-label="Filtrar solicitudes recibidas" onSubmit={(evento) => evento.preventDefault()}>
                <div className="row g-3">
                    <div className="col-12 col-lg-4">
                        <label htmlFor="filtro-iniciativa" className="form-label fw-semibold">Iniciativa</label>
                        <select id="filtro-iniciativa" className="form-select" value={consulta.initiative} onChange={(evento) => cambiarFiltro('initiative', evento.target.value)}>
                            <option value="">Todas mis iniciativas</option>
                            {misIniciativas.map((iniciativa) => (
                                <option key={iniciativa.id} value={iniciativa.id}>{iniciativa.title}</option>
                            ))}
                        </select>
                    </div>
                    <div className="col-6 col-lg-2">
                        <label htmlFor="filtro-estado" className="form-label fw-semibold">Estado</label>
                        <select id="filtro-estado" className="form-select" value={consulta.status} onChange={(evento) => cambiarFiltro('status', evento.target.value)}>
                            <option value="">Todos</option>
                            {opcionesDe(ESTADOS_SOLICITUD).map((opcion) => (
                                <option key={opcion.valor} value={opcion.valor}>{opcion.etiqueta}</option>
                            ))}
                        </select>
                    </div>
                    <div className="col-6 col-lg-2">
                        <label htmlFor="filtro-orden" className="form-label fw-semibold">Fecha</label>
                        <select id="filtro-orden" className="form-select" value={consulta.sort} onChange={(evento) => cambiarFiltro('sort', evento.target.value)}>
                            <option value="recent">Más recientes</option>
                            <option value="oldest">Más antiguas</option>
                        </select>
                    </div>
                    <div className="col-12 col-md-6 col-lg-2">
                        <label htmlFor="filtro-competencia" className="form-label fw-semibold">Competencia</label>
                        <select id="filtro-competencia" className="form-select" value={consulta.skill} onChange={(evento) => cambiarFiltro('skill', evento.target.value)}>
                            <option value="">Todas</option>
                            <OpcionesCompetencias competencias={competencias} />
                        </select>
                    </div>
                    <div className="col-12 col-md-6 col-lg-2">
                        <label htmlFor="filtro-rol" className="form-label fw-semibold">Rol</label>
                        <input id="filtro-rol" type="search" className="form-control" maxLength={60} value={textoRol} onChange={(evento) => setTextoRol(evento.target.value)} />
                    </div>
                </div>
            </form>

            {misIniciativas.length === 0 && !cargando && !error && (
                <p className="text-muted small">
                    Todavía no tienes iniciativas. <Link to="/iniciativas/nueva">Publica una</Link> para empezar a recibir solicitudes.
                </p>
            )}

            {contenido}

            <ModalConfirmacion
                abierto={aResolver !== null}
                titulo={aceptando ? 'Aceptar solicitud' : 'Rechazar solicitud'}
                textoConfirmar={aceptando ? 'Aceptar' : 'Rechazar'}
                variante={aceptando ? 'success' : 'danger'}
                procesando={procesando}
                onConfirmar={confirmarResolucion}
                onCancelar={cerrarModal}
            >
                <p>
                    {aceptando
                        ? `${aResolver?.solicitud.requester.fullName} entrará al equipo con el rol «${aResolver?.solicitud.role}».`
                        : `La solicitud de ${aResolver?.solicitud.requester.fullName} quedará rechazada.`}
                </p>
                <label htmlFor="comentario-resolucion" className="form-label small fw-semibold">Comentario para el solicitante (opcional)</label>
                <textarea
                    id="comentario-resolucion"
                    className="form-control"
                    rows={2}
                    maxLength={300}
                    value={comentario}
                    onChange={(evento) => setComentario(evento.target.value)}
                ></textarea>
                {errorAccion && <div className="alert alert-danger mt-3 mb-0" role="alert">{errorAccion.message}</div>}
            </ModalConfirmacion>
        </section>
    );
}

export default SolicitudesRecibidas;
