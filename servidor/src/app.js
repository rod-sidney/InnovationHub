// app.js
// Crea y configura la aplicación de Express: middlewares globales, rutas de la API y manejo de errores.
// Se separa de server.js para que la configuración no se mezcle con el arranque.

import express from 'express';
import cors from 'cors';

import { config } from './config/env.js';
import rutas from './rutas/index.js';
import { rutaNoEncontrada, manejarErrores } from './middlewares/errores.js';

const app = express();

// No anunciar en las respuestas que el servidor usa Express (encabezado X-Powered-By)
app.disable('x-powered-by');

// CORS explícito: el navegador solo deja llamar a la API desde el origen del cliente React
app.use(cors({
    origin: config.origenCliente,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Convierte el cuerpo JSON de cada petición en el objeto req.body (máximo 1 MB)
app.use(express.json({ limit: '1mb' }));

// Todas las rutas de la API empiezan con /api
app.use('/api', rutas);

// Si ninguna ruta respondió, la ruta no existe
app.use(rutaNoEncontrada);

// convierte cualquier error en la respuesta JSON uniforme
app.use(manejarErrores);

export default app;