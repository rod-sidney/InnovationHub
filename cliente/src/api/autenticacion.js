// autenticacion.js (api)
// Funciones para las rutas /api/auth del contrato

import { pedir } from './cliente.js';

// POST /api/auth/register - { token, user }
export function pedirRegistro(datos) {
    return pedir('/auth/register', { metodo: 'POST', cuerpo: datos });
}

// POST /api/auth/login - { token, user }
export function pedirInicioSesion(credenciales) {
    return pedir('/auth/login', { metodo: 'POST', cuerpo: credenciales });
}

// POST /api/auth/logout - 204
export function pedirCierreSesion() {
    return pedir('/auth/logout', { metodo: 'POST' });
}

// GET /api/auth/me - el usuario de la sesión (confirma que el token sigue vigente)
export function pedirUsuarioActual(signal) {
    return pedir('/auth/me', { signal });
}
