// iniciativas.controlador.js
// Capa HTTP de las iniciativas

import {
    listarIniciativas, obtenerIniciativa, crearIniciativa, actualizarIniciativa
} from '../servicios/iniciativas.servicio.js';
import { validarConsultaIniciativas, validarIniciativa } from '../validaciones/iniciativas.validacion.js';

// GET /api/initiatives (sesionOpcional dejó en req.usuario al usuario o null)
export async function listar(req, res) {
    const { filtros, paginacion } = validarConsultaIniciativas(req.query);
    const pagina = await listarIniciativas(filtros, paginacion, req.usuario);
    res.json(pagina);
}

// GET /api/initiatives/:id
export async function obtener(req, res) {
    const iniciativa = await obtenerIniciativa(req.params.id, req.usuario);
    res.json(iniciativa);
}

// POST /api/initiatives
export async function crear(req, res) {
    const datos = validarIniciativa(req.body || {});
    const iniciativa = await crearIniciativa(datos, req.usuario);
    res.status(201).json(iniciativa);
}

// PUT /api/initiatives/:id
export async function actualizar(req, res) {
    const datos = validarIniciativa(req.body || {});
    const iniciativa = await actualizarIniciativa(req.params.id, datos, req.usuario);
    res.json(iniciativa);
}