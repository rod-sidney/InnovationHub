// usuarios.js (api)
// Funciones para las rutas /api/users del contrato

import { pedir } from './cliente.js';

// GET /api/users/:id: el perfil (incluye el correo solo si es el propio)
export function obtenerUsuario(id, signal) {
    return pedir(`/users/${id}`, { signal });
}

// PUT /api/users/:id: reemplaza los campos editables del propio perfil
export function actualizarPerfil(id, datos) {
    return pedir(`/users/${id}`, { metodo: 'PUT', cuerpo: datos });
}
