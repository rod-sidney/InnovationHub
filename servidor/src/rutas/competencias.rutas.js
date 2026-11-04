// competencias.rutas.js
// Rutas del catálogo de competencias
// index.js las monta en /api/skills

import { Router } from 'express';
import { listar, obtener } from '../controladores/competencias.controlador.js';

const rutas = Router();

rutas.get('/', listar);
rutas.get('/:id', obtener);

export default rutas;