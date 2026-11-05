// Registro.jsx
// Formulario controlado para crear una cuenta
// Valida en el cliente y, si el servidor rechaza algún dato (400) o el correo ya existe (409), muestra mensaje

import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router';

import { useSesion } from '../contexto/SesionContexto.jsx';
import Campo from '../componentes/comunes/Campo.jsx';
import CampoImagen from '../componentes/comunes/CampoImagen.jsx';
import { TIPOS_MIEMBRO, opcionesDe } from '../utils/etiquetas.js';
import { validarRegistro, erroresDelServidor, hayErrores } from '../utils/validaciones.js';

const VALORES_INICIALES = {
    photo: null,
    firstName: '',
    lastName: '',
    secondLastName: '',
    memberType: '',
    career: '',
    email: '',
    password: '',
    passwordConfirmation: '',
    acceptTerms: false
};

function Registro() {
    const { usuario, registrarse } = useSesion();
    const navegar = useNavigate();

    const [valores, setValores] = useState(VALORES_INICIALES);
    const [errores, setErrores] = useState({});
    const [errorGeneral, setErrorGeneral] = useState('');
    const [enviando, setEnviando] = useState(false);

    if (usuario) {
        return <Navigate to="/" replace />;
    }

    // Sirve para inputs de texto, selects y casillas, las casillas usan checked en lugar de value
    function cambiar(evento) {
        const { name, value, type, checked } = evento.target;
        setValores((anteriores) => ({ ...anteriores, [name]: type === 'checkbox' ? checked : value }));
    }

    // Atajo para las propiedades que repiten todos los inputs de texto
    function propiedadesDe(nombre) {
        return {
            id: nombre,
            name: nombre,
            value: valores[nombre],
            onChange: cambiar,
            'aria-invalid': Boolean(errores[nombre]),
            'aria-describedby': errores[nombre] ? `${nombre}-error` : undefined
        };
    }

    async function enviar(evento) {
        evento.preventDefault();

        const encontrados = validarRegistro(valores);
        setErrores(encontrados);
        setErrorGeneral('');
        if (hayErrores(encontrados)) {
            setErrorGeneral('Revisa los campos marcados.');
            return;
        }

        setEnviando(true);
        try {
            await registrarse({ ...valores, email: valores.email.trim() });
            navegar('/', { replace: true });
        } catch (error) {
            setErrorGeneral(error.message);
            setErrores(erroresDelServidor(error));
            setEnviando(false);
        }
    }

    return (
        <section className="container py-5" aria-labelledby="titulo-registro">
            <div className="row justify-content-center">
                <div className="col-12 col-lg-8">
                    <div className="text-center mb-4">
                        <h1 id="titulo-registro" className="fw-bold text-dark">Crear cuenta</h1>
                        <p className="text-muted">
                            Regístrate para publicar iniciativas y formar parte de equipos interdisciplinarios.
                        </p>
                    </div>

                    <div className="card bg-secondary bg-opacity-50 shadow-sm border-0 p-4 p-md-5">
                        {errorGeneral && <div className="alert alert-danger" role="alert">{errorGeneral}</div>}

                        <form onSubmit={enviar} noValidate>
                            <fieldset className="mb-4">
                                <legend className="h5 fw-bold text-primary border-bottom pb-2 mb-4">Datos personales</legend>

                                <CampoImagen
                                    id="photo"
                                    etiqueta="Foto de perfil"
                                    valor={valores.photo}
                                    onCambiar={(foto) => setValores((anteriores) => ({ ...anteriores, photo: foto }))}
                                    ladoMaximo={300}
                                    redonda
                                    error={errores.photo}
                                />

                                <div className="row g-3">
                                    <div className="col-md-4">
                                        <Campo id="firstName" etiqueta="Nombre" obligatorio error={errores.firstName}>
                                            <input
                                                type="text"
                                                autoComplete="given-name"
                                                maxLength={40}
                                                className={`form-control ${errores.firstName ? 'is-invalid' : ''}`}
                                                {...propiedadesDe('firstName')}
                                            />
                                        </Campo>
                                    </div>
                                    <div className="col-md-4">
                                        <Campo id="lastName" etiqueta="Primer apellido" obligatorio error={errores.lastName}>
                                            <input
                                                type="text"
                                                autoComplete="family-name"
                                                maxLength={40}
                                                className={`form-control ${errores.lastName ? 'is-invalid' : ''}`}
                                                {...propiedadesDe('lastName')}
                                            />
                                        </Campo>
                                    </div>
                                    <div className="col-md-4">
                                        <Campo id="secondLastName" etiqueta="Segundo apellido" ayuda="Opcional." error={errores.secondLastName}>
                                            <input
                                                type="text"
                                                maxLength={40}
                                                className={`form-control ${errores.secondLastName ? 'is-invalid' : ''}`}
                                                {...propiedadesDe('secondLastName')}
                                            />
                                        </Campo>
                                    </div>
                                </div>

                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <Campo
                                            id="memberType"
                                            etiqueta="Tipo de miembro"
                                            obligatorio
                                            error={errores.memberType}
                                            ayuda='Tu relación con la universidad. "Administrativo" no da permisos de administrador.'
                                        >
                                            <select
                                                className={`form-select ${errores.memberType ? 'is-invalid' : ''}`}
                                                {...propiedadesDe('memberType')}
                                            >
                                                <option value="">Seleccione una opción</option>
                                                {opcionesDe(TIPOS_MIEMBRO).map((opcion) => (
                                                    <option key={opcion.valor} value={opcion.valor}>{opcion.etiqueta}</option>
                                                ))}
                                            </select>
                                        </Campo>
                                    </div>
                                    <div className="col-md-6">
                                        <Campo id="career" etiqueta="Carrera o área profesional" obligatorio error={errores.career}>
                                            <input
                                                type="text"
                                                maxLength={80}
                                                placeholder="Ej: Desarrollo de Software"
                                                className={`form-control ${errores.career ? 'is-invalid' : ''}`}
                                                {...propiedadesDe('career')}
                                            />
                                        </Campo>
                                    </div>
                                </div>
                            </fieldset>

                            <fieldset className="mb-4">
                                <legend className="h5 fw-bold text-primary border-bottom pb-2 mb-4">Datos de acceso</legend>

                                <Campo id="email" etiqueta="Correo electrónico" obligatorio error={errores.email}>
                                    <input
                                        type="email"
                                        autoComplete="email"
                                        maxLength={100}
                                        placeholder="nombre@ucenfotec.ac.cr"
                                        className={`form-control ${errores.email ? 'is-invalid' : ''}`}
                                        {...propiedadesDe('email')}
                                    />
                                </Campo>

                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <Campo
                                            id="password"
                                            etiqueta="Contraseña"
                                            obligatorio
                                            error={errores.password}
                                            ayuda="De 8 a 64 caracteres, con letras y números."
                                        >
                                            <input
                                                type="password"
                                                autoComplete="new-password"
                                                maxLength={64}
                                                className={`form-control ${errores.password ? 'is-invalid' : ''}`}
                                                {...propiedadesDe('password')}
                                            />
                                        </Campo>
                                    </div>
                                    <div className="col-md-6">
                                        <Campo id="passwordConfirmation" etiqueta="Confirmar contraseña" obligatorio error={errores.passwordConfirmation}>
                                            <input
                                                type="password"
                                                autoComplete="new-password"
                                                maxLength={64}
                                                className={`form-control ${errores.passwordConfirmation ? 'is-invalid' : ''}`}
                                                {...propiedadesDe('passwordConfirmation')}
                                            />
                                        </Campo>
                                    </div>
                                </div>

                                <div className="form-check mt-2">
                                    <input
                                        id="acceptTerms"
                                        name="acceptTerms"
                                        type="checkbox"
                                        className={`form-check-input ${errores.acceptTerms ? 'is-invalid' : ''}`}
                                        checked={valores.acceptTerms}
                                        onChange={cambiar}
                                        aria-describedby={errores.acceptTerms ? 'acceptTerms-error' : undefined}
                                    />
                                    <label className="form-check-label" htmlFor="acceptTerms">
                                        Acepto los términos de uso de Innovation Hub <span className="text-danger" aria-hidden="true">*</span>
                                    </label>
                                    {errores.acceptTerms && (
                                        <div id="acceptTerms-error" className="invalid-feedback d-block">{errores.acceptTerms}</div>
                                    )}
                                </div>

                                <details className="mt-3">
                                    <summary className="small fw-semibold">Leer los términos de uso</summary>
                                    <ul className="small mt-2 mb-0">
                                        <li>La información de tu perfil y de tus iniciativas debe ser verdadera.</li>
                                        <li>Respeta el nivel de visibilidad que cada autor eligió para su iniciativa.</li>
                                        <li>No compartas fuera de la plataforma el contenido restringido o privado de los equipos.</li>
                                        <li>La universidad puede moderar o archivar contenido que incumpla estas reglas.</li>
                                    </ul>
                                </details>
                            </fieldset>

                            <div className="d-grid pt-3 border-top">
                                <button type="submit" className="btn btn-primary btn-lg fw-bold" disabled={enviando}>
                                    {enviando ? 'Creando la cuenta...' : 'Crear cuenta'}
                                </button>
                            </div>
                        </form>

                        <p className="text-center mt-4 mb-0">
                            ¿Ya tienes cuenta? <Link to="/iniciar-sesion" className="fw-semibold">Inicia sesión</Link>
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Registro;
