// iniciativas.servicio.js
// Lógica de las iniciativas: catálogo con búsqueda, filtros, orden y paginación

import Iniciativa from '../modelos/Iniciativa.js';
import Solicitud from '../modelos/Solicitud.js';
import Proyecto from '../modelos/Proyecto.js';
import { noEncontrado } from '../utils/ErrorApi.js';
import { patronDeBusqueda } from '../utils/texto.js';
import { armarPagina, saltoDePagina } from '../utils/paginacion.js';
import { aResumenIniciativa, aDetalleIniciativa } from '../utils/representaciones.js';
import { esIdValido } from '../validaciones/reglas.js';
import { filtroDeVisibilidad, verificarQuePuedeVer, esPropietario, esMiembro } from './visibilidad.js';

// Datos del propietario se piden con populate para el resumen
const CAMPOS_PROPIETARIO = 'firstName lastName secondLastName photo';

// Datos de cada integrante que muestra el detalle (sección 4.6 del contrato)
const CAMPOS_MIEMBRO = 'firstName lastName secondLastName photo career skills';

// Criterios de orden permitidos
// _id desempata para que las páginas no se mezclen
const ORDENES = {
    recent: { createdAt: -1, _id: 1 },
    oldest: { createdAt: 1, _id: 1 },
    title: { title: 1, _id: 1 }
};

export async function listarIniciativas(filtros, paginacion, usuario) {
    // Todas las condiciones se combinan con $and
    // La primera es siempre la visibilidad
    const condiciones = [filtroDeVisibilidad(usuario)];

    // Búsqueda de texto en el título, el resumen y las etiquetas
    if (filtros.q) {
        const patron = patronDeBusqueda(filtros.q);
        condiciones.push({ $or: [{ title: patron }, { summary: patron }, { tags: patron }] });
    }

    if (filtros.type) condiciones.push({ type: filtros.type });
    if (filtros.category) condiciones.push({ category: filtros.category });
    if (filtros.skill) condiciones.push({ skills: filtros.skill });
    if (filtros.visibility) condiciones.push({ visibility: filtros.visibility });
    if (filtros.owner) condiciones.push({ owner: filtros.owner });
    if (filtros.member) condiciones.push({ 'members.user': filtros.member });

    // Sin filtro de estado, las iniciativas archivadas no aparecen en el catálogo
    condiciones.push(filtros.status ? { status: filtros.status } : { status: { $ne: 'archived' } });

    // Espacios disponibles: menos miembros que el límite ($expr compara dos campos del documento)
    if (filtros.available) {
        condiciones.push({ $expr: { $lt: [{ $size: '$members' }, '$memberLimit'] } });
    }

    const filtro = { $and: condiciones };

    // La página y el total se piden al mismo tiempo
    // select quita los textos largos que el listado no muestra, respuesta se hace más liviana
    const [iniciativas, total] = await Promise.all([
        Iniciativa.find(filtro)
            .select('-description -problem -beneficiaries -removedMembers')
            .collation({ locale: 'es' })
            .sort(ORDENES[paginacion.sort])
            .skip(saltoDePagina(paginacion))
            .limit(paginacion.size)
            .populate('skills')
            .populate('owner', CAMPOS_PROPIETARIO),
        Iniciativa.countDocuments(filtro)
    ]);

    return armarPagina(iniciativas.map((iniciativa) => aResumenIniciativa(iniciativa)), total, paginacion);
}

// Busca una iniciativa con todo lo que necesita el detalle
// Si no existe, 404
async function buscarIniciativaCompleta(id) {
    const iniciativa = esIdValido(id)
        ? await Iniciativa.findById(id)
            .populate('skills')
            .populate('owner', CAMPOS_PROPIETARIO)
            .populate({ path: 'members.user', select: CAMPOS_MIEMBRO, populate: { path: 'skills.skill' } })
        : null;

    if (!iniciativa) {
        throw noEncontrado('La iniciativa no existe.');
    }

    return iniciativa;
}

// Detalle completo, con el identificador del proyecto que generó (si existe)
async function armarDetalle(iniciativa) {
    const proyecto = await Proyecto.findOne({ initiative: iniciativa._id }).select('_id');
    return aDetalleIniciativa(iniciativa, proyecto ? proyecto._id : null);
}

// Relación de quien consulta con la iniciativa (sección 4.7)
// El cliente la usa para decidir qué botones mostrar, el server igual vuelve a verificar cada acción
async function relacionDelUsuario(iniciativa, usuario) {
    if (!usuario) {
        return { isOwner: false, isMember: false, pendingRequestId: null };
    }

    const pendiente = await Solicitud.findOne({
        initiative: iniciativa._id, requester: usuario._id, status: 'pending'
    }).select('_id');

    return {
        isOwner: esPropietario(iniciativa, usuario),
        isMember: esMiembro(iniciativa, usuario),
        pendingRequestId: pendiente ? String(pendiente._id) : null
    };
}

export async function obtenerIniciativa(id, usuario) {
    const iniciativa = await buscarIniciativaCompleta(id);

    // 401 o 403 si no la puede ver; si la ve, ¿completa o solo el resumen?
    const acceso = verificarQuePuedeVer(iniciativa, usuario);

    const vista = acceso === 'full' ? await armarDetalle(iniciativa) : aResumenIniciativa(iniciativa);
    vista.viewer = await relacionDelUsuario(iniciativa, usuario);

    return vista;
}