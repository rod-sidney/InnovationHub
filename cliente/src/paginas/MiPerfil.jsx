// MiPerfil.jsx
// Perfil del usuario de la sesión: consulta y modificación
// Los datos se piden al servidor al entrar, para mostrar siempre la versión guardada

import { useEffect, useState } from 'react';

import { obtenerUsuario, actualizarPerfil } from '../api/usuarios.js';
import { listarCompetencias } from '../api/competencias.js';
import { useSesion } from '../contexto/SesionContexto.jsx';
import Cargando from '../componentes/comunes/Cargando.jsx';
import MensajeError from '../componentes/comunes/MensajeError.jsx';
import VistaPerfil from '../componentes/usuarios/VistaPerfil.jsx';
import FormularioPerfil from '../componentes/usuarios/FormularioPerfil.jsx';
import IniciativasDelUsuario from '../componentes/usuarios/IniciativasDelUsuario.jsx';

function MiPerfil() {
    const { usuario, actualizarUsuario } = useSesion();
    const [perfil, setPerfil] = useState(null);
    const [catalogo, setCatalogo] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [editando, setEditando] = useState(false);
    const [mensaje, setMensaje] = useState('');

    useEffect(() => {
        const controlador = new AbortController();

        async function cargar() {
            setCargando(true);
            setError(null);
            try {
                const [datos, lista] = await Promise.all([
                    obtenerUsuario(usuario.id, controlador.signal),
                    listarCompetencias(controlador.signal)
                ]);
                if (!controlador.signal.aborted) {
                    setPerfil(datos);
                    setCatalogo(lista);
                }
            } catch (errorRecibido) {
                if (!controlador.signal.aborted) setError(errorRecibido);
            } finally {
                if (!controlador.signal.aborted) setCargando(false);
            }
        }

        cargar();
        return () => controlador.abort();
    }, [usuario.id]);

    async function guardar(datos) {
        const actualizado = await actualizarPerfil(usuario.id, datos);
        setPerfil(actualizado);
        // La sesión también se actualiza, el encabezado muestra el nombre nuevo
        actualizarUsuario(actualizado);
        setEditando(false);
        setMensaje('Tu perfil se guardó correctamente.');
    }

    let contenido;
    if (cargando) {
        contenido = <Cargando texto="Cargando tu perfil..." />;
    } else if (error) {
        contenido = <MensajeError error={error} />;
    } else if (editando) {
        contenido = (
            <FormularioPerfil
                perfil={perfil}
                catalogo={catalogo}
                onGuardar={guardar}
                onCancelar={() => setEditando(false)}
            />
        );
    } else {
        contenido = (
            <VistaPerfil perfil={perfil}>
                <button
                    type="button"
                    className="btn btn-warning fw-bold"
                    onClick={() => {
                        setMensaje('');
                        setEditando(true);
                    }}
                >
                    Editar perfil
                </button>
            </VistaPerfil>
        );
    }

    return (
        <section className="container py-5" aria-labelledby="titulo-perfil">
            <h1 id="titulo-perfil" className="fw-bold text-dark mb-4">Mi perfil</h1>

            {mensaje && <div className="alert alert-success" role="status">{mensaje}</div>}

            {contenido}

            <h2 className="h4 fw-bold text-dark mt-5 mb-3">Iniciativas en las que participo</h2>
            <IniciativasDelUsuario idUsuario={usuario.id} />
        </section>
    );
}

export default MiPerfil;
