// Solicitud.js
// Modelo de la colección requests: solicitudes de participación
// Colección propia porque crece sin límite y se consulta por solicitante y por iniciativa (ver docs/modelo-datos.md)

import mongoose from 'mongoose';
import { DISPONIBILIDADES, ESTADOS_SOLICITUD } from '../utils/valores.js';

const { ObjectId } = mongoose.Schema.Types;

const esquemaSolicitud = new mongoose.Schema({
    initiative: { type: ObjectId, ref: 'Initiative', required: true },
    requester: { type: ObjectId, ref: 'User', required: true },
    skill: { type: ObjectId, ref: 'Skill', required: true }, // competencia principal que aporta solicitante
    role: { type: String, required: true, trim: true },
    availability: { type: String, enum: DISPONIBILIDADES, required: true },
    message: { type: String, default: '' },
    status: { type: String, enum: ESTADOS_SOLICITUD, default: 'pending' },
    responseComment: { type: String, default: null }, //propietario acepta o rechaza
    decidedAt: { type: Date, default: null }
}, {
    timestamps: true
});

// índice único parcial
// Solo aplica a las solicitudes pendientes, bd impide segunda solicitud pendiente del mismo usuario, pero permite volver a solicitar después de una rechazada o cancelada.
esquemaSolicitud.index(
    { initiative: 1, requester: 1 },
    { unique: true, partialFilterExpression: { status: 'pending' } }
);
esquemaSolicitud.index({ requester: 1, createdAt: -1 });
esquemaSolicitud.index({ initiative: 1, status: 1 });

const Solicitud = mongoose.model('Request', esquemaSolicitud);

export default Solicitud;