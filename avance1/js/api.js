export let iniciativasLocales = [];
export let categoriasLocales = [];
export let competenciasLocales = [];

// Si cambia la estructura de los archivos .json, se sube este número para que el navegador
// descarte la copia vieja guardada en localStorage y vuelva a leer los archivos.
const VERSION_DATOS = '3';

// index.html está en avance1/ y las demás páginas en avance1/paginas/
export function rutaBase() {
    return window.location.pathname.includes('/paginas/') ? '../' : './';
}

// Fecha local en formato YYYY-MM-DD (toISOString usa la hora UTC y en la noche da el día siguiente)
export function fechaDeHoy() {
    const hoy = new Date();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const dia = String(hoy.getDate()).padStart(2, '0');
    return `${hoy.getFullYear()}-${mes}-${dia}`;
}

export async function cargarDatos() {
    try {
        const dataGuardada = localStorage.getItem('iniciativas');
        const versionGuardada = localStorage.getItem('version_datos');

        if (dataGuardada && versionGuardada === VERSION_DATOS) {
            iniciativasLocales = JSON.parse(dataGuardada);
        } else {
            const resIniciativas = await fetch(`${rutaBase()}datos/iniciativas.json`);

            if (!resIniciativas.ok) {
                throw new Error("Error al conectar con los datos locales");
            }

            iniciativasLocales = await resIniciativas.json();
            guardarIniciativas();
            localStorage.setItem('version_datos', VERSION_DATOS);
        }

        return iniciativasLocales;
    } catch (error) {
        console.error("Error en API:", error);
        throw error;
    }
}

// Catálogo de competencias
export async function cargarCompetencias() {
    const respuesta = await fetch(`${rutaBase()}datos/competencias.json`);

    if (!respuesta.ok) {
        throw new Error("No se pudo leer el catálogo de competencias");
    }

    competenciasLocales = await respuesta.json();
    return competenciasLocales;
}

// Lanza un error si el navegador ya no tiene espacio
function guardarIniciativas() {
    localStorage.setItem('iniciativas', JSON.stringify(iniciativasLocales));
}

// Error que da localStorage cuando se llena (5MB aprox)
export function esErrorDeEspacio(error) {
    return error.name === 'QuotaExceededError';
}

export function obtenerIniciativaPorId(id) {
    return iniciativasLocales.find(ini => ini.id === parseInt(id));
}

export function agregarIniciativaLocal(datos) {
    const nuevaIniciativa = {
        id: iniciativasLocales.length ? Math.max(...iniciativasLocales.map(i => i.id)) + 1 : 1,
        ...datos
    };
    iniciativasLocales.push(nuevaIniciativa);

    try {
        guardarIniciativas();
    } catch (error) {
        // Se deshace para que la lista en memoria no quede distinta a lo guardado
        iniciativasLocales.pop();
        throw error;
    }
    return nuevaIniciativa;
}

export function eliminarIniciativaLocal(id) {
    iniciativasLocales = iniciativasLocales.filter(ini => ini.id !== parseInt(id));
    guardarIniciativas();
    return iniciativasLocales;
}

export function actualizarIniciativaLocal(id, datosActualizados) {
    const index = iniciativasLocales.findIndex(ini => ini.id === parseInt(id));
    if (index !== -1) {
        const anterior = iniciativasLocales[index];
        iniciativasLocales[index] = { ...anterior, ...datosActualizados };

        try {
            guardarIniciativas();
        } catch (error) {
            iniciativasLocales[index] = anterior;
            throw error;
        }
    }
}