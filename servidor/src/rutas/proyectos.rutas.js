// proyectos.rutas.js
// Rutas de los proyectos
// index.js las monta en /api/projects

import { Router } from 'express';
import { crear, listar, obtener } from '../controladores/proyectos.controlador.js';
import { requerirSesion, sesionOpcional } from '../middlewares/autenticacion.js';

const rutas = Router();

rutas.get('/', sesionOpcional, listar);
rutas.get('/:id', sesionOpcional, obtener);
rutas.post('/', requerirSesion, crear);

export default rutas;
