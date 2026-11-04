// competencias.servicio.js
// Lógica del catálogo de competencias
// Lee y guarda en MongoDB por medio del modelo Competencia

import Competencia from '../modelos/Competencia.js';
import { noEncontrado } from '../utils/ErrorApi.js';
import { patronDeBusqueda } from '../utils/texto.js';
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