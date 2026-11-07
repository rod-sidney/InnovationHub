// proyectos.js (api)
// Funciones para las rutas /api/projects del contrato

import { pedir, armarConsulta } from './cliente.js';

// POST /api/projects: convierte una iniciativa en proyecto
export function crearProyecto(datos) {
    return pedir('/projects', { metodo: 'POST', cuerpo: datos });
}

// GET /api/projects: proyectos que el usuario puede ver, paginados
export function listarProyectos(filtros, signal) {
    return pedir(`/projects${armarConsulta(filtros)}`, { signal });
}

// GET /api/projects/:id
export function obtenerProyecto(id, signal) {
    return pedir(`/projects/${id}`, { signal });
}
