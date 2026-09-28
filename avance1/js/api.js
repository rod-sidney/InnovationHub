// Variables globales para simular la base de datos
export let iniciativasLocales = [];
export let categoriasLocales = [];

// Función para cargar los JSON y simular persistencia con localStorage
export async function cargarDatos() {
    try {
        const dataGuardada = localStorage.getItem('iniciativas');

        if (dataGuardada) {
            iniciativasLocales = JSON.parse(dataGuardada);
        } else {
            const resIniciativas = await fetch('../datos/iniciativas.json');

            if (!resIniciativas.ok) {
                throw new Error("Error al conectar con los datos locales");
            }

            iniciativasLocales = await resIniciativas.json();
            localStorage.setItem('iniciativas', JSON.stringify(iniciativasLocales));
        }

        return iniciativasLocales;
    } catch (error) {
        console.error("Error en API:", error);
        throw error;
    }
}

// Obtener una iniciativa específica
export function obtenerIniciativaPorId(id) {
    return iniciativasLocales.find(ini => ini.id === parseInt(id));
}

// Eliminar localmente y guardar en Storage
export function eliminarIniciativaLocal(id) {
    iniciativasLocales = iniciativasLocales.filter(ini => ini.id !== parseInt(id));
    localStorage.setItem('iniciativas', JSON.stringify(iniciativasLocales));
    return iniciativasLocales;
}

// Actualizar iniciativa y guardar en Storage
export function actualizarIniciativaLocal(id, datosActualizados) {
    const index = iniciativasLocales.findIndex(ini => ini.id === parseInt(id));
    if (index !== -1) {
        iniciativasLocales[index] = { ...iniciativasLocales[index], ...datosActualizados };
        localStorage.setItem('iniciativas', JSON.stringify(iniciativasLocales));
    }
}