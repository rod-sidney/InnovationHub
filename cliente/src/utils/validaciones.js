// validaciones.js
// Validación de los formularios en el cliente
// Da una respuesta inmediata a la persona, pero la API vuelve a validar todo
// Cada función devuelve un objeto { campo: mensaje } con los errores encontrados (vacío si todo bien)

const PATRON_NOMBRE = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' -]+$/;
const PATRON_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SOLO_LETRAS = 'solo puede tener letras, espacios, apóstrofos o guiones.';

function capitalizar(texto) {
    return texto.charAt(0).toUpperCase() + texto.slice(1);
}

// Revisa un texto con las mismas reglas que el servidor y, si no cumple, guarda el mensaje
function revisarTexto(errores, campo, valor, { nombre, obligatorio = false, minimo = 0, maximo, patron, mensajePatron }) {
    const texto = (valor || '').trim();

    if (texto === '') {
        if (obligatorio) errores[campo] = `Falta ${nombre}.`;
        return;
    }

    if (texto.length < minimo) {
        errores[campo] = `${capitalizar(nombre)} debe tener al menos ${minimo} caracteres.`;
    } else if (maximo && texto.length > maximo) {
        errores[campo] = `${capitalizar(nombre)} admite como máximo ${maximo} caracteres.`;
    } else if (patron && !patron.test(texto)) {
        errores[campo] = mensajePatron;
    }
}

function revisarNombres(errores, valores) {
    revisarTexto(errores, 'firstName', valores.firstName, {
        nombre: 'el nombre', obligatorio: true, minimo: 2, maximo: 40,
        patron: PATRON_NOMBRE, mensajePatron: `El nombre ${SOLO_LETRAS}`
    });
    revisarTexto(errores, 'lastName', valores.lastName, {
        nombre: 'el primer apellido', obligatorio: true, minimo: 2, maximo: 40,
        patron: PATRON_NOMBRE, mensajePatron: `El primer apellido ${SOLO_LETRAS}`
    });
    revisarTexto(errores, 'secondLastName', valores.secondLastName, {
        nombre: 'el segundo apellido', minimo: 2, maximo: 40,
        patron: PATRON_NOMBRE, mensajePatron: `El segundo apellido ${SOLO_LETRAS}`
    });
}

export function hayErrores(errores) {
    return Object.keys(errores).length > 0;
}

// Convierte los detalles de un error 400 del servidor en { campo: mensaje } para el formulario
export function erroresDelServidor(error) {
    const errores = {};

    for (const detalle of error.detalles || []) {
        errores[detalle.field] = detalle.message;
    }

    return errores;
}

export function validarInicioSesion(valores) {
    const errores = {};

    revisarTexto(errores, 'email', valores.email, {
        nombre: 'el correo', obligatorio: true, maximo: 100,
        patron: PATRON_CORREO, mensajePatron: 'El correo no tiene un formato válido.'
    });

    if (!valores.password) {
        errores.password = 'Falta la contraseña.';
    }

    return errores;
}

export function validarRegistro(valores) {
    const errores = {};

    revisarNombres(errores, valores);
    revisarTexto(errores, 'email', valores.email, {
        nombre: 'el correo', obligatorio: true, maximo: 100,
        patron: PATRON_CORREO, mensajePatron: 'El correo no tiene un formato válido.'
    });

    const contrasena = valores.password;
    if (!contrasena) {
        errores.password = 'Falta la contraseña.';
    } else if (contrasena.length < 8 || contrasena.length > 64 || !/[A-Za-z]/.test(contrasena) || !/[0-9]/.test(contrasena)) {
        errores.password = 'La contraseña debe tener de 8 a 64 caracteres, con letras y números.';
    }

    // la confirmación debe coincidir
    if (valores.passwordConfirmation !== contrasena) {
        errores.passwordConfirmation = 'La confirmación no coincide con la contraseña.';
    }

    if (!valores.memberType) {
        errores.memberType = 'Falta el tipo de miembro.';
    }

    revisarTexto(errores, 'career', valores.career, { nombre: 'la carrera o área', obligatorio: true, minimo: 3, maximo: 80 });

    if (!valores.acceptTerms) {
        errores.acceptTerms = 'Debes aceptar los términos de uso.';
    }

    return errores;
}
