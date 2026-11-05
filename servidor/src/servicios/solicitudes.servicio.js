// solicitudes.servicio.js
// Solicitudes de participación: registro, consulta, listados y modificación

import Solicitud from '../modelos/Solicitud.js';
import Iniciativa from '../modelos/Iniciativa.js';
import { ErrorApi, errorDeValidacion, noEncontrado } from '../utils/ErrorApi.js';
import { patronDeBusqueda } from '../utils/texto.js';
import { armarPagina, saltoDePagina } from '../utils/paginacion.js';
import { aSolicitud } from '../utils/representaciones.js';
import { esIdValido } from '../validaciones/reglas.js';
import { nivelDeAcceso, esPropietario, esMiembro } from './visibilidad.js';

// Datos relacionados que necesita la representación de una solicitud (sección 4.9)
const RELACIONES = [
    { path: 'initiative', select: 'title owner' },
    { path: 'skill' },
    {
        path: 'requester',
        select: 'firstName lastName secondLastName photo career skills',
        populate: { path: 'skills.skill' }
    }
];

const ORDENES = {
    recent: { createdAt: -1, _id: 1 },
    oldest: { createdAt: 1, _id: 1 }
};

async function buscarSolicitud(id) {
    const solicitud = esIdValido(id) ? await Solicitud.findById(id) : null;

    if (!solicitud) {
        throw noEncontrado('La solicitud no existe.');
    }

    return solicitud;
}

function esSolicitante(solicitud, usuario) {
    const idSolicitante = solicitud.requester._id || solicitud.requester;
    return String(idSolicitante) === String(usuario._id);
}

// competencia ofrecida debe ser una de las que requiere la iniciativa
function verificarCompetenciaOfrecida(iniciativa, idCompetencia) {
    const esRequerida = iniciativa.skills.some((competencia) => String(competencia) === idCompetencia);

    if (!esRequerida) {
        throw errorDeValidacion([{ field: 'skillId', message: 'La competencia debe ser una de las que requiere la iniciativa.' }]);
    }
}

// Página de solicitudes según un filtro ya armado
async function paginarSolicitudes(filtro, paginacion) {
    const [solicitudes, total] = await Promise.all([
        Solicitud.find(filtro)
            .sort(ORDENES[paginacion.sort])
            .skip(saltoDePagina(paginacion))
            .limit(paginacion.size)
            .populate(RELACIONES),
        Solicitud.countDocuments(filtro)
    ]);

    return armarPagina(solicitudes.map((solicitud) => aSolicitud(solicitud)), total, paginacion);
}

// registrar una solicitud de participación
export async function crearSolicitud(datos, usuario) {
    const iniciativa = await Iniciativa.findById(datos.initiativeId);

    if (!iniciativa) {
        throw errorDeValidacion([{ field: 'initiativeId', message: 'La iniciativa no existe.' }]);
    }

    // no se puede solicitar en una iniciativa que el usuario no puede ver
    if (!nivelDeAcceso(iniciativa, usuario)) {
        throw new ErrorApi(403, 'FORBIDDEN', 'No tienes acceso a esta iniciativa.');
    }

    // el propietario no solicita participación en su propia iniciativa
    if (esPropietario(iniciativa, usuario)) {
        throw new ErrorApi(403, 'OWN_INITIATIVE', 'No puedes solicitar participación en tu propia iniciativa.');
    }

    verificarCompetenciaOfrecida(iniciativa, datos.skillId);

    if (iniciativa.status === 'archived') {
        throw new ErrorApi(409, 'INITIATIVE_ARCHIVED', 'La iniciativa está archivada y no recibe solicitudes.');
    }

    // no se entra dos veces al mismo equipo
    if (esMiembro(iniciativa, usuario)) {
        throw new ErrorApi(409, 'ALREADY_MEMBER', 'Ya formas parte del equipo de esta iniciativa.');
    }

    // una sola solicitud pendiente por usuario e iniciativa
    const tienePendiente = await Solicitud.exists({ initiative: iniciativa._id, requester: usuario._id, status: 'pending' });
    if (tienePendiente) {
        throw new ErrorApi(409, 'PENDING_REQUEST_EXISTS', 'Ya tienes una solicitud pendiente para esta iniciativa.');
    }

    if (iniciativa.members.length >= iniciativa.memberLimit) {
        throw new ErrorApi(409, 'TEAM_FULL', 'El equipo ya no tiene espacios disponibles.');
    }

    try {
        const solicitud = await Solicitud.create({
            initiative: iniciativa._id,
            requester: usuario._id,
            skill: datos.skillId,
            role: datos.role,
            availability: datos.availability,
            message: datos.message,
            status: 'pending'
        });

        await solicitud.populate(RELACIONES);
        return aSolicitud(solicitud);
    } catch (error) {
        // índice unique parcial detiene una segunda solicitud pendiente enviada al mismo tiempo
        if (error.code === 11000) {
            throw new ErrorApi(409, 'PENDING_REQUEST_EXISTS', 'Ya tienes una solicitud pendiente para esta iniciativa.');
        }
        throw error;
    }
}

