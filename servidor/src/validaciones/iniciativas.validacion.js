// iniciativas.validacion.js
// Validación de los parámetros del catálogo de iniciativas

import { texto, opcion, id } from './reglas.js';
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