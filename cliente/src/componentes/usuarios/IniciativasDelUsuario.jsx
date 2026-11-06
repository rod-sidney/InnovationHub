// IniciativasDelUsuario.jsx
// Iniciativas en las que participa una persona (como propietaria o miembro)
// Pide los datos por su cuenta con el filtro member del catálogo
// el servidor solo devuelve las que quien consulta puede ver, así que una iniciativa privada ajena nunca aparece

import { useEffect, useState } from 'react';
import { Link } from 'react-router';

import { listarIniciativas } from '../../api/iniciativas.js';
import Cargando from '../comunes/Cargando.jsx';
import MensajeError from '../comunes/MensajeError.jsx';
import SinResultados from '../comunes/SinResultados.jsx';
import Estado from '../comunes/Estado.jsx';
import { TIPOS, CATEGORIAS, ESTADOS_INICIATIVA } from '../../utils/etiquetas.js';

function IniciativasDelUsuario({ idUsuario }) {
    const [iniciativas, setIniciativas] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const controlador = new AbortController();

        async function cargar() {
            setCargando(true);
            setError(null);
            try {
                const pagina = await listarIniciativas({ member: idUsuario, sort: 'recent', size: 50 }, controlador.signal);
                if (!controlador.signal.aborted) setIniciativas(pagina.data);
            } catch (errorRecibido) {
                if (!controlador.signal.aborted) setError(errorRecibido);
            } finally {
                if (!controlador.signal.aborted) setCargando(false);
            }
        }

        cargar();
        return () => controlador.abort();
    }, [idUsuario]);

    if (cargando) return <Cargando texto="Cargando iniciativas..." />;
    if (error) return <MensajeError error={error} />;
    if (iniciativas.length === 0) return <SinResultados mensaje="No participa en iniciativas que puedas ver." />;

    return (
        <div className="d-flex flex-column gap-3">
            {iniciativas.map((iniciativa) => (
                <article key={iniciativa.id} className="card card-iniciativa border border-secondary">
                    <div className="card-header bg-secondary fw-bold text-dark border-0 d-flex justify-content-between align-items-center gap-2">
                        <span>{TIPOS[iniciativa.type]} · {CATEGORIAS[iniciativa.category]}</span>
                        <span className="badge bg-light text-dark border">
                            {iniciativa.owner.id === idUsuario ? 'Propietario' : 'Miembro'}
                        </span>
                    </div>
                    <div className="card-body d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                        <div>
                            <h3 className="h5 fw-bold mb-1">{iniciativa.title}</h3>
                            <p className="small mb-0">
                                <Estado valor={iniciativa.status} etiqueta={ESTADOS_INICIATIVA[iniciativa.status]} />
                            </p>
                        </div>
                        <Link to={`/iniciativas/${iniciativa.id}`} className="btn btn-outline-primary btn-sm">Ir a la iniciativa</Link>
                    </div>
                </article>
            ))}
        </div>
    );
}

export default IniciativasDelUsuario;
