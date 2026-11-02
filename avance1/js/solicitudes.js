// Propósito: datos de las solicitudes de participación
// Se guardan en localStorage
import { fechaDeHoy } from './api.js';

const CLAVE_SOLICITUDES = 'solicitudes';

export function obtenerSolicitudes() {
    return JSON.parse(localStorage.getItem(CLAVE_SOLICITUDES)) || [];
}

// Un usuario no puede tener dos solicitudes pendientes para la misma iniciativa
export function buscarSolicitudPendiente(iniciativaId, usuarioId) {
    return obtenerSolicitudes().find(solicitud =>
        solicitud.iniciativa_id === iniciativaId &&
        solicitud.usuario_id === usuarioId &&
        solicitud.estado === 'Pendiente'
    );
}

// Guarda la solicitud con estado inicial Pendiente
// Devuelve null si ya existe una pendiente y lanza un error si localStorage está lleno
export function registrarSolicitud(datos) {
    if (buscarSolicitudPendiente(datos.iniciativa_id, datos.usuario_id)) {
        return null;
    }

    const solicitudes = obtenerSolicitudes();
    const nuevaSolicitud = {
        id: solicitudes.length ? Math.max(...solicitudes.map(s => s.id)) + 1 : 1,
        ...datos,
        // Van después de ...datos para que el sistema siempre genere la fecha y el estado
        fecha: fechaDeHoy(),
        estado: 'Pendiente'
    };

    solicitudes.push(nuevaSolicitud);
    localStorage.setItem(CLAVE_SOLICITUDES, JSON.stringify(solicitudes));
    return nuevaSolicitud;
}
