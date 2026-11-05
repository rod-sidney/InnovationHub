// equipo.validacion.js
// Validación de la consulta del equipo y del retiro de un miembro

import { texto, id } from './reglas.js';
import { errorDeValidacion } from '../utils/ErrorApi.js';

// Parámetros de GET /api/initiatives/:id/members
export function validarConsultaEquipo(consulta) {
    const errores = [];

    const skill = id(errores, 'skill', consulta.skill, { nombre: 'la competencia', obligatorio: false });
    const role = texto(errores, 'role', consulta.role, { nombre: 'el rol', maximo: 60 });

    if (errores.length > 0) {
        throw errorDeValidacion(errores);
    }

    return { skill, role };
}

// Cuerpo opcional de DELETE /api/initiatives/:id/members/:userId
export function validarRetiro(cuerpo) {
    const errores = [];

    const reason = texto(errores, 'reason', cuerpo.reason, { nombre: 'el motivo', maximo: 300 });

    if (errores.length > 0) {
        throw errorDeValidacion(errores);
    }

    return { reason };
}