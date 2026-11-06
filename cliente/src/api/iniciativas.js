// iniciativas.js (api)
// Funciones para las rutas /api/initiatives del contrato

import { pedir, armarConsulta } from './cliente.js';

// GET /api/initiatives con búsqueda, filtros, orden y paginación (todo lo resuelve el servidor)
export function listarIniciativas(filtros, signal) {
    return pedir(`/initiatives${armarConsulta(filtros)}`, { signal });
}

// GET /api/initiatives/:id (la respuesta trae access: "full" o "summary" y el campo viewer)
export function obtenerIniciativa(id, signal) {
    return pedir(`/initiatives/${id}`, { signal });
}

// POST /api/initiatives - 201 con la iniciativa creada
export function crearIniciativa(datos) {
    return pedir('/initiatives', { metodo: 'POST', cuerpo: datos });
}

// PUT /api/initiatives/:id - 200 con la iniciativa modificada
export function actualizarIniciativa(id, datos) {
    return pedir(`/initiatives/${id}`, { metodo: 'PUT', cuerpo: datos });
}