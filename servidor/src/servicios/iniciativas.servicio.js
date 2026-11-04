// iniciativas.servicio.js
// Lógica de las iniciativas: catálogo con búsqueda, filtros, orden y paginación

import Iniciativa from '../modelos/Iniciativa.js';
import { patronDeBusqueda } from '../utils/texto.js';
import { armarPagina, saltoDePagina } from '../utils/paginacion.js';
import { aResumenIniciativa } from '../utils/representaciones.js';
import { filtroDeVisibilidad } from './visibilidad.js';

// Datos del propietario se piden con populate para el resumen
const CAMPOS_PROPIETARIO = 'firstName lastName secondLastName photo';

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