// solicitudes.rutas.js
// Rutas de las solicitudes de participación
// index.js las monta en /api/requests.
// Todas exigen sesión

import { Router } from 'express';
import { crear, enviadas, recibidas, obtener, actualizar } from '../controladores/solicitudes.controlador.js';
import { requerirSesion } from '../middlewares/autenticacion.js';

const rutas = Router();

rutas.post('/', requerirSesion, crear);
// '/sent' y '/received' van antes de '/:id': si no, Express tomaría "sent" como un id
rutas.get('/sent', requerirSesion, enviadas);
rutas.get('/received', requerirSesion, recibidas);
rutas.get('/:id', requerirSesion, obtener);
rutas.put('/:id', requerirSesion, actualizar);

export default rutas;
