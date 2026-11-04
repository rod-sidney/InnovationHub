// competencias.rutas.js
// Rutas del catálogo de competencias
// index.js las monta en /api/skills

import { Router } from 'express';
import { listar, obtener, crear } from '../controladores/competencias.controlador.js';
import { requerirSesion, requerirAdministrador } from '../middlewares/autenticacion.js';

const rutas = Router();

rutas.get('/', listar);
rutas.get('/:id', obtener);
rutas.post('/', requerirSesion, requerirAdministrador, crear);

export default rutas;