// usuarios.rutas.js
// index.js las monta en /api/users
// Todas exigen sesión.

import { Router } from 'express';
import { buscar, obtener, actualizar } from '../controladores/usuarios.controlador.js';
import { requerirSesion } from '../middlewares/autenticacion.js';

const rutas = Router();

rutas.get('/', requerirSesion, buscar);
rutas.get('/:id', requerirSesion, obtener);
rutas.put('/:id', requerirSesion, actualizar);

export default rutas;