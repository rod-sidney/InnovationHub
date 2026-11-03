// app.js
// Crea y configura la aplicación de Express: middlewares globales y rutas de la API.
// Se separa de server.js para que la configuración no se mezcle con el arranque.

import express from 'express';
import cors from 'cors';

import { config } from './config/env.js';
import rutas from './rutas/index.js';

const app = express();

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

export default app;
