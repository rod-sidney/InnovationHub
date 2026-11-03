// Proyecto.js
// Modelo de la colección projects
// Conserva la referencia a la iniciativa de origen, y no copia el equipo, los integrantes se leen de la iniciativa (ver docs/modelo-datos.md)

import mongoose from 'mongoose';
import { ESTADOS_PROYECTO } from '../utils/valores.js';

const { ObjectId } = mongoose.Schema.Types;

// Solo lo necesario para identificar el repositorio de GitHub
const esquemaRepositorio = new mongoose.Schema({
    owner: { type: String, required: true },
    name: { type: String, required: true }
}, { _id: false });

const esquemaProyecto = new mongoose.Schema({
    initiative: { type: ObjectId, ref: 'Initiative', required: true, unique: true }, //unique: 1 iniciativa = solo 1 proyecto
    owner: { type: ObjectId, ref: 'User', required: true }, // pasar propietario
    name: { type: String, required: true, trim: true },
    objective: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    technologies: { type: [String], default: [] },
    startDate: { type: Date, required: true },
    estimatedEndDate: { type: Date, default: null },
    status: { type: String, enum: ESTADOS_PROYECTO, default: 'planning' },
    repository: { type: esquemaRepositorio, default: null }
}, {
    timestamps: true
});

const Proyecto = mongoose.model('Project', esquemaProyecto);

export default Proyecto;