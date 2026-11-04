// competencias.servicio.js
// Lógica del catálogo de competencias
// Lee y guarda en MongoDB por medio del modelo Competencia

import Competencia from '../modelos/Competencia.js';
import { ErrorApi, noEncontrado } from '../utils/ErrorApi.js';
import { escaparRegex, patronDeBusqueda } from '../utils/texto.js';
import { aCompetencia } from '../utils/representaciones.js';
import { esIdValido } from '../validaciones/reglas.js';

export async function listarCompetencias({ q, category }) {
    const filtro = {};

    if (q) filtro.name = patronDeBusqueda(q);
    if (category) filtro.category = category;

    // ordena con las reglas del español (las palabras con tilde no quedan al final)
    const competencias = await Competencia.find(filtro)
        .collation({ locale: 'es' })
        .sort({ category: 1, name: 1 });

    return competencias.map(aCompetencia);
}

export async function obtenerCompetencia(id) {
    // Un id con formato inválido es igual que uno que no existe (contrato, sección 1.2)
    const competencia = esIdValido(id) ? await Competencia.findById(id) : null;

    if (!competencia) {
        throw noEncontrado('La competencia no existe.');
    }

    return aCompetencia(competencia);
}

export async function crearCompetencia({ name, category }) {
    // Se compara el nombre completo sin distinguir mayúsculas
    // "react" y "React" son la misma
    const existe = await Competencia.exists({ name: new RegExp(`^${escaparRegex(name)}$`, 'i') });
    if (existe) {
        throw new ErrorApi(409, 'SKILL_EXISTS', 'Ya existe una competencia con ese nombre.');
    }

    try {
        const competencia = await Competencia.create({ name, category });
        return aCompetencia(competencia);
    } catch (error) {
        // índice unique detiene que dos iguales lleguen
        if (error.code === 11000) {
            throw new ErrorApi(409, 'SKILL_EXISTS', 'Ya existe una competencia con ese nombre.');
        }
        throw error;
    }
}