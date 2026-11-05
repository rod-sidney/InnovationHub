// formato.js
// Funciones para mostrar datos de la API de forma legible

// "2026-08-07" o "2026-08-07T15:00:00.000Z" -> "7 de agosto de 2026"
export function formatearFecha(texto) {
    if (!texto) {
        return '';
    }

    // Una fecha sin hora se toma a la medianoche local, para que no se corra al día anterior
    const fecha = texto.length === 10 ? new Date(`${texto}T00:00:00`) : new Date(texto);

    return fecha.toLocaleDateString('es-CR', { year: 'numeric', month: 'long', day: 'numeric' });
}
