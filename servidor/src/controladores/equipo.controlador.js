// equipo.controlador.js
// Capa HTTP del equipo de una iniciativa

import { listarMiembros, retirarMiembro } from '../servicios/equipo.servicio.js';
import { validarConsultaEquipo, validarRetiro } from '../validaciones/equipo.validacion.js';

// GET /api/initiatives/:id/members
export async function listar(req, res) {
    const filtros = validarConsultaEquipo(req.query);
    const equipo = await listarMiembros(req.params.id, filtros, req.usuario);
    res.json(equipo);
}

// DELETE /api/initiatives/:id/members/:userId
export async function retirar(req, res) {
    const { reason } = validarRetiro(req.body || {});
    await retirarMiembro(req.params.id, req.params.userId, reason, req.usuario);
    res.status(204).end();
}
