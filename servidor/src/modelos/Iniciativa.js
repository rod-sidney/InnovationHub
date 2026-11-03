// Iniciativa.js
// Modelo de la colección initiatives (ver docs/modelo-datos.md)
// El equipo se guarda embebido: acotado por memberLimit y se lee con la iniciativa

import mongoose from 'mongoose';
import { TIPOS_INICIATIVA, CATEGORIAS, VISIBILIDADES, ESTADOS_INICIATIVA } from '../utils/valores.js';

const { ObjectId } = mongoose.Schema.Types;

// Integrante actual del equipo: referencia al usuario, rol y fecha de incorporación
const esquemaMiembro = new mongoose.Schema({
    user: { type: ObjectId, ref: 'User', required: true },
    role: { type: String, required: true, trim: true },
    joinedAt: { type: Date, default: Date.now }
}, { _id: false });

// Integrante retirado: se conserva para el historial con la fecha y el motivo
const esquemaRetiro = new mongoose.Schema({
    user: { type: ObjectId, ref: 'User', required: true },
    role: { type: String, default: '' },
    joinedAt: { type: Date },
    removedAt: { type: Date, default: Date.now },
    reason: { type: String, default: '' }
}, { _id: false });

const esquemaIniciativa = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    type: { type: String, enum: TIPOS_INICIATIVA, required: true },
    category: { type: String, enum: CATEGORIAS, required: true },
    summary: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    problem: { type: String, default: '' },
    beneficiaries: { type: String, default: '' },
    tags: { type: [String], default: [] },
    visibility: { type: String, enum: VISIBILIDADES, required: true },
    status: { type: String, enum: ESTADOS_INICIATIVA, default: 'published' },
    // Competencias requeridas: referencias al catálogo
    skills: [{ type: ObjectId, ref: 'Skill' }],
    // Exactamente un propietario (RN-02): referencia al usuario
    owner: { type: ObjectId, ref: 'User', required: true },
    members: { type: [esquemaMiembro], default: [] },
    removedMembers: { type: [esquemaRetiro], default: [] },
    memberLimit: { type: Number, required: true, min: 1, max: 20 },
    image: { type: String, default: null }
}, {
    timestamps: true
});

// Índices para las consultas frecuentes: por propietario, por miembro y el catálogo
esquemaIniciativa.index({ owner: 1 });
esquemaIniciativa.index({ 'members.user': 1 });
esquemaIniciativa.index({ visibility: 1, status: 1, createdAt: -1 });

const Iniciativa = mongoose.model('Initiative', esquemaIniciativa);

export default Iniciativa;