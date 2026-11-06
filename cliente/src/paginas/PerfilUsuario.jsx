// PerfilUsuario.jsx
// Perfil de otra persona (/usuarios/:id)
// Muestra los datos públicos del perfil y las iniciativas en las que participa que quien consulta puede ver

import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';

import { obtenerUsuario } from '../api/usuarios.js';
import { useSesion } from '../contexto/SesionContexto.jsx';
import Cargando from '../componentes/comunes/Cargando.jsx';
import MensajeError from '../componentes/comunes/MensajeError.jsx';
import VistaPerfil from '../componentes/usuarios/VistaPerfil.jsx';
import IniciativasDelUsuario from '../componentes/usuarios/IniciativasDelUsuario.jsx';

function PerfilUsuario() {
    const { id } = useParams();
    const { usuario } = useSesion();
    const [perfil, setPerfil] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const controlador = new AbortController();

        async function cargar() {
            setCargando(true);
            setError(null);
            try {
                const datos = await obtenerUsuario(id, controlador.signal);
                if (!controlador.signal.aborted) setPerfil(datos);
            } catch (errorRecibido) {
                if (!controlador.signal.aborted) setError(errorRecibido);
            } finally {
                if (!controlador.signal.aborted) setCargando(false);
            }
        }

        cargar();
        return () => controlador.abort();
    }, [id]);

    let contenido;
    if (cargando) {
        contenido = <Cargando texto="Cargando el perfil..." />;
    } else if (error) {
        contenido = <MensajeError error={error} />;
    } else {
        contenido = (
            <>
                <VistaPerfil perfil={perfil}>
                    {perfil.id === usuario.id && <Link to="/perfil" className="btn btn-outline-primary">Ir a mi perfil</Link>}
                </VistaPerfil>
                <h2 className="h4 fw-bold text-dark mt-5 mb-3">Iniciativas en las que participa</h2>
                <IniciativasDelUsuario idUsuario={perfil.id} />
            </>
        );
    }

    return (
        <section className="container py-5" aria-labelledby="titulo-perfil-usuario">
            <Link to="/usuarios" className="d-inline-block mb-3">&larr; Volver a la búsqueda de usuarios</Link>
            <h1 id="titulo-perfil-usuario" className="fw-bold text-dark mb-4">Perfil</h1>
            {contenido}
        </section>
    );
}

export default PerfilUsuario;
