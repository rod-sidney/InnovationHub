// Catalogo.jsx
// Catálogo de iniciativas
// La búsqueda, los filtros, el orden y la paginación los resuelve el servidor
// cliente solo envía la consulta y muestra la página que recibe

import { useEffect, useState } from 'react';

import { listarIniciativas } from '../api/iniciativas.js';
import { listarCompetencias } from '../api/competencias.js';
import { useSesion } from '../contexto/SesionContexto.jsx';
import Aviso from '../componentes/comunes/Aviso.jsx';
import Cargando from '../componentes/comunes/Cargando.jsx';
import MensajeError from '../componentes/comunes/MensajeError.jsx';
import SinResultados from '../componentes/comunes/SinResultados.jsx';
import Paginacion from '../componentes/comunes/Paginacion.jsx';
import FiltrosIniciativas from '../componentes/iniciativas/FiltrosIniciativas.jsx';
import TarjetaIniciativa from '../componentes/iniciativas/TarjetaIniciativa.jsx';

// Todo lo que se envía a GET /api/initiatives vive en un solo objeto de estado
const CONSULTA_INICIAL = {
    q: '',
    type: '',
    category: '',
    skill: '',
    available: false,
    sort: 'recent',
    page: 1,
    size: 9
};

function Catalogo() {
    const { usuario } = useSesion();
    const [consulta, setConsulta] = useState(CONSULTA_INICIAL);
    // Lo que se escribe en "Buscar" pasa a la consulta después de una pausa
    const [textoBusqueda, setTextoBusqueda] = useState('');
    const [resultado, setResultado] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [intento, setIntento] = useState(0);
    const [competencias, setCompetencias] = useState([]);

    // El catálogo de competencias para el filtro se pide una sola vez (dependencias vacías)
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

    // Búsqueda mientras se escribe
    // espera 400 ms sin teclear antes de cambiar la consulta
    useEffect(() => {
        const temporizador = setTimeout(() => {
            const q = textoBusqueda.trim();
            // Se usa la versión anterior del estado, si el texto no cambió, se deja igual
            setConsulta((anterior) => (anterior.q === q ? anterior : { ...anterior, q, page: 1 }));
        }, 400);

        // si se escribe otra letra antes de los 400 ms, el temporizador anterior se cancela
        return () => clearTimeout(temporizador);
    }, [textoBusqueda]);

    // Cada vez que cambia la consulta se pide la página al servidor
    useEffect(() => {
        const controlador = new AbortController();

        async function cargar() {
            setCargando(true);
            setError(null);
            try {
                const pagina = await listarIniciativas(consulta, controlador.signal);
                if (!controlador.signal.aborted) setResultado(pagina);
            } catch (errorRecibido) {
                if (!controlador.signal.aborted) setError(errorRecibido);
            } finally {
                if (!controlador.signal.aborted) setCargando(false);
            }
        }

        cargar();

        // Si la consulta cambia antes de que llegue la respuesta, la petición vieja se cancela
        return () => controlador.abort();
    }, [consulta, intento]);

    // Un cambio de filtro crea un objeto nuevo (estado inmutable) y vuelve a la página 1
    function cambiarFiltro(nombre, valor) {
        setConsulta((anterior) => ({ ...anterior, [nombre]: valor, page: 1 }));
    }

    function cambiarPagina(numero) {
        setConsulta((anterior) => ({ ...anterior, page: numero }));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function limpiarFiltros() {
        setTextoBusqueda('');
        setConsulta(CONSULTA_INICIAL);
    }

    let contenido;
    if (cargando) {
        contenido = <Cargando texto="Buscando iniciativas..." />;
    } else if (error) {
        contenido = <MensajeError error={error} onReintentar={() => setIntento((valor) => valor + 1)} />;
    } else if (resultado.data.length === 0) {
        contenido = (
            <SinResultados mensaje="No se encontraron iniciativas con esos filtros.">
                <button type="button" className="btn btn-link" onClick={limpiarFiltros}>Limpiar filtros</button>
            </SinResultados>
        );
    } else {
        contenido = (
            <>
                <div className="row g-4">
                    {resultado.data.map((iniciativa) => (
                        <div className="col-12 col-md-6 col-lg-4" key={iniciativa.id}>
                            <TarjetaIniciativa iniciativa={iniciativa} idUsuario={usuario?.id} />
                        </div>
                    ))}
                </div>
                <Paginacion pagina={resultado.page} totalPaginas={resultado.totalPages} onCambiar={cambiarPagina} />
            </>
        );
    }

    return (
        <section className="container py-5" aria-labelledby="titulo-catalogo">
            <Aviso />

            <div className="text-center mb-4">
                <h1 id="titulo-catalogo" className="fw-bold text-dark">Catálogo de iniciativas</h1>
                <p className="text-muted">Explora ideas, necesidades y retos, y súmate a un equipo.</p>
            </div>

            <FiltrosIniciativas
                valores={consulta}
                textoBusqueda={textoBusqueda}
                competencias={competencias}
                onCambiarTexto={setTextoBusqueda}
                onCambiarFiltro={cambiarFiltro}
                onLimpiar={limpiarFiltros}
            />

            {/* aria-live anuncia el total a los lectores de pantalla cada vez que cambia */}
            <p className="text-muted small" aria-live="polite">
                {resultado && !cargando && !error
                    ? `${resultado.total} ${resultado.total === 1 ? 'iniciativa encontrada' : 'iniciativas encontradas'}`
                    : ''}
            </p>

            {contenido}
        </section>
    );
}

export default Catalogo;
