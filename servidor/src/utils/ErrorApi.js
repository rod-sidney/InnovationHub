// ErrorApi.js
// Error con la información que necesita la respuesta HTTP
/* 
código de estado (status),
código estable del contrato (codigo),
en los errores de validación, la lista de campos inválidos (detalles)
*/
// Los servicios lo lanzan con throw y el middleware manejarErrores lo convierte en la respuesta JSON uniforme

export class ErrorApi extends Error {
    constructor(status, codigo, mensaje, detalles = []) {
        super(mensaje);
        this.status = status;
        this.codigo = codigo;
        this.detalles = detalles;
    }
}

// Atajos para los dos errores que más se repiten
export function errorDeValidacion(detalles) {
    return new ErrorApi(400, 'VALIDATION_ERROR', 'Los datos enviados no son válidos.', detalles);
}

export function noEncontrado(mensaje) {
    return new ErrorApi(404, 'NOT_FOUND', mensaje);
}
