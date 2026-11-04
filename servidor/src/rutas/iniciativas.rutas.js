// iniciativas.rutas.js
// Rutas de las iniciativas
// index.js las monta en /api/initiatives

import { Router } from 'express';
import { listar, obtener } from '../controladores/iniciativas.controlador.js';
import { sesionOpcional } from '../middlewares/autenticacion.js';

const rutas = Router();

rutas.get('/', sesionOpcional, listar);
rutas.get('/:id', sesionOpcional, obtener);

export default rutas;