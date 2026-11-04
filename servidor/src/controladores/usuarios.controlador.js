// usuarios.controlador.js
// Capa HTTP de los usuarios: búsqueda, consulta y modificación del perfil

import { buscarUsuarios, obtenerPerfil, actualizarPerfil } from '../servicios/usuarios.servicio.js';
import { validarConsultaUsuarios, validarPerfil } from '../validaciones/usuarios.validacion.js';

// GET /api/users
export async function buscar(req, res) {
    const { filtros, paginacion } = validarConsultaUsuarios(req.query);
    const pagina = await buscarUsuarios(filtros, paginacion);
    res.json(pagina);
}

// GET /api/users/:id
export async function obtener(req, res) {
    const perfil = await obtenerPerfil(req.params.id, req.usuario);
    res.json(perfil);
}

// PUT /api/users/:id
export async function actualizar(req, res) {
    const datos = validarPerfil(req.body || {});
    const perfil = await actualizarPerfil(req.params.id, datos, req.usuario);
    res.json(perfil);
}