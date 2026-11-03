// Usuario.js
// Modelo de la colección users (ver docs/modelo-datos.md)

import mongoose from 'mongoose';
import { TIPOS_MIEMBRO, ROLES, DISPONIBILIDADES, NIVELES, ESTADOS_CUENTA } from '../utils/valores.js';

// Competencia del usuario: subdocumento embebido con la referencia al catálogo y el nivel
// nivel es dato de la relación usuario-competencia
// _id false porque el subdocumento no necesita identificador propio
const esquemaCompetenciaDelUsuario = new mongoose.Schema({
    skill: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill', required: true },
    level: { type: String, enum: NIVELES, required: true }
}, { _id: false });

const esquemaUsuario = new mongoose.Schema({
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    secondLastName: { type: String, trim: true, default: '' },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true }, //unique
    // select false hace que el hash no venga en las consultas, solo si pide '+passwordHash'
    passwordHash: { type: String, required: true, select: false },
    memberType: { type: String, enum: TIPOS_MIEMBRO, required: true },
    role: { type: String, enum: ROLES, default: 'user' },
    career: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    skills: { type: [esquemaCompetenciaDelUsuario], default: [] },
    interests: { type: [String], default: [] },
    availability: { type: String, enum: [...DISPONIBILIDADES, null], default: null },
    portfolio: { type: String, default: '' },
    photo: { type: String, default: null },
    status: { type: String, enum: ESTADOS_CUENTA, default: 'active' }
}, {
    timestamps: true   // agrega y mantiene createdAt y updatedAt
});

const Usuario = mongoose.model('User', esquemaUsuario);

export default Usuario;
