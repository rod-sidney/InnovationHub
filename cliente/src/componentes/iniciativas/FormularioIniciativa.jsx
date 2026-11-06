// FormularioIniciativa.jsx
// Formulario controlado para publicar y modificar una iniciativa
// Lo usan las páginas NuevaIniciativa y EditarIniciativa
// la página decide qué hacer al guardar (onGuardar)
// Si el servidor rechaza datos, sus mensajes aparecen en cada campo

import { useState } from 'react';

import Campo from '../comunes/Campo.jsx';
import Contador from '../comunes/Contador.jsx';
import CampoEtiquetas from '../comunes/CampoEtiquetas.jsx';
import CampoImagen from '../comunes/CampoImagen.jsx';
import SelectorCompetencias from './SelectorCompetencias.jsx';
import { TIPOS, CATEGORIAS, VISIBILIDADES, opcionesDe } from '../../utils/etiquetas.js';
import { validarIniciativa, erroresDelServidor, hayErrores } from '../../utils/validaciones.js';

const VALORES_VACIOS = {
    title: '',
    type: '',
    category: '',
    visibility: '',
    memberLimit: '',
    summary: '',
    description: '',
    problem: '',
    beneficiaries: '',
    skills: [],
    tags: [],
    image: null
};

function FormularioIniciativa({ valoresIniciales = VALORES_VACIOS, competencias, miembrosActuales = 1, textoBoton, onGuardar, onCancelar }) {
    const [valores, setValores] = useState(valoresIniciales);
    const [errores, setErrores] = useState({});
    const [errorGeneral, setErrorGeneral] = useState('');
    const [enviando, setEnviando] = useState(false);

    // Inputs y selects: el atributo name dice qué propiedad del estado se cambia
    function cambiar(evento) {
        const { name, value } = evento.target;
        setValores((anteriores) => ({ ...anteriores, [name]: value }));
    }

    // Campos que no son inputs simples (listas e imagen) entregan su valor directamente
    function cambiarValor(nombre, valor) {
        setValores((anteriores) => ({ ...anteriores, [nombre]: valor }));
    }

    // Propiedades comunes de los inputs de texto
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

    function claseDe(base, nombre) {
        return `${base} ${errores[nombre] ? 'is-invalid' : ''}`;
    }

    async function enviar(evento) {
        evento.preventDefault();

        const encontrados = validarIniciativa(valores, miembrosActuales);
        setErrores(encontrados);
        setErrorGeneral('');
        if (hayErrores(encontrados)) {
            setErrorGeneral('Revisa los campos marcados.');
            return;
        }

        setEnviando(true);
        try {
            // El input de número entrega texto, la API espera un número
            await onGuardar({ ...valores, memberLimit: Number(valores.memberLimit) });
        } catch (error) {
            setErrorGeneral(error.message);
            setErrores(erroresDelServidor(error));
            setEnviando(false);
        }
    }

    return (
        <form onSubmit={enviar} noValidate>
            {errorGeneral && <div className="alert alert-danger" role="alert">{errorGeneral}</div>}

            <fieldset className="mb-4">
                <legend className="h5 fw-bold text-primary border-bottom pb-2 mb-4">Información general</legend>

                <Campo id="title" etiqueta="Título" obligatorio error={errores.title} contador={<Contador texto={valores.title} maximo={100} />}>
                    <input type="text" maxLength={100} className={claseDe('form-control', 'title')} {...propiedadesDe('title')} />
                </Campo>

                <div className="row g-3">
                    <div className="col-md-6">
                        <Campo id="type" etiqueta="Tipo" obligatorio error={errores.type}>
                            <select className={claseDe('form-select', 'type')} {...propiedadesDe('type')}>
                                <option value="">Seleccione un tipo</option>
                                {opcionesDe(TIPOS).map((opcion) => (
                                    <option key={opcion.valor} value={opcion.valor}>{opcion.etiqueta}</option>
                                ))}
                            </select>
                        </Campo>
                    </div>
                    <div className="col-md-6">
                        <Campo id="category" etiqueta="Categoría" obligatorio error={errores.category}>
                            <select className={claseDe('form-select', 'category')} {...propiedadesDe('category')}>
                                <option value="">Seleccione una categoría</option>
                                {opcionesDe(CATEGORIAS).map((opcion) => (
                                    <option key={opcion.valor} value={opcion.valor}>{opcion.etiqueta}</option>
                                ))}
                            </select>
                        </Campo>
                    </div>
                    <div className="col-md-6">
                        <Campo
                            id="visibility"
                            etiqueta="Visibilidad"
                            obligatorio
                            error={errores.visibility}
                            ayuda="Pública: cualquier persona. Institucional: personas con sesión. Restringida: los demás solo ven el resumen. Privada: solo tu equipo."
                        >
                            <select className={claseDe('form-select', 'visibility')} {...propiedadesDe('visibility')}>
                                <option value="">Seleccione la visibilidad</option>
                                {opcionesDe(VISIBILIDADES).map((opcion) => (
                                    <option key={opcion.valor} value={opcion.valor}>{opcion.etiqueta}</option>
                                ))}
                            </select>
                        </Campo>
                    </div>
                    <div className="col-md-6">
                        <Campo
                            id="memberLimit"
                            etiqueta="Cantidad estimada de integrantes"
                            obligatorio
                            error={errores.memberLimit}
                            ayuda={`Entre ${miembrosActuales} y 20, contándote a ti.`}
                        >
                            <input type="number" min={miembrosActuales} max={20} className={claseDe('form-control', 'memberLimit')} {...propiedadesDe('memberLimit')} />
                        </Campo>
                    </div>
                </div>
            </fieldset>

            <fieldset className="mb-4">
                <legend className="h5 fw-bold text-primary border-bottom pb-2 mb-4">Descripción</legend>

                <Campo id="summary" etiqueta="Resumen" obligatorio error={errores.summary} contador={<Contador texto={valores.summary} maximo={300} />}>
                    <textarea rows={2} maxLength={300} className={claseDe('form-control', 'summary')} {...propiedadesDe('summary')}></textarea>
                </Campo>

                <Campo id="description" etiqueta="Descripción detallada" obligatorio error={errores.description} contador={<Contador texto={valores.description} maximo={3000} />}>
                    <textarea rows={6} maxLength={3000} className={claseDe('form-control', 'description')} {...propiedadesDe('description')}></textarea>
                </Campo>

                <Campo id="problem" etiqueta="Problema o situación identificada" error={errores.problem} contador={<Contador texto={valores.problem} maximo={1000} />}>
                    <textarea rows={3} maxLength={1000} className={claseDe('form-control', 'problem')} {...propiedadesDe('problem')}></textarea>
                </Campo>

                <Campo id="beneficiaries" etiqueta="Población o usuarios beneficiados" error={errores.beneficiaries} contador={<Contador texto={valores.beneficiaries} maximo={150} />}>
                    <input type="text" maxLength={150} className={claseDe('form-control', 'beneficiaries')} {...propiedadesDe('beneficiaries')} />
                </Campo>
            </fieldset>

            <fieldset className="mb-4">
                <legend className="h5 fw-bold text-primary border-bottom pb-2 mb-4">Competencias y etiquetas</legend>

                <SelectorCompetencias
                    id="skills"
                    catalogo={competencias}
                    seleccionadas={valores.skills}
                    onCambiar={(lista) => cambiarValor('skills', lista)}
                    maximo={10}
                    error={errores.skills}
                />

                <CampoEtiquetas
                    id="tags"
                    etiqueta="Etiquetas"
                    valores={valores.tags}
                    onCambiar={(lista) => cambiarValor('tags', lista)}
                    maximo={8}
                    largoMaximo={30}
                    ayuda="Palabras clave para encontrar la iniciativa."
                    error={errores.tags}
                />
            </fieldset>

            <fieldset className="mb-4">
                <legend className="h5 fw-bold text-primary border-bottom pb-2 mb-4">Imagen</legend>

                <CampoImagen
                    id="image"
                    etiqueta="Foto de la iniciativa"
                    valor={valores.image}
                    onCambiar={(imagen) => cambiarValor('image', imagen)}
                    ladoMaximo={800}
                    error={errores.image}
                />
            </fieldset>

            <div className="d-flex flex-column flex-sm-row justify-content-end gap-2 pt-3 border-top">
                {onCancelar && (
                    <button type="button" className="btn btn-outline-primary" onClick={onCancelar} disabled={enviando}>
                        Cancelar
                    </button>
                )}
                <button type="submit" className="btn btn-primary fw-bold" disabled={enviando}>
                    {enviando ? 'Guardando...' : textoBoton}
                </button>
            </div>
        </form>
    );
}

export default FormularioIniciativa;
