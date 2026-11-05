// solicitudes.validacion.js
// Validación de los datos y de los parámetros de las solicitudes de participación

import { texto, opcion, id } from './reglas.js';
import { errorDeValidacion } from '../utils/ErrorApi.js';
import { leerPaginacion } from '../utils/paginacion.js';
import { DISPONIBILIDADES, ESTADOS_SOLICITUD } from '../utils/valores.js';

// Cuerpo de POST /api/requests (esNueva = true) y de PUT /api/requests/:id (esNueva = false).
// Al modificar no se recibe la iniciativa
export function validarSolicitud(cuerpo, esNueva) {
    const errores = [];

    const initiativeId = esNueva
        ? id(errores, 'initiativeId', cuerpo.initiativeId, { nombre: 'la iniciativa' })
        : null;
    const role = texto(errores, 'role', cuerpo.role, { nombre: 'el rol', obligatorio: true, maximo: 60 });
    const skillId = id(errores, 'skillId', cuerpo.skillId, { nombre: 'la competencia' });
    const availability = opcion(errores, 'availability', cuerpo.availability, {
        nombre: 'la disponibilidad', permitidos: DISPONIBILIDADES
    });
    const message = texto(errores, 'message', cuerpo.message, { nombre: 'el mensaje', maximo: 500 });

    if (errores.length > 0) {
        throw errorDeValidacion(errores);
    }

    return { initiativeId, role, skillId, availability, message };
}

// Parámetros de GET /api/requests/sent
export function validarConsultaEnviadas(consulta) {
    const errores = [];

    const status = opcion(errores, 'status', consulta.status, {
        nombre: 'el estado', permitidos: ESTADOS_SOLICITUD, obligatorio: false
    });
    const initiative = id(errores, 'initiative', consulta.initiative, { nombre: 'la iniciativa', obligatorio: false });
    const paginacion = leerPaginacion(errores, consulta, ['recent', 'oldest']);

    if (errores.length > 0) {
        throw errorDeValidacion(errores);
    }

    return { filtros: { status, initiative }, paginacion };
}

// Parámetros de GET /api/requests/received
export function validarConsultaRecibidas(consulta) {
    const errores = [];

    const initiative = id(errores, 'initiative', consulta.initiative, { nombre: 'la iniciativa', obligatorio: false });
    const status = opcion(errores, 'status', consulta.status, {
        nombre: 'el estado', permitidos: ESTADOS_SOLICITUD, obligatorio: false
    });
    const skill = id(errores, 'skill', consulta.skill, { nombre: 'la competencia', obligatorio: false });
    const role = texto(errores, 'role', consulta.role, { nombre: 'el rol', maximo: 60 });
    const paginacion = leerPaginacion(errores, consulta, ['recent', 'oldest']);

    if (errores.length > 0) {
        throw errorDeValidacion(errores);
    }

    return { filtros: { initiative, status, skill, role }, paginacion };
}

// Cuerpo de PATCH /api/requests/:id/status
// "pending" no se permite, una solicitud no vuelve atrás
export function validarCambioDeEstado(cuerpo) {
    const errores = [];

    const status = opcion(errores, 'status', cuerpo.status, {
        nombre: 'el nuevo estado', permitidos: ['cancelled', 'accepted', 'rejected']
    });
    const comment = texto(errores, 'comment', cuerpo.comment, { nombre: 'el comentario', maximo: 300 });

    if (errores.length > 0) {
        throw errorDeValidacion(errores);
    }

    return { status, comment };
}