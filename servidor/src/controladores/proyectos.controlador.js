// proyectos.controlador.js
// Capa HTTP de los proyectos

import { crearProyecto, listarProyectos, obtenerProyecto } from '../servicios/proyectos.servicio.js';
import { validarProyecto, validarConsultaProyectos } from '../validaciones/proyectos.validacion.js';

// POST /api/projects
export async function crear(req, res) {
    const datos = validarProyecto(req.body || {});
    const proyecto = await crearProyecto(datos, req.usuario);
    res.status(201).json(proyecto);
}

// GET /api/projects
export async function listar(req, res) {
    const paginacion = validarConsultaProyectos(req.query);
    const pagina = await listarProyectos(paginacion, req.usuario);
    res.json(pagina);
}

// GET /api/projects/:id
export async function obtener(req, res) {
    const proyecto = await obtenerProyecto(req.params.id, req.usuario);
    res.json(proyecto);
}