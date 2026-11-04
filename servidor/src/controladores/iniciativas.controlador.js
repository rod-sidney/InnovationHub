// iniciativas.controlador.js
// Capa HTTP de las iniciativas

import { listarIniciativas } from '../servicios/iniciativas.servicio.js';
import { validarConsultaIniciativas } from '../validaciones/iniciativas.validacion.js';

// GET /api/initiatives (sesionOpcional dejó en req.usuario al usuario o null)
export async function listar(req, res) {
    const { filtros, paginacion } = validarConsultaIniciativas(req.query);
    const pagina = await listarIniciativas(filtros, paginacion, req.usuario);
    res.json(pagina);
}