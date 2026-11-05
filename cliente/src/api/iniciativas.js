// iniciativas.js (api)
// Funciones para las rutas /api/initiatives del contrato

import { pedir, armarConsulta } from './cliente.js';

// GET /api/initiatives con búsqueda, filtros, orden y paginación (todo lo resuelve el servidor)
export function listarIniciativas(filtros, signal) {
    return pedir(`/initiatives${armarConsulta(filtros)}`, { signal });
}
