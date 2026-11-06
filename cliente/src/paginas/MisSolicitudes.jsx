// MisSolicitudes.jsx
// Solicitudes que envió el usuario: filtro por estado y paginación desde el servidor
// Las pendientes se pueden modificar o cancelar (con confirmación)

import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';

import { listarEnviadas, cambiarEstadoSolicitud } from '../api/solicitudes.js';
import Aviso from '../componentes/comunes/Aviso.jsx';
import Cargando from '../componentes/comunes/Cargando.jsx';
import MensajeError from '../componentes/comunes/MensajeError.jsx';
import SinResultados from '../componentes/comunes/SinResultados.jsx';
import Paginacion from '../componentes/comunes/Paginacion.jsx';
import ModalConfirmacion from '../componentes/comunes/ModalConfirmacion.jsx';
import PestanasSolicitudes from '../componentes/solicitudes/PestanasSolicitudes.jsx';
import TarjetaSolicitud from '../componentes/solicitudes/TarjetaSolicitud.jsx';
import { ESTADOS_SOLICITUD, opcionesDe } from '../utils/etiquetas.js';

const CONSULTA_INICIAL = { status: '', sort: 'recent', page: 1, size: 6 };

function MisSolicitudes() {
    const navegar = useNavigate();
    const [consulta, setConsulta] = useState(CONSULTA_INICIAL);
    const [resultado, setResultado] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [version, setVersion] = useState(0);

    const [aCancelar, setACancelar] = useState(null);
    const [procesando, setProcesando] = useState(false);
    const [errorAccion, setErrorAccion] = useState(null);

    useEffect(() => {
        const controlador = new AbortController();

        async function cargar() {
            setCargando(true);
            setError(null);
            try {
                const pagina = await listarEnviadas(consulta, controlador.signal);
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

    function cerrarModal() {
        setACancelar(null);
        setErrorAccion(null);
    }

    // solo se cancelan las pendientes, la solicitud se conserva con estado "Cancelada"
    async function confirmarCancelacion() {
        setProcesando(true);
        setErrorAccion(null);
        try {
            await cambiarEstadoSolicitud(aCancelar.id, { status: 'cancelled' });
            cerrarModal();
            navegar('/solicitudes', { replace: true, state: { aviso: 'La solicitud se canceló.' } });
            setVersion((valor) => valor + 1);
        } catch (errorRecibido) {
            setErrorAccion(errorRecibido);
        } finally {
            setProcesando(false);
        }
    }

    let contenido;
    if (cargando) {
        contenido = <Cargando texto="Cargando tus solicitudes..." />;
    } else if (error) {
        contenido = <MensajeError error={error} onReintentar={() => setVersion((valor) => valor + 1)} />;
    } else if (resultado.data.length === 0) {
        contenido = (
            <SinResultados mensaje="No tienes solicitudes con ese filtro.">
                <Link to="/iniciativas" className="btn btn-link">Explorar el catálogo</Link>
            </SinResultados>
        );
    } else {
        contenido = (
            <>
                <div className="row g-4">
                    {resultado.data.map((solicitud) => (
                        <div className="col-12 col-lg-6" key={solicitud.id}>
                            <TarjetaSolicitud solicitud={solicitud}>
                                {solicitud.status === 'pending' && (
                                    <>
                                        <Link to={`/solicitudes/${solicitud.id}/editar`} className="btn btn-outline-primary btn-sm">
                                            Modificar
                                        </Link>
                                        <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => setACancelar(solicitud)}>
                                            Cancelar solicitud
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

    return (
        <section className="container py-5" aria-labelledby="titulo-mis-solicitudes">
            <Aviso />

            <h1 id="titulo-mis-solicitudes" className="fw-bold text-dark mb-4">Solicitudes</h1>
            <PestanasSolicitudes />

            <div className="row g-3 mb-4">
                <div className="col-12 col-sm-6 col-lg-3">
                    <label htmlFor="filtro-estado" className="form-label fw-semibold">Estado</label>
                    <select
                        id="filtro-estado"
                        className="form-select"
                        value={consulta.status}
                        onChange={(evento) => cambiarFiltro('status', evento.target.value)}
                    >
                        <option value="">Todos</option>
                        {opcionesDe(ESTADOS_SOLICITUD).map((opcion) => (
                            <option key={opcion.valor} value={opcion.valor}>{opcion.etiqueta}</option>
                        ))}
                    </select>
                </div>
                <div className="col-12 col-sm-6 col-lg-3">
                    <label htmlFor="filtro-orden" className="form-label fw-semibold">Ordenar por</label>
                    <select
                        id="filtro-orden"
                        className="form-select"
                        value={consulta.sort}
                        onChange={(evento) => cambiarFiltro('sort', evento.target.value)}
                    >
                        <option value="recent">Más recientes</option>
                        <option value="oldest">Más antiguas</option>
                    </select>
                </div>
            </div>

            {contenido}

            <ModalConfirmacion
                abierto={aCancelar !== null}
                titulo="Cancelar solicitud"
                textoConfirmar="Sí, cancelar"
                procesando={procesando}
                onConfirmar={confirmarCancelacion}
                onCancelar={cerrarModal}
            >
                <p className="mb-0">
                    ¿Quieres cancelar tu solicitud para «{aCancelar?.initiative.title}»? Quedará registrada como cancelada.
                </p>
                {errorAccion && <div className="alert alert-danger mt-3 mb-0" role="alert">{errorAccion.message}</div>}
            </ModalConfirmacion>
        </section>
    );
}

export default MisSolicitudes;
