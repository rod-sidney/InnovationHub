// equipo.servicio.js
// Consulta del equipo de una iniciativa y retiro de miembros. El equipo vive embebido en
// la iniciativa (arreglo members), así que todo se resuelve en ese mismo documento.

import Iniciativa from '../modelos/Iniciativa.js';
import { ErrorApi, noEncontrado } from '../utils/ErrorApi.js';
import { patronDeBusqueda } from '../utils/texto.js';
import { aEquipo } from '../utils/representaciones.js';
import { esIdValido } from '../validaciones/reglas.js';
import { esPropietario, verificarAccesoCompleto } from './visibilidad.js';
import { buscarIniciativa } from './iniciativas.servicio.js';

// RF-A-EQU-02 y RF-A-EQU-05: equipo de la iniciativa, con filtros opcionales por competencia y rol
export async function listarMiembros(id, filtros, usuario) {
    const iniciativa = esIdValido(id)
        ? await Iniciativa.findById(id).populate({
            path: 'members.user',
            select: 'firstName lastName secondLastName photo career skills',
            populate: { path: 'skills.skill' }
        })
        : null;

    if (!iniciativa) {
        throw noEncontrado('La iniciativa no existe.');
    }

    // RN-20: el equipo es parte del detalle completo de la iniciativa
    verificarAccesoCompleto(iniciativa, usuario);

    let equipo = aEquipo(iniciativa.members, String(iniciativa.owner));

    // El equipo es pequeño (máximo 20), así que estos filtros se aplican sobre el arreglo
    if (filtros.skill) {
        equipo = equipo.filter((miembro) => miembro.user.skills.some((elemento) => elemento.skill.id === filtros.skill));
    }

    if (filtros.role) {
        const patron = patronDeBusqueda(filtros.role);
        equipo = equipo.filter((miembro) => patron.test(miembro.role));
    }

    return equipo;
}

// RF-A-EQU-04: el propietario retira a un miembro; el retiro queda en el historial
export async function retirarMiembro(id, idUsuario, motivo, usuario) {
    const iniciativa = await buscarIniciativa(id);

    if (!esPropietario(iniciativa, usuario)) {
        throw new ErrorApi(403, 'FORBIDDEN', 'Solo el propietario puede retirar miembros del equipo.');
    }

    if (iniciativa.status === 'archived') {
        throw new ErrorApi(409, 'INITIATIVE_ARCHIVED', 'La iniciativa está archivada y no admite cambios.');
    }

    // RF-I-EQU-04: el propietario no puede retirarse mediante esta operación
    if (String(iniciativa.owner) === idUsuario) {
        throw new ErrorApi(409, 'OWNER_CANNOT_LEAVE', 'El propietario no puede retirarse de su propio equipo.');
    }

    const posicion = iniciativa.members.findIndex((miembro) => String(miembro.user) === idUsuario);

    if (posicion === -1) {
        throw noEncontrado('Esa persona no forma parte del equipo.');
    }

    // Se quita del equipo actual y se guarda en el historial con la fecha y el motivo
    const miembro = iniciativa.members[posicion];
    iniciativa.removedMembers.push({
        user: miembro.user,
        role: miembro.role,
        joinedAt: miembro.joinedAt,
        removedAt: new Date(),
        reason: motivo
    });
    iniciativa.members.splice(posicion, 1);

    // Si solo queda el propietario, la iniciativa deja de estar "en formación de equipo"
    if (iniciativa.members.length === 1 && iniciativa.status === 'team_building') {
        iniciativa.status = 'published';
    }

    await iniciativa.save();
}
