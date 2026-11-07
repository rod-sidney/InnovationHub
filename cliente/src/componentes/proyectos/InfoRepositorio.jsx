// InfoRepositorio.jsx
// Información de un repositorio de GitHub
// Pide los datos por su cuenta y con un límite de tiempo: si GitHub no responde en 8 segundos, la consulta se cancela
// Cada caso de error (inexistente o privado, límite de consultas, servicio no disponible, respuesta inválida) muestra su propio mensaje

import { useEffect, useState } from 'react';

import { obtenerRepositorio, ErrorDeGitHub } from '../../api/github.js';
import Cargando from '../comunes/Cargando.jsx';
import { formatearFecha } from '../../utils/formato.js';

const SEGUNDOS_MAXIMOS = 8;

function InfoRepositorio({ propietario, nombre, enlace }) {
    const [repositorio, setRepositorio] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [intento, setIntento] = useState(0);

    useEffect(() => {
        const controlador = new AbortController();
        let seAgotoElTiempo = false;

        // Si GitHub tarda demasiado, se cancela la petición
        const temporizador = setTimeout(() => {
            seAgotoElTiempo = true;
            controlador.abort();
        }, SEGUNDOS_MAXIMOS * 1000);

        async function cargar() {
            setCargando(true);
            setError(null);
            try {
                const datos = await obtenerRepositorio(propietario, nombre, controlador.signal);
                if (!controlador.signal.aborted) setRepositorio(datos);
            } catch (errorRecibido) {
                if (seAgotoElTiempo) {
                    // La cancelación vino del temporizador, no de un desmontaje: se avisa
                    setError(new ErrorDeGitHub('no-disponible', 'GitHub tardó demasiado en responder. Intenta más tarde.'));
                    setCargando(false);
                } else if (!controlador.signal.aborted) {
                    setError(errorRecibido);
                }
            } finally {
                clearTimeout(temporizador);
                if (!controlador.signal.aborted) setCargando(false);
            }
        }

        cargar();

        // Limpieza: si el componente se desmonta, se cancelan el temporizador y la petición
        return () => {
            clearTimeout(temporizador);
            controlador.abort();
        };
    }, [propietario, nombre, intento]);

    if (cargando) {
        return <Cargando texto="Consultando GitHub..." />;
    }

    if (error) {
        const sePuedeReintentar = error.tipo === 'no-disponible' || error.tipo === 'limite';

        return (
            <div className={`alert ${error.tipo === 'no-encontrado' ? 'alert-warning' : 'alert-danger'} mb-0`} role="alert">
                <p className="mb-2">{error.message}</p>
                <div className="d-flex flex-wrap gap-2">
                    <a href={enlace} target="_blank" rel="noopener noreferrer" className="btn btn-outline-primary btn-sm">
                        Abrir el enlace en GitHub
                    </a>
                    {sePuedeReintentar && (
                        <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => setIntento((valor) => valor + 1)}>
                            Intentar de nuevo
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div>
            {repositorio.privado && (
                <div className="alert alert-info" role="note">
                    Este repositorio es privado: solo sus colaboradores pueden verlo en GitHub.
                </div>
            )}

            <dl className="row small mb-3">
                <dt className="col-sm-5">Nombre</dt>
                <dd className="col-sm-7">{repositorio.nombre}</dd>

                <dt className="col-sm-5">Propietario</dt>
                <dd className="col-sm-7">{repositorio.propietario}</dd>

                <dt className="col-sm-5">Descripción</dt>
                <dd className="col-sm-7">{repositorio.descripcion || 'Sin descripción'}</dd>

                <dt className="col-sm-5">Lenguaje principal</dt>
                <dd className="col-sm-7">{repositorio.lenguaje || 'Sin indicar'}</dd>

                <dt className="col-sm-5">Rama principal</dt>
                <dd className="col-sm-7">{repositorio.ramaPrincipal}</dd>

                <dt className="col-sm-5">Última actualización</dt>
                <dd className="col-sm-7">{formatearFecha(repositorio.ultimaActualizacion)}</dd>

                <dt className="col-sm-5">Asuntos abiertos</dt>
                <dd className="col-sm-7">{repositorio.asuntosAbiertos}</dd>
            </dl>

            <a href={repositorio.enlace} target="_blank" rel="noopener noreferrer" className="btn btn-outline-primary btn-sm">
                Ver en GitHub
            </a>
            <p className="small text-muted mt-2 mb-0">Datos obtenidos de la API pública de GitHub.</p>
        </div>
    );
}

export default InfoRepositorio;
