// env.js
// Lee la configuración del servidor desde las variables de entorno. dotenv copia el contenido del archivo .env (que no se sube al repositorio) dentro de process.env.

import dotenv from 'dotenv';

// quiet: true evita que dotenv escriba un mensaje en la consola cada vez que carga el archivo
dotenv.config({ quiet: true });

// Devuelve el valor de una variable obligatoria. Si falta, el servidor no arranca y el mensaje dice exactamente cuál falta.
function leerObligatoria(nombre) {
    const valor = process.env[nombre];

    if (!valor) {
        throw new Error(`Falta la variable de entorno ${nombre}. Copia .env.example como .env y complétalo.`);
    }

    return valor;
}

export const config = {
    puerto: Number(process.env.PORT) || 3000,
    origenCliente: leerObligatoria('CLIENT_ORIGIN')
};
