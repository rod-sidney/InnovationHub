// FormularioProyecto.jsx
// Formulario controlado para convertir una iniciativa en proyecto
// La iniciativa de origen, el propietario y los integrantes los obtiene el servidor
// el estado inicial es "Planificación".

import { useState } from 'react';

import Campo from '../comunes/Campo.jsx';
import Contador from '../comunes/Contador.jsx';
import CampoEtiquetas from '../comunes/CampoEtiquetas.jsx';
import { validarProyecto, erroresDelServidor, hayErrores } from '../../utils/validaciones.js';

function FormularioProyecto({ valoresIniciales, onGuardar, onCancelar }) {
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

        const encontrados = validarProyecto(valores);
        setErrores(encontrados);
        setErrorGeneral('');
        if (hayErrores(encontrados)) {
            setErrorGeneral('Revisa los campos marcados.');
            return;
        }

        setEnviando(true);
        try {
            // Los campos opcionales vacíos se envían como null, como indica el contrato
            await onGuardar({
                ...valores,
                estimatedEndDate: valores.estimatedEndDate || null,
                repositoryUrl: valores.repositoryUrl.trim() || null
            });
        } catch (error) {
            // ej: 409 si la iniciativa ya no tiene miembros o ya generó un proyecto
            setErrorGeneral(error.message);
            setErrores(erroresDelServidor(error));
            setEnviando(false);
        }
    }

    return (
        <form onSubmit={enviar} noValidate>
            {errorGeneral && <div className="alert alert-danger" role="alert">{errorGeneral}</div>}

            <Campo id="name" etiqueta="Nombre del proyecto" obligatorio error={errores.name} contador={<Contador texto={valores.name} maximo={100} />}>
                <input type="text" maxLength={100} className={`form-control ${errores.name ? 'is-invalid' : ''}`} {...propiedadesDe('name')} />
            </Campo>

            <Campo id="objective" etiqueta="Objetivo" obligatorio error={errores.objective} contador={<Contador texto={valores.objective} maximo={500} />}>
                <textarea rows={2} maxLength={500} className={`form-control ${errores.objective ? 'is-invalid' : ''}`} {...propiedadesDe('objective')}></textarea>
            </Campo>

            <Campo id="description" etiqueta="Descripción" obligatorio error={errores.description} contador={<Contador texto={valores.description} maximo={2000} />}>
                <textarea rows={5} maxLength={2000} className={`form-control ${errores.description ? 'is-invalid' : ''}`} {...propiedadesDe('description')}></textarea>
            </Campo>

            <CampoEtiquetas
                id="technologies"
                etiqueta="Tecnologías previstas"
                obligatorio
                valores={valores.technologies}
                onCambiar={(lista) => setValores((anteriores) => ({ ...anteriores, technologies: lista }))}
                maximo={10}
                largoMaximo={40}
                ayuda="Por ejemplo: React, Node.js, MongoDB."
                error={errores.technologies}
            />

            <div className="row g-3">
                <div className="col-md-6">
                    <Campo id="startDate" etiqueta="Fecha de inicio" obligatorio error={errores.startDate}>
                        <input type="date" className={`form-control ${errores.startDate ? 'is-invalid' : ''}`} {...propiedadesDe('startDate')} />
                    </Campo>
                </div>
                <div className="col-md-6">
                    <Campo id="estimatedEndDate" etiqueta="Fecha estimada de finalización" ayuda="Opcional." error={errores.estimatedEndDate}>
                        <input type="date" min={valores.startDate || undefined} className={`form-control ${errores.estimatedEndDate ? 'is-invalid' : ''}`} {...propiedadesDe('estimatedEndDate')} />
                    </Campo>
                </div>
            </div>

            <Campo
                id="repositoryUrl"
                etiqueta="Repositorio de GitHub"
                ayuda="Opcional. Ejemplo: https://github.com/expressjs/express"
                error={errores.repositoryUrl}
            >
                <input type="url" maxLength={200} placeholder="https://github.com/propietario/repositorio" className={`form-control ${errores.repositoryUrl ? 'is-invalid' : ''}`} {...propiedadesDe('repositoryUrl')} />
            </Campo>

            <div className="d-flex flex-column flex-sm-row justify-content-end gap-2 pt-3 border-top">
                <button type="button" className="btn btn-outline-primary" onClick={onCancelar} disabled={enviando}>Cancelar</button>
                <button type="submit" className="btn btn-success fw-bold" disabled={enviando}>
                    {enviando ? 'Creando el proyecto...' : 'Convertir en proyecto'}
                </button>
            </div>
        </form>
    );
}

export default FormularioProyecto;
