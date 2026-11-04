// autenticacion.rutas.js
// Rutas de autenticación
// index.js las monta en /api/auth

import { Router } from 'express';
import { registrar, iniciarSesion } from '../controladores/autenticacion.controlador.js';

const rutas = Router();

rutas.post('/register', registrar);
rutas.post('/login', iniciarSesion);

export default rutas;