// server.js
// Punto de entrada del servidor: abre el puerto y empieza a recibir peticiones.

import app from './app.js';
import { config } from './config/env.js';

app.listen(config.puerto, () => {
    console.log(`API de Innovation Hub escuchando en http://localhost:${config.puerto}/api`);
});
