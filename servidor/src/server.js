// server.js
// Punto de entrada del servidor: conecta con MongoDB y después abre el puerto.

import app from './app.js';
import { config } from './config/env.js';
import { conectarBaseDeDatos } from './config/db.js';

// Primero la base de datos, si no hay conexión, no hay peticiones.
// await porque proyecto usa módulos ES
try {
    await conectarBaseDeDatos();
    // Express 5 entrega a esta función el error si no pudo abrir el puerto
    app.listen(config.puerto, (error) => {
        if (error) {
            console.error(`No se pudo abrir el puerto ${config.puerto}: ${error.message}`);
            process.exit(1);
        }
        console.log(`API de Innovation Hub escuchando en http://localhost:${config.puerto}/api`);
    });
} catch (error) {
    console.error('No se pudo iniciar el servidor:', error.message);
    process.exit(1);
}
