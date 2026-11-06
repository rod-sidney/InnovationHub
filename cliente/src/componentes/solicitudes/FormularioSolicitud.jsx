// FormularioSolicitud.jsx
// Formulario controlado para solicitar participación o modificar una solicitud pendiente
// La competencia se elige entre las que requiere la iniciativa

import { useState } from 'react';

import Campo from '../comunes/Campo.jsx';
import Contador from '../comunes/Contador.jsx';
import { DISPONIBILIDADES, opcionesDe } from '../../utils/etiquetas.js';
import { validarSolicitud, erroresDelServidor, hayErrores } from '../../utils/validaciones.js';

const VALORES_VACIOS = { role: '', skillId: '', availability: '', message: '' };

function FormularioSolicitud({ competencias, valoresIniciales = VALORES_VACIOS, textoBoton, onGuardar, onCancelar }) {
    const [valores, setValores] = useState(valoresIniciales);
    const [errores, setErrores] = useState({});
    const [errorGeneral, setErrorGeneral] = useState('');
    const [enviando, setEnviando] = useState(false);

    function cambiar(evento) {
        const { name, value } = evento.target;
        setValores((anteriores) => ({ ...anteriores, [name]: value }));
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

        const encontrados = validarSolicitud(valores);
        setErrores(encontrados);
        setErrorGeneral('');
        if (hayErrores(encontrados)) {
            setErrorGeneral('Revisa los campos marcados.');
            return;
        }

        setEnviando(true);
        try {
            await onGuardar(valores);
        } catch (error) {
            // ej: 409 si mientras tanto el equipo se llenó o ya había una solicitud pendiente
            setErrorGeneral(error.message);
            setErrores(erroresDelServidor(error));
            setEnviando(false);
        }
    }

    return (
        <form onSubmit={enviar} noValidate>
            {errorGeneral && <div className="alert alert-danger" role="alert">{errorGeneral}</div>}

            <Campo id="role" etiqueta="Rol que deseas desempeñar" obligatorio error={errores.role} contador={<Contador texto={valores.role} maximo={60} />}>
                <input
                    type="text"
                    maxLength={60}
                    placeholder="Ej: Desarrollo del frontend"
                    className={`form-control ${errores.role ? 'is-invalid' : ''}`}
                    {...propiedadesDe('role')}
                />
            </Campo>

            <div className="row g-3">
                <div className="col-md-6">
                    <Campo id="skillId" etiqueta="Competencia principal que aportas" obligatorio error={errores.skillId}>
                        <select className={`form-select ${errores.skillId ? 'is-invalid' : ''}`} {...propiedadesDe('skillId')}>
                            <option value="">Seleccione una competencia</option>
                            {competencias.map((competencia) => (
                                <option key={competencia.id} value={competencia.id}>{competencia.name}</option>
                            ))}
                        </select>
                    </Campo>
                </div>
                <div className="col-md-6">
                    <Campo id="availability" etiqueta="Disponibilidad" obligatorio error={errores.availability}>
                        <select className={`form-select ${errores.availability ? 'is-invalid' : ''}`} {...propiedadesDe('availability')}>
                            <option value="">Seleccione su disponibilidad</option>
                            {opcionesDe(DISPONIBILIDADES).map((opcion) => (
                                <option key={opcion.valor} value={opcion.valor}>{opcion.etiqueta}</option>
                            ))}
                        </select>
                    </Campo>
                </div>
            </div>

            <Campo
                id="message"
                etiqueta="Mensaje de presentación"
                error={errores.message}
                ayuda="Cuéntale al propietario por qué te interesa la iniciativa."
                contador={<Contador texto={valores.message} maximo={500} />}
            >
                <textarea rows={4} maxLength={500} className={`form-control ${errores.message ? 'is-invalid' : ''}`} {...propiedadesDe('message')}></textarea>
            </Campo>

            <div className="d-flex flex-column flex-sm-row justify-content-end gap-2 pt-3 border-top">
                {onCancelar && (
                    <button type="button" className="btn btn-outline-primary" onClick={onCancelar} disabled={enviando}>
                        Cancelar
                    </button>
                )}
                <button type="submit" className="btn btn-primary fw-bold" disabled={enviando}>
                    {enviando ? 'Enviando...' : textoBoton}
                </button>
            </div>
        </form>
    );
}

export default FormularioSolicitud;
