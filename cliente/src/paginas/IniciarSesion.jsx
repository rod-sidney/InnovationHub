// IniciarSesion.jsx
// Formulario controlado de inicio de sesión
// Al entrar, vuelve a la página desde la que se pidió iniciar sesión (state.desde) o al inicio

import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router';

import { useSesion } from '../contexto/SesionContexto.jsx';
import Campo from '../componentes/comunes/Campo.jsx';
import { validarInicioSesion, erroresDelServidor, hayErrores } from '../utils/validaciones.js';

const CUENTAS_DE_PRUEBA = [
    { correo: 'cmontero@ucenfotec.ac.cr', descripcion: 'Estudiante con iniciativas propias y solicitudes recibidas' },
    { correo: 'svargas@ucenfotec.ac.cr', descripcion: 'Estudiante propietaria de una iniciativa restringida' },
    { correo: 'vmorales@ucenfotec.ac.cr', descripcion: 'Estudiante con equipo listo para convertir en proyecto' },
    { correo: 'lmendez@ucenfotec.ac.cr', descripcion: 'Estudiante propietaria del proyecto TutorHub' },
    { correo: 'ecampos@ucenfotec.ac.cr', descripcion: 'Docente con una iniciativa institucional y un proyecto' },
    { correo: 'admin.innovationhub@ucenfotec.ac.cr', descripcion: 'La única cuenta de administrador' }
];

function IniciarSesion() {
    const { usuario, iniciarSesion } = useSesion();
    const navegar = useNavigate();
    const ubicacion = useLocation();
    // Si otra página mandó aquí a la persona, guardó su dirección en state.desde
    const destino = ubicacion.state?.desde || '/';

    const [valores, setValores] = useState({ email: '', password: '' });
    const [errores, setErrores] = useState({});
    const [errorGeneral, setErrorGeneral] = useState('');
    const [enviando, setEnviando] = useState(false);

    // Con la sesión ya iniciada no tiene sentido mostrar el formulario
    if (usuario) {
        return <Navigate to={destino} replace />;
    }

    // Formulario controlado: cada cambio crea un objeto nuevo con el campo actualizado
    function cambiar(evento) {
        const { name, value } = evento.target;
        setValores((anteriores) => ({ ...anteriores, [name]: value }));
    }

    async function enviar(evento) {
        evento.preventDefault();

        const encontrados = validarInicioSesion(valores);
        setErrores(encontrados);
        setErrorGeneral('');
        if (hayErrores(encontrados)) {
            return;
        }

        setEnviando(true);
        try {
            await iniciarSesion({ email: valores.email.trim(), password: valores.password });
            navegar(destino, { replace: true });
        } catch (error) {
            // 401 server no dice si falló el correo o la contraseña
            setErrorGeneral(error.message);
            setErrores(erroresDelServidor(error));
            setEnviando(false);
        }
    }

    return (
        <section className="container py-5" aria-labelledby="titulo-inicio-sesion">
            <div className="row justify-content-center">
                <div className="col-12 col-md-8 col-lg-5">
                    <h1 id="titulo-inicio-sesion" className="fw-bold text-dark text-center mb-4">Iniciar sesión</h1>

                    <div className="card bg-secondary bg-opacity-50 shadow-sm border-0 p-4">
                        {errorGeneral && <div className="alert alert-danger" role="alert">{errorGeneral}</div>}

                        <form onSubmit={enviar} noValidate>
                            <Campo id="email" etiqueta="Correo electrónico" obligatorio error={errores.email}>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    className={`form-control ${errores.email ? 'is-invalid' : ''}`}
                                    aria-invalid={Boolean(errores.email)}
                                    aria-describedby={errores.email ? 'email-error' : undefined}
                                    value={valores.email}
                                    onChange={cambiar}
                                />
                            </Campo>

                            <Campo id="password" etiqueta="Contraseña" obligatorio error={errores.password}>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    className={`form-control ${errores.password ? 'is-invalid' : ''}`}
                                    aria-invalid={Boolean(errores.password)}
                                    aria-describedby={errores.password ? 'password-error' : undefined}
                                    value={valores.password}
                                    onChange={cambiar}
                                />
                            </Campo>

                            <div className="d-grid mt-4">
                                <button type="submit" className="btn btn-primary btn-lg fw-bold" disabled={enviando}>
                                    {enviando ? 'Entrando...' : 'Iniciar sesión'}
                                </button>
                            </div>
                        </form>

                        <p className="text-center mt-4 mb-0">
                            ¿No tienes cuenta? <Link to="/registro" className="fw-semibold">Crea una cuenta</Link>
                        </p>
                    </div>

                    <details className="mt-4">
                        <summary className="fw-semibold">Cuentas de prueba</summary>
                        <p className="small text-muted mt-2">Todas usan la contraseña <code>Hub12345</code>.</p>
                        <ul className="small">
                            {CUENTAS_DE_PRUEBA.map((cuenta) => (
                                <li key={cuenta.correo}><code>{cuenta.correo}</code>: {cuenta.descripcion}</li>
                            ))}
                        </ul>
                    </details>
                </div>
            </div>
        </section>
    );
}

export default IniciarSesion;
