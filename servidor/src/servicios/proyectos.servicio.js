// proyectos.servicio.js
// Conversión de una iniciativa en proyecto, listado de proyectos accesibles y detalle

import Proyecto from '../modelos/Proyecto.js';
import Iniciativa from '../modelos/Iniciativa.js';
import { ErrorApi, errorDeValidacion, noEncontrado } from '../utils/ErrorApi.js';
import { armarPagina, saltoDePagina } from '../utils/paginacion.js';
import { aResumenProyecto, aProyecto } from '../utils/representaciones.js';
import { esIdValido } from '../validaciones/reglas.js';
import { esPropietario, verificarAccesoCompleto, filtroDeAccesoCompleto } from './visibilidad.js';

const CAMPOS_USUARIO_CORTO = 'firstName lastName secondLastName photo';

// Para el listado
// la iniciativa de origen (con members para contar el equipo) y el propietario
const RELACIONES_RESUMEN = [
    { path: 'initiative', select: 'title category visibility members' },
    { path: 'owner', select: CAMPOS_USUARIO_CORTO }
];

// Para el detalle
// además, los datos de cada integrante del equipo de la iniciativa
const RELACIONES_DETALLE = [
    {
        path: 'initiative',
        select: 'title category visibility members',
        populate: {
            path: 'members.user',
            select: 'firstName lastName secondLastName photo career skills',
            populate: { path: 'skills.skill' }
        }
    },
    { path: 'owner', select: CAMPOS_USUARIO_CORTO }
];

const ORDENES = {
    recent: { createdAt: -1, _id: 1 },
    oldest: { createdAt: 1, _id: 1 }
};

//el propietario convierte su iniciativa en proyecto
export async function crearProyecto(datos, usuario) {
    const iniciativa = await Iniciativa.findById(datos.initiativeId);

    if (!iniciativa) {
        throw errorDeValidacion([{ field: 'initiativeId', message: 'La iniciativa no existe.' }]);
    }

    if (!esPropietario(iniciativa, usuario)) {
        throw new ErrorApi(403, 'FORBIDDEN', 'Solo el propietario puede convertir la iniciativa en proyecto.');
    }

    if (iniciativa.status === 'archived') {
        throw new ErrorApi(409, 'INITIATIVE_ARCHIVED', 'La iniciativa está archivada.');
    }

    // una iniciativa solamente puede generar un proyecto
    const yaTieneProyecto = await Proyecto.exists({ initiative: iniciativa._id });
    if (yaTieneProyecto) {
        throw new ErrorApi(409, 'PROJECT_ALREADY_EXISTS', 'Esta iniciativa ya se convirtió en proyecto.');
    }

    // al menos un miembro además del propietario
    // verificación ocurre en el servidor, aunque el cliente oculte el botón
    if (iniciativa.members.length < 2) {
        throw new ErrorApi(409, 'NOT_ENOUGH_MEMBERS',
            'Para convertirla en proyecto, el equipo necesita al menos un miembro además del propietario.');
    }

    let proyecto;
    try {
        proyecto = await Proyecto.create({
            initiative: iniciativa._id,      // se conserva el vínculo con la iniciativa de origen
            owner: iniciativa.owner,
            name: datos.name,
            objective: datos.objective,
            description: datos.description,
            technologies: datos.technologies,
            startDate: datos.startDate,
            estimatedEndDate: datos.estimatedEndDate,
            repository: datos.repository,
            status: 'planning'               //  el estado inicial es Planificación
        });
    } catch (error) {
        // El índice unique de "initiative" detiene dos conversiones que lleguen al mismo tiempo
        if (error.code === 11000) {
            throw new ErrorApi(409, 'PROJECT_ALREADY_EXISTS', 'Esta iniciativa ya se convirtió en proyecto.');
        }
        throw error;
    }

    // La iniciativa no se borra, queda marcada como convertida en proyecto
    iniciativa.status = 'converted';
    await iniciativa.save();

    await proyecto.populate(RELACIONES_DETALLE);
    return aProyecto(proyecto);
}

// Proyectos cuya iniciativa de origen el usuario puede ver completa
export async function listarProyectos(paginacion, usuario) {
    // distinct devuelve los identificadores de las iniciativas accesibles
    const idsAccesibles = await Iniciativa.distinct('_id', filtroDeAccesoCompleto(usuario));
    const filtro = { initiative: { $in: idsAccesibles } };

    const [proyectos, total] = await Promise.all([
        Proyecto.find(filtro)
            .sort(ORDENES[paginacion.sort])
            .skip(saltoDePagina(paginacion))
            .limit(paginacion.size)
            .populate(RELACIONES_RESUMEN),
        Proyecto.countDocuments(filtro)
    ]);

    return armarPagina(proyectos.map((proyecto) => aResumenProyecto(proyecto)), total, paginacion);
}

export async function obtenerProyecto(id, usuario) {
    const proyecto = esIdValido(id) ? await Proyecto.findById(id).populate(RELACIONES_DETALLE) : null;

    if (!proyecto) {
        throw noEncontrado('El proyecto no existe.');
    }

    // El proyecto respeta la visibilidad de su iniciativa de origen
    verificarAccesoCompleto(proyecto.initiative, usuario);

    return aProyecto(proyecto);
}