// index.js (rutas)
// Reúne todas las rutas de la API. app.js las monta bajo el prefijo /api,
// así que aquí '/health' corresponde a GET /api/health (ver docs/api-contract.md).

import { Router } from 'express';

const rutas = Router();

// Permite comprobar que el servidor está encendido
rutas.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

export default rutas;
