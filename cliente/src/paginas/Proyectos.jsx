// Proyectos.jsx
// Proyectos que el usuario puede ver (según la visibilidad de su iniciativa de origen), con orden y paginación desde el servidor

import { useEffect, useState } from 'react';

import { listarProyectos } from '../api/proyectos.js';
import Cargando from '../componentes/comunes/Cargando.jsx';
import MensajeError from '../componentes/comunes/MensajeError.jsx';
import SinResultados from '../componentes/comunes/SinResultados.jsx';
import Paginacion from '../componentes/comunes/Paginacion.jsx';
import TarjetaProyecto from '../componentes/proyectos/TarjetaProyecto.jsx';

function Proyectos() {
    const [consulta, setConsulta] = useState({ sort: 'recent', page: 1, size: 9 });
    const [resultado, setResultado] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [intento, setIntento] = useState(0);

    useEffect(() => {
        const controlador = new AbortController();

        async function cargar() {
            setCargando(true);
            setError(null);
            try {
                const pagina = await listarProyectos(consulta, controlador.signal);
                if (!controlador.signal.aborted) setResultado(pagina);
            } catch (errorRecibido) {
                if (!controlador.signal.aborted) setError(errorRecibido);
            } finally {
                if (!controlador.signal.aborted) setCargando(false);
            }
        }

        cargar();
        return () => controlador.abort();
    }, [consulta, intento]);

    let contenido;
    if (cargando) {
        contenido = <Cargando texto="Cargando proyectos..." />;
    } else if (error) {
        contenido = <MensajeError error={error} onReintentar={() => setIntento((valor) => valor + 1)} />;
    } else if (resultado.data.length === 0) {
        contenido = <SinResultados mensaje="Todavía no hay proyectos que puedas ver." />;
    } else {
        contenido = (
            <>
                <div className="row g-4">
                    {resultado.data.map((proyecto) => (
                        <div className="col-12 col-md-6 col-lg-4" key={proyecto.id}>
                            <TarjetaProyecto proyecto={proyecto} />
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
        <section className="container py-5" aria-labelledby="titulo-proyectos">
            <div className="text-center mb-4">
                <h1 id="titulo-proyectos" className="fw-bold text-dark">Proyectos</h1>
                <p className="text-muted">Iniciativas que ya formaron su equipo y comenzaron su desarrollo.</p>
            </div>

            <div className="d-flex justify-content-end mb-3">
                <label htmlFor="orden-proyectos" className="form-label fw-semibold me-2 mb-0 align-self-center">Ordenar por</label>
                <select
                    id="orden-proyectos"
                    className="form-select w-auto"
                    value={consulta.sort}
                    onChange={(evento) => setConsulta({ ...consulta, sort: evento.target.value, page: 1 })}
                >
                    <option value="recent">Más recientes</option>
                    <option value="oldest">Más antiguos</option>
                </select>
            </div>

            {contenido}
        </section>
    );
}

export default Proyectos;
