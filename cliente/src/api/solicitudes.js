// solicitudes.js (api)
// Funciones para las rutas /api/requests del contrato

import { pedir, armarConsulta } from './cliente.js';

// POST /api/requests - 201 con la solicitud pendiente
export function crearSolicitud(datos) {
    return pedir('/requests', { metodo: 'POST', cuerpo: datos });
}

// GET /api/requests/sent: las solicitudes que envió el usuario de la sesión (paginadas)
export function listarEnviadas(filtros, signal) {
    return pedir(`/requests/sent${armarConsulta(filtros)}`, { signal });
}

// GET /api/requests/received: las solicitudes de las iniciativas propias, con filtros
export function listarRecibidas(filtros, signal) {
    return pedir(`/requests/received${armarConsulta(filtros)}`, { signal });
}

// GET /api/requests/:id
export function obtenerSolicitud(id, signal) {
    return pedir(`/requests/${id}`, { signal });
}

// PUT /api/requests/:id: solo mientras está pendiente
export function actualizarSolicitud(id, datos) {
    return pedir(`/requests/${id}`, { metodo: 'PUT', cuerpo: datos });
}

// PATCH /api/requests/:id/status con { status, comment }: cancelar, aceptar o rechazar
export function cambiarEstadoSolicitud(id, datos) {
    return pedir(`/requests/${id}/status`, { metodo: 'PATCH', cuerpo: datos });
}
