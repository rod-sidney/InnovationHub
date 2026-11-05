// cliente.js
// Única función que habla con la API (fetch)
// Las demás funciones de la carpeta api la usan
// La dirección del servidor viene de la variable de entorno VITE_API_URL
// para usar otro servidor solo se cambia el archivo .env

const URL_API = import.meta.env.VITE_API_URL;

// Token de la sesión actual
// Lo actualiza el contexto de sesión al iniciar o cerrar sesión
let tokenActual = null;

export function usarToken(token) {
    tokenActual = token;
}

// Función del contexto de sesión que se llama cuando el servidor rechaza el token (401)
let avisarSesionVencida = null;

export function alVencerLaSesion(funcion) {
    avisarSesionVencida = funcion;
}

// Error con los datos del formato uniforme del contrato: status, code, message y details
export class ErrorDeApi extends Error {
    constructor(status, codigo, mensaje, detalles = []) {
        super(mensaje);
        this.status = status;
        this.codigo = codigo;
        this.detalles = detalles;
    }
}

// Hace la petición y devuelve los datos de la respuesta
// Si la API responde un error, lanza un ErrorDeApi con la información que envió el servidor
// signal cancela la petición (AbortController) cuando el componente se desmonta
export async function pedir(ruta, { metodo = 'GET', cuerpo, signal } = {}) {
    if (!URL_API) {
        throw new ErrorDeApi(0, 'CONFIG_ERROR', 'Falta la variable VITE_API_URL en el archivo cliente/.env.');
    }

    const encabezados = {};
    if (cuerpo !== undefined) {
        encabezados['Content-Type'] = 'application/json';
    }
    // Con sesión, cada petición lleva el token (contrato, sección 1.4)
    if (tokenActual) {
        encabezados.Authorization = `Bearer ${tokenActual}`;
    }

    let respuesta;
    try {
        respuesta = await fetch(`${URL_API}${ruta}`, {
            method: metodo,
            headers: encabezados,
            body: cuerpo !== undefined ? JSON.stringify(cuerpo) : undefined,
            signal
        });
    } catch (error) {
        // Una petición cancelada se deja pasar, quien la canceló sabe qué hacer
        if (error.name === 'AbortError') {
            throw error;
        }
        // fetch falla sin respuesta cuando el servidor está apagado o no hay red
        throw new ErrorDeApi(0, 'NETWORK_ERROR', 'No se pudo conectar con el servidor. Revisa que esté encendido.');
    }

    // 204 No Content: la operación salió bien y no hay datos que leer
    if (respuesta.status === 204) {
        return null;
    }

    let datos = null;
    try {
        datos = await respuesta.json();
    } catch (error) {
        if (error.name === 'AbortError') {
            throw error;
        }
        // La respuesta no traía JSON válido, se trata abajo según el código de estado
    }

    if (!respuesta.ok) {
        const detalle = datos && datos.error ? datos.error : null;

        // El token venció o se cerró la sesión en otro lado, el contexto limpia la sesión
        if (respuesta.status === 401 && tokenActual && detalle && detalle.code === 'UNAUTHENTICATED' && avisarSesionVencida) {
            avisarSesionVencida();
        }

        throw new ErrorDeApi(
            respuesta.status,
            detalle ? detalle.code : 'UNKNOWN_ERROR',
            detalle ? detalle.message : 'El servidor respondió con un error inesperado.',
            detalle ? detalle.details : []
        );
    }

    return datos;
}

// Arma la parte "?page=1&size=9&type=idea" de la dirección, sin los filtros vacíos
export function armarConsulta(parametros) {
    const consulta = new URLSearchParams();

    for (const [clave, valor] of Object.entries(parametros)) {
        if (valor !== '' && valor !== null && valor !== undefined && valor !== false) {
            consulta.set(clave, valor);
        }
    }

    const texto = consulta.toString();
    return texto ? `?${texto}` : '';
}