// Solicitudes que envió el usuario de la sesión
export async function listarEnviadas(filtros, paginacion, usuario) {
    const filtro = { requester: usuario._id };

    if (filtros.status) filtro.status = filtros.status;
    if (filtros.initiative) filtro.initiative = filtros.initiative;

    return paginarSolicitudes(filtro, paginacion);
}

// Solicitudes recibidas en las iniciativas de las que el usuario es propietario
export async function listarRecibidas(filtros, paginacion, usuario) {
    let idsIniciativas;

    if (filtros.initiative) {
        const iniciativa = await Iniciativa.findById(filtros.initiative).select('owner');

        if (!iniciativa) {
            throw errorDeValidacion([{ field: 'initiative', message: 'La iniciativa no existe.' }]);
        }

        if (!esPropietario(iniciativa, usuario)) {
            throw new ErrorApi(403, 'FORBIDDEN', 'Solo el propietario puede ver las solicitudes de esta iniciativa.');
        }

        idsIniciativas = [iniciativa._id];
    } else {
        // distinct devuelve solo los identificadores de las iniciativas del usuario
        idsIniciativas = await Iniciativa.distinct('_id', { owner: usuario._id });
    }

    const filtro = { initiative: { $in: idsIniciativas } };

    if (filtros.status) filtro.status = filtros.status;
    if (filtros.skill) filtro.skill = filtros.skill;
    if (filtros.role) filtro.role = patronDeBusqueda(filtros.role);

    return paginarSolicitudes(filtro, paginacion);
}

// la consultan el solicitante y el propietario de la iniciativa
export async function obtenerSolicitud(id, usuario) {
    const solicitud = await buscarSolicitud(id);
    await solicitud.populate(RELACIONES);

    const esDuenoDeLaIniciativa = String(solicitud.initiative.owner) === String(usuario._id);

    if (!esSolicitante(solicitud, usuario) && !esDuenoDeLaIniciativa) {
        throw new ErrorApi(403, 'FORBIDDEN', 'Solo el solicitante y el propietario de la iniciativa pueden ver esta solicitud.');
    }

    return aSolicitud(solicitud);
}

// el solicitante modifica su solicitud mientras está pendiente
export async function actualizarSolicitud(id, datos, usuario) {
    const solicitud = await buscarSolicitud(id);

    if (!esSolicitante(solicitud, usuario)) {
        throw new ErrorApi(403, 'FORBIDDEN', 'Solo quien envió la solicitud puede modificarla.');
    }

    const iniciativa = await Iniciativa.findById(solicitud.initiative).select('skills');
    verificarCompetenciaOfrecida(iniciativa, datos.skillId);

    // una solicitud aceptada, rechazada o cancelada ya no se modifica
    if (solicitud.status !== 'pending') {
        throw new ErrorApi(409, 'REQUEST_NOT_PENDING', 'Solo se pueden modificar las solicitudes pendientes.');
    }

    // No cambian la iniciativa, el solicitante ni la fecha original
    solicitud.set({
        role: datos.role,
        skill: datos.skillId,
        availability: datos.availability,
        message: datos.message
    });

    await solicitud.save();
    await solicitud.populate(RELACIONES);

    return aSolicitud(solicitud);
}