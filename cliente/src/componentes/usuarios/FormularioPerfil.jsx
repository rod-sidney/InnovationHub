// FormularioPerfil.jsx
// Formulario controlado para modificar el propio perfil
// El correo se muestra pero no se puede editar: identifica la cuenta y el servidor rechaza cualquier cambio

import { useState } from 'react';

import Campo from '../comunes/Campo.jsx';
import Contador from '../comunes/Contador.jsx';
import CampoEtiquetas from '../comunes/CampoEtiquetas.jsx';
import CampoImagen from '../comunes/CampoImagen.jsx';
import CompetenciasConNivel from './CompetenciasConNivel.jsx';
import { DISPONIBILIDADES, opcionesDe } from '../../utils/etiquetas.js';
import { validarPerfil, erroresDelServidor, hayErrores } from '../../utils/validaciones.js';

// Convierte el perfil de la API en los valores del formulario
function valoresDesdePerfil(perfil) {
    return {
        photo: perfil.photo,
        firstName: perfil.firstName,
        lastName: perfil.lastName,
        secondLastName: perfil.secondLastName,
        career: perfil.career,
        description: perfil.description,
        interests: perfil.interests,
        availability: perfil.availability || '',
        portfolio: perfil.portfolio,
        skills: perfil.skills.map((elemento) => ({ skillId: elemento.skill.id, level: elemento.level }))
    };
}

function FormularioPerfil({ perfil, catalogo, onGuardar, onCancelar }) {
    const [valores, setValores] = useState(() => valoresDesdePerfil(perfil));
    const [errores, setErrores] = useState({});
    const [errorGeneral, setErrorGeneral] = useState('');
    const [enviando, setEnviando] = useState(false);

    function cambiar(evento) {
        const { name, value } = evento.target;
        setValores((anteriores) => ({ ...anteriores, [name]: value }));
    }

    function cambiarValor(nombre, valor) {
        setValores((anteriores) => ({ ...anteriores, [nombre]: valor }));
    }

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

        const encontrados = validarPerfil(valores);
        setErrores(encontrados);
        setErrorGeneral('');
        if (hayErrores(encontrados)) {
            setErrorGeneral('Revisa los campos marcados.');
            return;
        }

        setEnviando(true);
        try {
            // Sin disponibilidad elegida se envía null, como indica el contrato
            await onGuardar({ ...valores, availability: valores.availability || null });
        } catch (error) {
            setErrorGeneral(error.message);
            setErrores(erroresDelServidor(error));
            setEnviando(false);
        }
    }

    return (
        <form className="card border-0 shadow-sm p-4" onSubmit={enviar} noValidate>
            {errorGeneral && <div className="alert alert-danger" role="alert">{errorGeneral}</div>}

            <CampoImagen
                id="photo"
                etiqueta="Foto de perfil"
                valor={valores.photo}
                onCambiar={(foto) => cambiarValor('photo', foto)}
                ladoMaximo={300}
                redonda
                error={errores.photo}
            />

            <div className="row g-3">
                <div className="col-md-4">
                    <Campo id="firstName" etiqueta="Nombre" obligatorio error={errores.firstName}>
                        <input type="text" maxLength={40} className={`form-control ${errores.firstName ? 'is-invalid' : ''}`} {...propiedadesDe('firstName')} />
                    </Campo>
                </div>
                <div className="col-md-4">
                    <Campo id="lastName" etiqueta="Primer apellido" obligatorio error={errores.lastName}>
                        <input type="text" maxLength={40} className={`form-control ${errores.lastName ? 'is-invalid' : ''}`} {...propiedadesDe('lastName')} />
                    </Campo>
                </div>
                <div className="col-md-4">
                    <Campo id="secondLastName" etiqueta="Segundo apellido" error={errores.secondLastName}>
                        <input type="text" maxLength={40} className={`form-control ${errores.secondLastName ? 'is-invalid' : ''}`} {...propiedadesDe('secondLastName')} />
                    </Campo>
                </div>
            </div>

            <div className="row g-3">
                <div className="col-md-6">
                    <Campo id="email" etiqueta="Correo electrónico" ayuda="El correo identifica tu cuenta y no se puede modificar." error={errores.email}>
                        <input id="email" type="email" className="form-control" value={perfil.email} disabled readOnly />
                    </Campo>
                </div>
                <div className="col-md-6">
                    <Campo id="career" etiqueta="Carrera o área profesional" obligatorio error={errores.career}>
                        <input type="text" maxLength={80} className={`form-control ${errores.career ? 'is-invalid' : ''}`} {...propiedadesDe('career')} />
                    </Campo>
                </div>
            </div>

            <Campo id="description" etiqueta="Descripción personal" error={errores.description} contador={<Contador texto={valores.description} maximo={500} />}>
                <textarea rows={3} maxLength={500} className={`form-control ${errores.description ? 'is-invalid' : ''}`} {...propiedadesDe('description')}></textarea>
            </Campo>

            <div className="row g-3">
                <div className="col-md-6">
                    <Campo id="availability" etiqueta="Disponibilidad para participar" error={errores.availability}>
                        <select className={`form-select ${errores.availability ? 'is-invalid' : ''}`} {...propiedadesDe('availability')}>
                            <option value="">Sin indicar</option>
                            {opcionesDe(DISPONIBILIDADES).map((opcion) => (
                                <option key={opcion.valor} value={opcion.valor}>{opcion.etiqueta}</option>
                            ))}
                        </select>
                    </Campo>
                </div>
                <div className="col-md-6">
                    <Campo id="portfolio" etiqueta="Enlace al portafolio" error={errores.portfolio}>
                        <input type="url" maxLength={200} placeholder="https://" className={`form-control ${errores.portfolio ? 'is-invalid' : ''}`} {...propiedadesDe('portfolio')} />
                    </Campo>
                </div>
            </div>

            <CompetenciasConNivel
                catalogo={catalogo}
                valores={valores.skills}
                onCambiar={(lista) => cambiarValor('skills', lista)}
                error={errores.skills}
            />

            <CampoEtiquetas
                id="interests"
                etiqueta="Intereses"
                valores={valores.interests}
                onCambiar={(lista) => cambiarValor('interests', lista)}
                maximo={10}
                largoMaximo={40}
                ayuda="Temas que te interesan."
                error={errores.interests}
            />

            <div className="d-flex flex-column flex-sm-row justify-content-end gap-2 pt-3 border-top">
                <button type="button" className="btn btn-outline-primary" onClick={onCancelar} disabled={enviando}>Cancelar</button>
                <button type="submit" className="btn btn-primary fw-bold" disabled={enviando}>
                    {enviando ? 'Guardando...' : 'Guardar perfil'}
                </button>
            </div>
        </form>
    );
}

export default FormularioPerfil;
