// github.js (api)
// Consulta la API pública de GitHub desde el navegador
// La dirección base viene de la variable de entorno VITE_GITHUB_API_URL
// No se usa token, en el cliente quedaría a la vista de cualquiera, así que se usa el acceso público
// (60 consultas por hora por dirección IP)

const URL_GITHUB = import.meta.env.VITE_GITHUB_API_URL;

// Error con un tipo, para que la interfaz muestre el mensaje y la acción adecuados
export class ErrorDeGitHub extends Error {
    constructor(tipo, mensaje) {
        super(mensaje);
        this.tipo = tipo;
    }
}

// GitHub responde 403 (o 429) cuando se acaban las consultas y lo avisa en sus encabezados
function esLimiteAlcanzado(respuesta) {
    return respuesta.status === 429
        || (respuesta.status === 403 && respuesta.headers.get('x-ratelimit-remaining') === '0');
}

// x-ratelimit-reset trae el momento (en segundos) en que se renuevan las consultas
function horaDeReinicio(respuesta) {
    const segundos = Number(respuesta.headers.get('x-ratelimit-reset'));
    if (!segundos) {
        return '';
    }
    return new Date(segundos * 1000).toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' });
}

export async function obtenerRepositorio(propietario, nombre, signal) {
    if (!URL_GITHUB) {
        throw new ErrorDeGitHub('configuracion', 'Falta la variable VITE_GITHUB_API_URL en el archivo cliente/.env.');
    }

    let respuesta;
    try {
        respuesta = await fetch(`${URL_GITHUB}/repos/${encodeURIComponent(propietario)}/${encodeURIComponent(nombre)}`, {
            headers: { Accept: 'application/vnd.github+json' },
            signal
        });
    } catch (error) {
        if (error.name === 'AbortError') {
            throw error;
        }
        // Sin respuesta: no hay red o GitHub no está disponible
        throw new ErrorDeGitHub('no-disponible', 'No se pudo conectar con GitHub. Revisa la conexión o intenta más tarde.');
    }

    if (esLimiteAlcanzado(respuesta)) {
        const hora = horaDeReinicio(respuesta);
        throw new ErrorDeGitHub('limite', `Se alcanzó el límite de consultas a GitHub. ${hora ? `Podrás consultar de nuevo a partir de las ${hora}` : 'Intenta más tarde.'}`);
    }

    // GitHub responde 404 tanto si el repositorio no existe como si es privado
    if (respuesta.status === 404) {
        throw new ErrorDeGitHub('no-encontrado', 'El repositorio no existe o es privado. GitHub responde igual en los dos casos para proteger los repositorios privados.');
    }

    if (respuesta.status >= 500) {
        throw new ErrorDeGitHub('no-disponible', 'GitHub no está disponible en este momento. Intenta más tarde.');
    }

    if (!respuesta.ok) {
        throw new ErrorDeGitHub('error-http', `GitHub respondió con un error (código ${respuesta.status}).`);
    }

    let datos;
    try {
        datos = await respuesta.json();
    } catch (error) {
        if (error.name === 'AbortError') {
            throw error;
        }
        throw new ErrorDeGitHub('respuesta-invalida', 'GitHub envió una respuesta que no se pudo leer.');
    }

    // Respuesta inválida: falta la información mínima que hay que mostrar
    if (!datos || typeof datos.name !== 'string' || !datos.owner || typeof datos.owner.login !== 'string') {
        throw new ErrorDeGitHub('respuesta-invalida', 'La respuesta de GitHub no tiene el formato esperado.');
    }

    // Solo los datos que pide, open_issues_count de GitHub incluye los pull requests abiertos.
    return {
        nombre: datos.name,
        propietario: datos.owner.login,
        descripcion: datos.description,
        lenguaje: datos.language,
        ramaPrincipal: datos.default_branch,
        ultimaActualizacion: datos.pushed_at || datos.updated_at,
        asuntosAbiertos: datos.open_issues_count,
        enlace: datos.html_url,
        privado: datos.private === true
    };
}
