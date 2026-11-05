// visibilidad.js
// Reglas de visibilidad de las iniciativas (RN-20 y sección 3 del contrato)
// Las consultas de iniciativas, equipos y proyectos pasan por estas funciones
// el servidor decide qué puede ver cada usuario, sin importar qué botones muestre/oculte el cliente

import { ErrorApi } from '../utils/ErrorApi.js';

// Identificador como texto, ya sea que el campo venga con populate (documento) o sin él (ObjectId)
function idComoTexto(valor) {
    return String(valor && valor._id ? valor._id : valor);
}

export function esPropietario(iniciativa, usuario) {
    return Boolean(usuario) && idComoTexto(iniciativa.owner) === String(usuario._id);
}

// propietario también está en members
export function esMiembro(iniciativa, usuario) {
    return Boolean(usuario)
        && iniciativa.members.some((miembro) => idComoTexto(miembro.user) === String(usuario._id));
}

// Devuelve 'full' (ve todo), 'summary' (solo el resumen) o null (no la puede ver)
export function nivelDeAcceso(iniciativa, usuario) {
    // El equipo (propietario incluido) siempre ve su iniciativa completa
    if (esMiembro(iniciativa, usuario)) {
        return 'full';
    }

    switch (iniciativa.visibility) {
        case 'public':
            return 'full';
        case 'institutional':
            return usuario ? 'full' : null;
        case 'restricted':
            return usuario ? 'summary' : null;
        default:   // private, solo el equipo
            return null;
    }
}

// Si el usuario no puede ver la iniciativa, responde 401 (sin sesión) o 403 (con sesión)
// Si la puede ver, devuelve el nivel de acceso
export function verificarQuePuedeVer(iniciativa, usuario) {
    const acceso = nivelDeAcceso(iniciativa, usuario);

    if (acceso) {
        return acceso;
    }

    if (!usuario) {
        throw new ErrorApi(401, 'UNAUTHENTICATED', 'Inicia sesión para ver esta iniciativa.');
    }

    throw new ErrorApi(403, 'FORBIDDEN', 'Esta iniciativa es privada: solo su equipo puede verla.');
}

// Exige acceso completo (ej: ver el equipo)
// Con acceso de resumen, 403
export function verificarAccesoCompleto(iniciativa, usuario) {
    const acceso = verificarQuePuedeVer(iniciativa, usuario);

    if (acceso !== 'full') {
        throw new ErrorApi(403, 'FORBIDDEN', 'Solo el equipo de esta iniciativa puede ver esta información.');
    }
}

// Condición de MongoDB con las iniciativas que el usuario puede ver en un listado
// Sin sesión solo las públicas
// Con sesión: todas menos las privadas ajenas
export function filtroDeVisibilidad(usuario) {
    if (!usuario) {
        return { visibility: 'public' };
    }

    return {
        $or: [
            { visibility: { $in: ['public', 'institutional', 'restricted'] } },
            { 'members.user': usuario._id }
        ]
    };
}