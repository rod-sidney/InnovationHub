// Inicio.jsx
// Página principal: presentación de la plataforma, los tipos de iniciativa y la invitación a publicar
// diseño de index.html del Avance 1

import { useEffect, useState } from 'react';
import { Link } from 'react-router';

import { listarIniciativas } from '../api/iniciativas.js';
import Cargando from '../componentes/comunes/Cargando.jsx';
import MensajeError from '../componentes/comunes/MensajeError.jsx';
import SinResultados from '../componentes/comunes/SinResultados.jsx';
import TarjetaIniciativa from '../componentes/iniciativas/TarjetaIniciativa.jsx';

// tipos se dibujan con map, el contenido vive en un arreglo
const TIPOS_DE_INICIATIVA = [
    {
        tipo: 'Idea',
        descripcion: 'Una propuesta de solución, producto o servicio. Ideal si tienes una visión y buscas equipo para desarrollarla.'
    },
    {
        tipo: 'Necesidad',
        descripcion: 'Una situación problemática que aún no tiene una solución definida. Perfecto si necesitas apoyo técnico.'
    },
    {
        tipo: 'Reto',
        descripcion: 'Un problema delimitado que requiere que uno o varios equipos propongan una solución concreta e innovadora.'
    }
];

function Inicio() {
    const [recientes, setRecientes] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    // Cambiar este número vuelve a ejecutar el efecto (botón "Intentar de nuevo")
    const [intento, setIntento] = useState(0);

    useEffect(() => {
        // AbortController permite cancelar la petición si el componente se desmonta
        const controlador = new AbortController();

        async function cargar() {
            setCargando(true);
            setError(null);
            try {
                const pagina = await listarIniciativas({ sort: 'recent', size: 3 }, controlador.signal);
                if (!controlador.signal.aborted) setRecientes(pagina.data);
            } catch (errorRecibido) {
                // Si la petición se canceló, el componente ya no está y no hay nada que mostrar
                if (!controlador.signal.aborted) setError(errorRecibido);
            } finally {
                if (!controlador.signal.aborted) setCargando(false);
            }
        }

        cargar();

        // Limpieza: se ejecuta al desmontar el componente o antes de repetir el efecto
        return () => controlador.abort();
    }, [intento]);

    // Los tres estados de una pantalla que consulta la API
    // carga, error y resultado vacío
    let contenidoRecientes;
    if (cargando) {
        contenidoRecientes = <Cargando texto="Cargando iniciativas..." />;
    } else if (error) {
        contenidoRecientes = <MensajeError error={error} onReintentar={() => setIntento((valor) => valor + 1)} />;
    } else if (recientes.length === 0) {
        contenidoRecientes = <SinResultados mensaje="Todavía no hay iniciativas para mostrar." />;
    } else {
        contenidoRecientes = (
            <div className="row g-4">
                {recientes.map((iniciativa) => (
                    <div className="col-12 col-md-6 col-lg-4" key={iniciativa.id}>
                        <TarjetaIniciativa iniciativa={iniciativa} />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <>
            <section className="hero bg-light py-5">
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col-lg-6 text-center text-lg-start mb-4 mb-lg-0">
                            <h1 className="display-5 fw-bold text-dark mb-3">Bienvenido a <br />Innovation Hub</h1>
                            <p className="lead mb-4">
                                Conectamos ideas, necesidades y retos con personas para facilitar la creación de
                                equipos interdisciplinarios.
                            </p>
                            <Link to="/iniciativas" className="btn btn-primary btn-lg">¡Súmate a una iniciativa!</Link>
                        </div>
                        <div className="col-lg-6">
                            <img
                                src="https://picsum.photos/id/119/600/400"
                                className="img-fluid rounded shadow"
                                alt="Equipo trabajando en Innovation Hub"
                            />
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-5 bg-secondary bg-opacity-10" aria-labelledby="titulo-como-funciona">
                <div className="container text-center">
                    <h2 id="titulo-como-funciona" className="fw-bold mb-3">¿Cómo funciona?</h2>
                    <p className="text-muted mb-5">
                        Nuestra plataforma clasifica las oportunidades de colaboración en tres tipos principales
                        para que puedas encontrar exactamente lo que buscas:
                    </p>
                    <div className="row g-4">
                        {TIPOS_DE_INICIATIVA.map((elemento) => (
                            <div className="col-12 col-md-4" key={elemento.tipo}>
                                <article className="card h-100 border-0 shadow-sm">
                                    <div className="card-body">
                                        <h3 className="card-title h5 text-primary fw-bold">{elemento.tipo}</h3>
                                        <p className="card-text text-start">{elemento.descripcion}</p>
                                    </div>
                                </article>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-5" aria-labelledby="titulo-iniciativas">
                <div className="container">
                    <div className="text-center mb-5">
                        <h2 id="titulo-iniciativas" className="fw-bold">Iniciativas recientes</h2>
                        <p className="text-muted">Echa un vistazo a las últimas iniciativas publicadas.</p>
                    </div>

                    {contenidoRecientes}

                    <div className="text-center mt-5">
                        <Link to="/iniciativas" className="text-decoration-none fw-bold">
                            Ver todo el catálogo de iniciativas &rarr;
                        </Link>
                    </div>
                </div>
            </section>

            <section className="py-5 bg-secondary bg-opacity-10" aria-labelledby="titulo-publicacion">
                <div className="container">
                    <div className="row align-items-center mb-4">
                        <div className="col-md-8 text-center text-md-start mb-4 mb-md-0">
                            <h2 id="titulo-publicacion" className="fw-bold mb-3">Publicación de iniciativas</h2>
                            <p className="lead">
                                Si tienes una idea, necesidad o reto que quieras compartir con la comunidad para
                                conseguir apoyo, puedes publicarla directamente en Innovation Hub.
                            </p>
                        </div>
                        <div className="col-md-4 text-center">
                            <img
                                src="https://picsum.photos/id/2/300/300"
                                className="img-fluid rounded-circle shadow"
                                alt="Ilustración de publicación"
                            />
                        </div>
                    </div>
                    <div className="text-center mt-4">
                        <Link to="/iniciativas/nueva" className="btn btn-primary btn-lg px-5">Publicar iniciativa</Link>
                    </div>
                </div>
            </section>
        </>
    );
}

export default Inicio;
