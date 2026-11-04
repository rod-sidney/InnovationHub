// texto.js
// Ayudas para las búsquedas de texto en MongoDB

// caracteres especiales de las expresiones regulares
// sino se rompe la  consulta
export function escaparRegex(texto) {
    return texto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Expresión regular que encuentra el texto en cualquier parte, sin distinguir mayúsculas
export function patronDeBusqueda(texto) {
    return new RegExp(escaparRegex(texto), 'i');
}