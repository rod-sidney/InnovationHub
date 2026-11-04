// autenticacion.rutas.js
// Rutas de autenticación
// index.js las monta en /api/auth

import { Router } from 'express';
import { registrar, iniciarSesion, cerrarSesion, usuarioActual } from '../controladores/autenticacion.controlador.js';
import { requerirSesion } from '../middlewares/autenticacion.js';

const rutas = Router();

rutas.post('/register', registrar);
rutas.post('/login', iniciarSesion);
rutas.post('/logout', requerirSesion, cerrarSesion);
rutas.get('/me', requerirSesion, usuarioActual);

export default rutas;