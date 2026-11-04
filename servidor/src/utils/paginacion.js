// paginacion.js
// Lee los parámetros page, size y sort de los listados y arma el sobre de respuesta paginada (sección 1.5 del contrato)
// La paginación ocurre en MongoDB con skip y limit: el servidor no descarga la colección completa

import { entero, opcion } from '../validaciones/reglas.js';

// ordenesPermitidos: valores aceptados en sort
// el primero es el valor por defecto
export function leerPaginacion(errores, consulta, ordenesPermitidos) {
    const page = entero(errores, 'page', consulta.page, {
        nombre: 'el número de página (page)', minimo: 1, maximo: 100000, obligatorio: false
    }) || 1;

    const size = entero(errores, 'size', consulta.size, {
        nombre: 'el tamaño de página (size)', minimo: 1, maximo: 50, obligatorio: false
    }) || 10;

    const sort = opcion(errores, 'sort', consulta.sort, {
        nombre: 'el orden (sort)', permitidos: ordenesPermitidos, obligatorio: false
    }) || ordenesPermitidos[0];

    return { page, size, sort };
}

// Cuántos documentos saltar para llegar a la página pedida
export function saltoDePagina({ page, size }) {
    return (page - 1) * size;
}

// Sobre que devuelven todos los listados paginados
export function armarPagina(datos, total, { page, size }) {
    return {
        data: datos,
        page,
        size,
        total,
        totalPages: Math.ceil(total / size)
    };
}