// autenticacion.validacion.js
// Validación del registro y del inicio de sesión
// El servidor repite las reglas que el cliente ya revisó

import { texto, opcion, imagen } from './reglas.js';
import { errorDeValidacion } from '../utils/ErrorApi.js';
import { TIPOS_MIEMBRO } from '../utils/valores.js';

const PATRON_NOMBRE = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' -]+$/;
const PATRON_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SOLO_LETRAS = 'solo puede tener letras, espacios, apóstrofos o guiones.';

// Nombre y apellidos. Se exporta porque el perfil usa las mismas reglas
export function validarNombres(errores, cuerpo) {
    const firstName = texto(errores, 'firstName', cuerpo.firstName, {
        nombre: 'el nombre', obligatorio: true, minimo: 2, maximo: 40,
        patron: PATRON_NOMBRE, mensajePatron: `El nombre ${SOLO_LETRAS}`
    });
    const lastName = texto(errores, 'lastName', cuerpo.lastName, {
        nombre: 'el primer apellido', obligatorio: true, minimo: 2, maximo: 40,
        patron: PATRON_NOMBRE, mensajePatron: `El primer apellido ${SOLO_LETRAS}`
    });
    const secondLastName = texto(errores, 'secondLastName', cuerpo.secondLastName, {
        nombre: 'el segundo apellido', minimo: 2, maximo: 40,
        patron: PATRON_NOMBRE, mensajePatron: `El segundo apellido ${SOLO_LETRAS}`
    });

    return { firstName, lastName, secondLastName };
}

export function validarCarrera(errores, valor) {
    return texto(errores, 'career', valor, { nombre: 'la carrera o área', obligatorio: true, minimo: 3, maximo: 80 });
}

function validarCorreo(errores, valor) {
    const correo = texto(errores, 'email', valor, {
        nombre: 'el correo', obligatorio: true, maximo: 100,
        patron: PATRON_CORREO, mensajePatron: 'El correo no tiene un formato válido.'
    });
    return correo.toLowerCase();
}

// POST /api/auth/register
export function validarRegistro(cuerpo) {
    const errores = [];

    const nombres = validarNombres(errores, cuerpo);
    const email = validarCorreo(errores, cuerpo.email);

    // La contraseña no se recortan espacios
    const password = cuerpo.password;
    if (typeof password !== 'string' || password === '') {
        errores.push({ field: 'password', message: 'Falta la contraseña.' });
    } else if (password.length < 8 || password.length > 64 || !/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
        errores.push({ field: 'password', message: 'La contraseña debe tener de 8 a 64 caracteres, con letras y números.' });
    }

    // Relación entre campos, confirmación igual a la contraseña
    if (cuerpo.passwordConfirmation !== password) {
        errores.push({ field: 'passwordConfirmation', message: 'La confirmación no coincide con la contraseña.' });
    }

    const memberType = opcion(errores, 'memberType', cuerpo.memberType, { nombre: 'el tipo de miembro', permitidos: TIPOS_MIEMBRO });
    const career = validarCarrera(errores, cuerpo.career);

    if (cuerpo.acceptTerms !== true) {
        errores.push({ field: 'acceptTerms', message: 'Debes aceptar los términos de uso.' });
    }

    const photo = imagen(errores, 'photo', cuerpo.photo, { nombre: 'la foto', maximoCaracteres: 300000 });

    if (errores.length > 0) {
        throw errorDeValidacion(errores);
    }

    return { ...nombres, email, password, memberType, career, photo };
}

// POST /api/auth/login
export function validarInicioSesion(cuerpo) {
    const errores = [];

    const email = validarCorreo(errores, cuerpo.email);

    if (typeof cuerpo.password !== 'string' || cuerpo.password === '') {
        errores.push({ field: 'password', message: 'Falta la contraseña.' });
    }

    if (errores.length > 0) {
        throw errorDeValidacion(errores);
    }

    return { email, password: cuerpo.password };
}