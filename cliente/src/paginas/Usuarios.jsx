// Usuarios.jsx
// Búsqueda de personas para colaborar
// La búsqueda por nombre y carrera, los filtros, el orden y la paginación los resuelve el servidor

import { useEffect, useState } from 'react';

import { buscarUsuarios } from '../api/usuarios.js';
import { listarCompetencias } from '../api/competencias.js';
import Cargando from '../componentes/comunes/Cargando.jsx';
import MensajeError from '../componentes/comunes/MensajeError.jsx';
import SinResultados from '../componentes/comunes/SinResultados.jsx';
import Paginacion from '../componentes/comunes/Paginacion.jsx';
import FiltrosUsuarios from '../componentes/usuarios/FiltrosUsuarios.jsx';
import TarjetaUsuario from '../componentes/usuarios/TarjetaUsuario.jsx';

const CONSULTA_INICIAL = { q: '', career: '', skill: '', availability: '', memberType: '', sort: 'name', page: 1, size: 9 };
const TEXTOS_INICIALES = { q: '', career: '' };

function Usuarios() {
    const [consulta, setConsulta] = useState(CONSULTA_INICIAL);
    // Lo que se escribe en Nombre y Carrera pasa a la consulta después de una pausa
    const [textos, setTextos] = useState(TEXTOS_INICIALES);
    const [resultado, setResultado] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [intento, setIntento] = useState(0);
    const [competencias, setCompetencias] = useState([]);

    useEffect(() => {
        const controlador = new AbortController();

        async function cargarCompetencias() {
            try {
                const lista = await listarCompetencias(controlador.signal);
                if (!controlador.signal.aborted) setCompetencias(lista);
            } catch {
                // Sin el catálogo, el filtro de competencia solo muestra "Todas"
            }
        }

        cargarCompetencias();
        return () => controlador.abort();
    }, []);

    // Espera 400 ms sin teclear antes de aplicar los textos a la consulta
    useEffect(() => {
        const temporizador = setTimeout(() => {
            const q = textos.q.trim();
            const career = textos.career.trim();
            setConsulta((anterior) => (
                anterior.q === q && anterior.career === career ? anterior : { ...anterior, q, career, page: 1 }
            ));
        }, 400);

        return () => clearTimeout(temporizador);
    }, [textos]);

    useEffect(() => {
        const controlador = new AbortController();

        async function cargar() {
            setCargando(true);
            setError(null);
            try {
                const pagina = await buscarUsuarios(consulta, controlador.signal);
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

    function cambiarTexto(nombre, valor) {
        setTextos((anteriores) => ({ ...anteriores, [nombre]: valor }));
    }

    function cambiarFiltro(nombre, valor) {
        setConsulta((anterior) => ({ ...anterior, [nombre]: valor, page: 1 }));
    }

    function limpiarFiltros() {
        setTextos(TEXTOS_INICIALES);
        setConsulta(CONSULTA_INICIAL);
    }

    let contenido;
    if (cargando) {
        contenido = <Cargando texto="Buscando personas..." />;
    } else if (error) {
        contenido = <MensajeError error={error} onReintentar={() => setIntento((valor) => valor + 1)} />;
    } else if (resultado.data.length === 0) {
        contenido = (
            <SinResultados mensaje="No se encontraron personas con esos filtros.">
                <button type="button" className="btn btn-link" onClick={limpiarFiltros}>Limpiar filtros</button>
            </SinResultados>
        );
    } else {
        contenido = (
            <>
                <div className="row g-4">
                    {resultado.data.map((usuario) => (
                        <div className="col-12 col-md-6 col-lg-4" key={usuario.id}>
                            <TarjetaUsuario usuario={usuario} />
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
        <section className="container py-5" aria-labelledby="titulo-usuarios">
            <div className="text-center mb-4">
                <h1 id="titulo-usuarios" className="fw-bold text-dark">Buscar personas</h1>
                <p className="text-muted">Encuentra estudiantes, docentes y personal con las competencias que necesitas.</p>
            </div>

            <FiltrosUsuarios
                valores={consulta}
                textos={textos}
                competencias={competencias}
                onCambiarTexto={cambiarTexto}
                onCambiarFiltro={cambiarFiltro}
                onLimpiar={limpiarFiltros}
            />

            <p className="text-muted small" aria-live="polite">
                {resultado && !cargando && !error
                    ? `${resultado.total} ${resultado.total === 1 ? 'persona encontrada' : 'personas encontradas'}`
                    : ''}
            </p>

            {contenido}
        </section>
    );
}

export default Usuarios;
