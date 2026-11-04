// iniciativas.rutas.js
// Rutas de las iniciativas
// index.js las monta en /api/initiatives

import { Router } from 'express';
import { listar, obtener, crear, actualizar } from '../controladores/iniciativas.controlador.js';
import { sesionOpcional, requerirSesion } from '../middlewares/autenticacion.js';

const rutas = Router();

rutas.get('/', sesionOpcional, listar);
rutas.get('/:id', sesionOpcional, obtener);
rutas.post('/', requerirSesion, crear);
rutas.put('/:id', requerirSesion, actualizar);

export default rutas;