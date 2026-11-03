// Sesion.js
// Modelo de la colección sessions 
// Cada inicio de sesión crea un documento, cerrar sesión lo borra y el token deja de servir
// Se guarda el hash del token, no el token

import mongoose from 'mongoose';

const esquemaSesion = new mongoose.Schema({
    tokenHash: { type: String, required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    expiresAt: { type: Date, required: true }
}, {
    timestamps: true
});

// Índice TTL: MongoDB borra la sesión fecha expiresAt
// proceso que limpia corre una vez por minuto
esquemaSesion.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Sesion = mongoose.model('Session', esquemaSesion);

export default Sesion;
