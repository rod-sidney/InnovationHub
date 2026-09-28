export let iniciativasLocales = [];
export let categoriasLocales = [];

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

export function obtenerIniciativaPorId(id) {
    return iniciativasLocales.find(ini => ini.id === parseInt(id));
}

export function eliminarIniciativaLocal(id) {
    iniciativasLocales = iniciativasLocales.filter(ini => ini.id !== parseInt(id));
    localStorage.setItem('iniciativas', JSON.stringify(iniciativasLocales));
    return iniciativasLocales;
}

export function actualizarIniciativaLocal(id, datosActualizados) {
    const index = iniciativasLocales.findIndex(ini => ini.id === parseInt(id));
    if (index !== -1) {
        iniciativasLocales[index] = { ...iniciativasLocales[index], ...datosActualizados };
        localStorage.setItem('iniciativas', JSON.stringify(iniciativasLocales));
    }
}