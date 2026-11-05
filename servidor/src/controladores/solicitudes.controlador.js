// solicitudes.controlador.js
// Capa HTTP de las solicitudes de participación

import {
    crearSolicitud, listarEnviadas, listarRecibidas, obtenerSolicitud, actualizarSolicitud, cambiarEstado
} from '../servicios/solicitudes.servicio.js';
import {
    validarSolicitud, validarConsultaEnviadas, validarConsultaRecibidas, validarCambioDeEstado
} from '../validaciones/solicitudes.validacion.js';

// POST /api/requests
export async function crear(req, res) {
    const datos = validarSolicitud(req.body || {}, true);
    const solicitud = await crearSolicitud(datos, req.usuario);
    res.status(201).json(solicitud);
}

// GET /api/requests/sent
export async function enviadas(req, res) {
    const { filtros, paginacion } = validarConsultaEnviadas(req.query);
    const pagina = await listarEnviadas(filtros, paginacion, req.usuario);
    res.json(pagina);
}

// GET /api/requests/received
export async function recibidas(req, res) {
    const { filtros, paginacion } = validarConsultaRecibidas(req.query);
    const pagina = await listarRecibidas(filtros, paginacion, req.usuario);
    res.json(pagina);
}

// GET /api/requests/:id
export async function obtener(req, res) {
    const solicitud = await obtenerSolicitud(req.params.id, req.usuario);
    res.json(solicitud);
}

// PUT /api/requests/:id
export async function actualizar(req, res) {
    const datos = validarSolicitud(req.body || {}, false);
    const solicitud = await actualizarSolicitud(req.params.id, datos, req.usuario);
    res.json(solicitud);
}

// PATCH /api/requests/:id/status
export async function actualizarEstado(req, res) {
    const datos = validarCambioDeEstado(req.body || {});
    const solicitud = await cambiarEstado(req.params.id, datos, req.usuario);
    res.json(solicitud);
}