// Competencia.js
// Modelo de la colección skills: el catálogo de competencias (ver docs/modelo-datos.md)

import mongoose from 'mongoose';

const esquemaCompetencia = new mongoose.Schema({
    name: { type: String, required: true, unique: true, trim: true }, //unique
    category: { type: String, required: true, trim: true }
});

const Competencia = mongoose.model('Skill', esquemaCompetencia);

export default Competencia;
