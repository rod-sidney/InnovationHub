// iniciativas.controlador.js
// Capa HTTP de las iniciativas

import {
    listarIniciativas, obtenerIniciativa, crearIniciativa, actualizarIniciativa, eliminarIniciativa
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

// DELETE /api/initiatives/:id: 204 si se eliminó, 200 con la iniciativa si se archivó
export async function eliminar(req, res) {
    const resultado = await eliminarIniciativa(req.params.id, req.usuario);

    if (resultado.result === 'deleted') {
        return res.status(204).end();
    }

    res.json(resultado);
}