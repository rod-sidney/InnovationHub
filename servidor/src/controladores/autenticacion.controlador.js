// autenticacion.controlador.js
// Capa HTTP del registro y del inicio de sesión

import { registrarUsuario, autenticarUsuario } from '../servicios/autenticacion.servicio.js';
import { validarRegistro, validarInicioSesion } from '../validaciones/autenticacion.validacion.js';

// POST /api/auth/register
export async function registrar(req, res) {
    const datos = validarRegistro(req.body || {});
    const resultado = await registrarUsuario(datos);
    res.status(201).json(resultado);
}

// POST /api/auth/login
export async function iniciarSesion(req, res) {
    const datos = validarInicioSesion(req.body || {});
    const resultado = await autenticarUsuario(datos);
    res.json(resultado);
}