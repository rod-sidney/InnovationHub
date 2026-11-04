// reglas.js
// Funciones para validar los datos que llegan en las peticiones (body y params)
// Cada función revisa un campo, si no cumple agrega un obj a la lista "errores" { field, message } y devuelve un valor neutro.
// el server junta todos los campos inválidos y responde una sola vez con 400
//  Si el valor es válido, la función lo devuelve limpio (ej trim)

const PATRON_ID = /^[0-9a-fA-F]{24}$/;
const PATRON_FECHA = /^\d{4}-\d{2}-\d{2}$/;
const PATRON_IMAGEN = /^data:image\/(jpeg|png|webp|gif);base64,[A-Za-z0-9+/=]+$/;
const PATRON_ENLACE_HTTPS = /^https:\/\/\S+$/;

// "el título" -> "El título"
function capitalizar(texto) {
    return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function estaVacio(valor) {
    return valor === undefined || valor === null || valor === '';
}

// ¿El valor tiene la forma de un identificador de MongoDB (24 caracteres hexadecimales)?
export function esIdValido(valor) {
    return typeof valor === 'string' && PATRON_ID.test(valor);
}

// Texto con largo mínimo y máximo y un patrón (expresión regular) si se indica
export function texto(errores, campo, valor, { nombre, obligatorio = false, minimo = 0, maximo, patron, mensajePatron }) {
    if (estaVacio(valor)) {
        if (obligatorio) errores.push({ field: campo, message: `Falta ${nombre}.` });
        return '';
    }

    if (typeof valor !== 'string') {
        errores.push({ field: campo, message: `${capitalizar(nombre)} debe ser texto.` });
        return '';
    }

    const limpio = valor.trim();

    if (limpio === '') {
        if (obligatorio) errores.push({ field: campo, message: `Falta ${nombre}.` });
        return '';
    }

    if (limpio.length < minimo) {
        errores.push({ field: campo, message: `${capitalizar(nombre)} debe tener al menos ${minimo} caracteres.` });
    } else if (maximo && limpio.length > maximo) {
        errores.push({ field: campo, message: `${capitalizar(nombre)} admite como máximo ${maximo} caracteres.` });
    } else if (patron && !patron.test(limpio)) {
        errores.push({ field: campo, message: mensajePatron });
    }

    return limpio;
}

// Uno de valores permitidos (listas de utils/valores.js)
export function opcion(errores, campo, valor, { nombre, permitidos, obligatorio = true }) {
    if (estaVacio(valor)) {
        if (obligatorio) errores.push({ field: campo, message: `Falta ${nombre}.` });
        return null;
    }

    if (!permitidos.includes(valor)) {
        errores.push({ field: campo, message: `${capitalizar(nombre)} no tiene un valor permitido.` });
        return null;
    }

    return valor;
}

// Número entero dentro de un rango
//  Acepta "5" porque params de la URL siempre llegan como texto
export function entero(errores, campo, valor, { nombre, minimo, maximo, obligatorio = true }) {
    if (estaVacio(valor)) {
        if (obligatorio) errores.push({ field: campo, message: `Falta ${nombre}.` });
        return null;
    }

    const numero = typeof valor === 'number' || typeof valor === 'string' ? Number(valor) : NaN;

    if (!Number.isInteger(numero) || numero < minimo || numero > maximo) {
        errores.push({ field: campo, message: `${capitalizar(nombre)} debe ser un número entero entre ${minimo} y ${maximo}.` });
        return null;
    }

    return numero;
}

// Identificador de un documento (ej: competencia en un filtro)
export function id(errores, campo, valor, { nombre, obligatorio = true }) {
    if (estaVacio(valor)) {
        if (obligatorio) errores.push({ field: campo, message: `Falta ${nombre}.` });
        return null;
    }

    if (!esIdValido(valor)) {
        errores.push({ field: campo, message: `${capitalizar(nombre)} no es un identificador válido.` });
        return null;
    }

    return valor;
}

// Lista de textos cortos sin repetidos (sin distinguir mayúsculas), como las etiquetas
export function listaDeTextos(errores, campo, valor, { nombre, minimo = 0, maximo, largoMaximo }) {
    const lista = estaVacio(valor) ? [] : valor;

    if (!Array.isArray(lista)) {
        errores.push({ field: campo, message: `${capitalizar(nombre)}: se esperaba una lista.` });
        return [];
    }

    const limpios = [];

    for (const elemento of lista) {
        if (typeof elemento !== 'string' || elemento.trim() === '') {
            errores.push({ field: campo, message: `Cada elemento de ${nombre} debe ser un texto no vacío.` });
            return [];
        }

        const limpio = elemento.trim();

        if (limpio.length > largoMaximo) {
            errores.push({ field: campo, message: `Cada elemento de ${nombre} admite como máximo ${largoMaximo} caracteres.` });
            return [];
        }

        if (limpios.some((otro) => otro.toLowerCase() === limpio.toLowerCase())) {
            errores.push({ field: campo, message: `Hay elementos repetidos en ${nombre}: "${limpio}".` });
            return [];
        }

        limpios.push(limpio);
    }

    if (limpios.length < minimo) {
        errores.push({ field: campo, message: `Se necesita al menos ${minimo} elemento en ${nombre}.` });
    } else if (limpios.length > maximo) {
        errores.push({ field: campo, message: `Se permiten como máximo ${maximo} elementos en ${nombre}.` });
    }

    return limpios;
}

// Lista de identificadores sin repetidos, como las competencias requeridas
export function listaDeIds(errores, campo, valor, { nombre, minimo = 0, maximo }) {
    const lista = estaVacio(valor) ? [] : valor;

    if (!Array.isArray(lista)) {
        errores.push({ field: campo, message: `${capitalizar(nombre)}: se esperaba una lista.` });
        return [];
    }

    if (!lista.every(esIdValido)) {
        errores.push({ field: campo, message: `Hay identificadores inválidos en ${nombre}.` });
        return [];
    }

    if (new Set(lista).size !== lista.length) {
        errores.push({ field: campo, message: `Hay elementos repetidos en ${nombre}.` });
        return [];
    }

    if (lista.length < minimo) {
        errores.push({ field: campo, message: `Se necesita al menos ${minimo} elemento en ${nombre}.` });
    } else if (lista.length > maximo) {
        errores.push({ field: campo, message: `Se permiten como máximo ${maximo} elementos en ${nombre}.` });
    }

    return lista;
}

// Fecha sin hora, formato AAAA-MM-DD
// Devuelve un Date a la medianoche UTC
export function fecha(errores, campo, valor, { nombre, obligatorio = true }) {
    if (estaVacio(valor)) {
        if (obligatorio) errores.push({ field: campo, message: `Falta ${nombre}.` });
        return null;
    }

    if (typeof valor !== 'string' || !PATRON_FECHA.test(valor)) {
        errores.push({ field: campo, message: `${capitalizar(nombre)} debe tener el formato AAAA-MM-DD.` });
        return null;
    }

    const resultado = new Date(`${valor}T00:00:00.000Z`);

    // si la fecha no coincide con la recibida, es que no existe
    if (Number.isNaN(resultado.getTime()) || resultado.toISOString().slice(0, 10) !== valor) {
        errores.push({ field: campo, message: `${capitalizar(nombre)} no es una fecha válida.` });
        return null;
    }

    return resultado;
}

// Imagen opcional: null, un enlace https:// o una imagen en formato data URL
export function imagen(errores, campo, valor, { nombre, maximoCaracteres }) {
    if (estaVacio(valor)) {
        return null;
    }

    if (typeof valor === 'string' && PATRON_ENLACE_HTTPS.test(valor) && valor.length <= 500) {
        return valor;
    }

    if (typeof valor === 'string' && PATRON_IMAGEN.test(valor)) {
        if (valor.length <= maximoCaracteres) return valor;

        errores.push({ field: campo, message: `${capitalizar(nombre)} es demasiado grande.` });
        return null;
    }

    errores.push({ field: campo, message: `${capitalizar(nombre)} debe ser una imagen JPG, PNG, WEBP o GIF, o un enlace https://.` });
    return null;
}