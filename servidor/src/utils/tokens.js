// tokens.js
// Tokens de sesión: cadena aleatoria
// BD guarda su hash SHA-256 y no el token, igual que contraseñas
// Usa un hash rápido y no bcrypt porque el token es aleatorio y largo
// no hay palabras que probar, el mismo token siempre produce el mismo hash, permite buscar la sesión por ese valor

import crypto from 'node:crypto';

// 32 bytes aleatorios escritos en hexadecimal = 64 caracteres
export function generarToken() {
    return crypto.randomBytes(32).toString('hex');
}

export function hashDeToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
}