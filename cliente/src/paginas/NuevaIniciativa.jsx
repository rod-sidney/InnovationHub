// NuevaIniciativa.jsx
// Página para publicar una iniciativa
// Carga el catálogo de competencias y al guardar lleva al detalle de la iniciativa nueva con un aviso de éxito

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

import { crearIniciativa } from '../api/iniciativas.js';
import { listarCompetencias } from '../api/competencias.js';
import Cargando from '../componentes/comunes/Cargando.jsx';
import MensajeError from '../componentes/comunes/MensajeError.jsx';
import FormularioIniciativa from '../componentes/iniciativas/FormularioIniciativa.jsx';

function NuevaIniciativa() {
    const navegar = useNavigate();
    const [competencias, setCompetencias] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [intento, setIntento] = useState(0);

    useEffect(() => {
        const controlador = new AbortController();

        async function cargar() {
            setCargando(true);
            setError(null);
            try {
                const lista = await listarCompetencias(controlador.signal);
                if (!controlador.signal.aborted) setCompetencias(lista);
            } catch (errorRecibido) {
                if (!controlador.signal.aborted) setError(errorRecibido);
            } finally {
                if (!controlador.signal.aborted) setCargando(false);
            }
        }

        cargar();
        return () => controlador.abort();
    }, [intento]);

    // El formulario llama a esta función
    // si la API responde un error, el formulario lo muestra
    async function guardar(datos) {
        const creada = await crearIniciativa(datos);
        navegar(`/iniciativas/${creada.id}`, { state: { aviso: 'La iniciativa se publicó correctamente.' } });
    }

    let contenido;
    if (cargando) {
        contenido = <Cargando texto="Preparando el formulario..." />;
    } else if (error) {
        contenido = <MensajeError error={error} onReintentar={() => setIntento((valor) => valor + 1)} />;
    } else {
        contenido = (
            <FormularioIniciativa
                competencias={competencias}
                textoBoton="Publicar iniciativa"
                onGuardar={guardar}
                onCancelar={() => navegar(-1)}
            />
        );
    }

    return (
        <section className="container py-5" aria-labelledby="titulo-nueva">
            <div className="row justify-content-center">
                <div className="col-12 col-lg-9">
                    <div className="text-center mb-4">
                        <h1 id="titulo-nueva" className="fw-bold text-dark">Publicar iniciativa</h1>
                        <p className="text-muted">Comparte una idea, necesidad o reto y forma un equipo para desarrollarla.</p>
                    </div>
                    <div className="card bg-secondary bg-opacity-50 shadow-sm border-0 p-4 p-md-5">
                        {contenido}
                    </div>
                </div>
            </div>
        </section>
    );
}

export default NuevaIniciativa;
