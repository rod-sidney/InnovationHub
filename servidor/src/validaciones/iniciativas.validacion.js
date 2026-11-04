// iniciativas.validacion.js
// Validación de los parámetros del catálogo de iniciativas

import { texto, opcion, id, entero, imagen, listaDeTextos, listaDeIds } from './reglas.js';
import { errorDeValidacion } from '../utils/ErrorApi.js';
import { leerPaginacion } from '../utils/paginacion.js';
import { TIPOS_INICIATIVA, CATEGORIAS, VISIBILIDADES, ESTADOS_INICIATIVA } from '../utils/valores.js';

// Parámetros de GET /api/initiatives
export function validarConsultaIniciativas(consulta) {
    const errores = [];

    const q = texto(errores, 'q', consulta.q, { nombre: 'el texto de búsqueda', maximo: 100 });
    const type = opcion(errores, 'type', consulta.type, {
        nombre: 'el tipo', permitidos: TIPOS_INICIATIVA, obligatorio: false
    });
    const category = opcion(errores, 'category', consulta.category, {
        nombre: 'la categoría', permitidos: CATEGORIAS, obligatorio: false
    });
    const skill = id(errores, 'skill', consulta.skill, { nombre: 'la competencia', obligatorio: false });
    const status = opcion(errores, 'status', consulta.status, {
        nombre: 'el estado', permitidos: ESTADOS_INICIATIVA, obligatorio: false
    });
    const visibility = opcion(errores, 'visibility', consulta.visibility, {
        nombre: 'la visibilidad', permitidos: VISIBILIDADES, obligatorio: false
    });
    const owner = id(errores, 'owner', consulta.owner, { nombre: 'el propietario', obligatorio: false });
    const member = id(errores, 'member', consulta.member, { nombre: 'el miembro', obligatorio: false });
    const available = opcion(errores, 'available', consulta.available, {
        nombre: 'el filtro de espacios disponibles', permitidos: ['true', 'false'], obligatorio: false
    }) === 'true';
    const paginacion = leerPaginacion(errores, consulta, ['recent', 'oldest', 'title']);

    if (errores.length > 0) {
        throw errorDeValidacion(errores);
    }

    return {
        filtros: { q, type, category, skill, status, visibility, owner, member, available },
        paginacion
    };
}

// Cuerpo de POST /api/initiatives y PUT /api/initiatives/:id
// Devuelve solo los campos editables: owner, status y members no vienen del cliente
export function validarIniciativa(cuerpo) {
    const errores = [];

    const title = texto(errores, 'title', cuerpo.title, { nombre: 'el título', obligatorio: true, maximo: 100 });
    const type = opcion(errores, 'type', cuerpo.type, { nombre: 'el tipo', permitidos: TIPOS_INICIATIVA });
    const category = opcion(errores, 'category', cuerpo.category, { nombre: 'la categoría', permitidos: CATEGORIAS });
    const summary = texto(errores, 'summary', cuerpo.summary, { nombre: 'el resumen', obligatorio: true, maximo: 300 });
    const description = texto(errores, 'description', cuerpo.description, {
        nombre: 'la descripción', obligatorio: true, maximo: 3000
    });
    const problem = texto(errores, 'problem', cuerpo.problem, { nombre: 'el problema', maximo: 1000 });
    const beneficiaries = texto(errores, 'beneficiaries', cuerpo.beneficiaries, {
        nombre: 'el campo de beneficiarios', maximo: 150
    });
    const tags = listaDeTextos(errores, 'tags', cuerpo.tags, { nombre: 'las etiquetas', maximo: 8, largoMaximo: 30 });
    const visibility = opcion(errores, 'visibility', cuerpo.visibility, { nombre: 'la visibilidad', permitidos: VISIBILIDADES });
    const skills = listaDeIds(errores, 'skills', cuerpo.skills, { nombre: 'las competencias', minimo: 1, maximo: 10 });
    const memberLimit = entero(errores, 'memberLimit', cuerpo.memberLimit, {
        nombre: 'la cantidad de integrantes', minimo: 1, maximo: 20
    });
    const image = imagen(errores, 'image', cuerpo.image, { nombre: 'la imagen', maximoCaracteres: 700000 });

    if (errores.length > 0) {
        throw errorDeValidacion(errores);
    }

    return { title, type, category, summary, description, problem, beneficiaries, tags, visibility, skills, memberLimit, image };
}