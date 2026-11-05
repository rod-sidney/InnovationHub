// index.js (rutas)
// Reúne todas las rutas de la API. 
// app.js las monta bajo el prefijo /api, '/health' corresponde a GET /api/health (ver docs/api-contract.md)

import { Router } from 'express';

import rutasAutenticacion from './autenticacion.rutas.js';
import rutasCompetencias from './competencias.rutas.js';
import rutasIniciativas from './iniciativas.rutas.js';
import rutasSolicitudes from './solicitudes.rutas.js';
import rutasUsuarios from './usuarios.rutas.js';

const rutas = Router();

// comprobar que el servidor está encendido
rutas.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

rutas.use('/auth', rutasAutenticacion);
rutas.use('/users', rutasUsuarios);
rutas.use('/skills', rutasCompetencias);
rutas.use('/initiatives', rutasIniciativas);
rutas.use('/requests', rutasSolicitudes);

export default rutas;