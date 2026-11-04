// competencias.controlador.js
// Capa HTTP del catálogo de competencias: toma los datos de la petición, los valida, llama al servicio y responde con el código de estado que indica el contrato.

import { listarCompetencias, obtenerCompetencia } from '../servicios/competencias.servicio.js';
import { validarConsultaCompetencias } from '../validaciones/competencias.validacion.js';

// GET /api/skills
export async function listar(req, res) {
    const filtros = validarConsultaCompetencias(req.query);
    const competencias = await listarCompetencias(filtros);
    res.json(competencias);
}

// GET /api/skills/:id
export async function obtener(req, res) {
    const competencia = await obtenerCompetencia(req.params.id);
    res.json(competencia);
}