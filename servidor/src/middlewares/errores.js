// errores.js
// Middlewares que arman las respuestas de error con la forma uniforme del contrato:
// { "error": { "status", "code", "message", "details" } }

import { ErrorApi } from '../utils/ErrorApi.js';

function responderError(res, status, codigo, mensaje, detalles = []) {
    res.status(status).json({
        error: { status, code: codigo, message: mensaje, details: detalles }
    });
}

// Cuando ninguna ruta coincidió con el verbo y la dirección de la petición
export function rutaNoEncontrada(req, res) {
    responderError(res, 404, 'ROUTE_NOT_FOUND', `La ruta ${req.method} ${req.path} no existe en la API.`);
}

// Express reconoce un middleware de error porque tiene cuatro parámetros
// Recibe todo error lanzado en las rutas, tambien dentro de funciones
// async: Express 5 atrapa las promesas rechazadas y las envía aquí
export function manejarErrores(error, req, res, next) {
    // Errores previstos que lanzan las validaciones y los servicios
    if (error instanceof ErrorApi) {
        return responderError(res, error.status, error.codigo, error.message, error.detalles);
    }

    // El cuerpo no es JSON válido (detecta express.json)
    if (error.type === 'entity.parse.failed') {
        return responderError(res, 400, 'INVALID_JSON', 'El cuerpo de la petición no es JSON válido.');
    }

    // El cuerpo supera el límite configurado en express.json
    if (error.type === 'entity.too.large') {
        return responderError(res, 400, 'PAYLOAD_TOO_LARGE', 'La petición supera el tamaño máximo de 1 MB.');
    }

    // Cualquier otro error es inesperado: el detalle queda en la consola del servidor, pero la respuesta no expone trazas de pila ni mensajes internos de la base de datos
    console.error(error);
    responderError(res, 500, 'INTERNAL_ERROR', 'Ocurrió un error inesperado en el servidor.');
}
