// competencias.validacion.js
// Validación de los datos que llegan a las rutas del catálogo de competencias

import { texto } from './reglas.js';
import { errorDeValidacion } from '../utils/ErrorApi.js';

// Parámetros de GET /api/skills
export function validarConsultaCompetencias(consulta) {
    const errores = [];

    const q = texto(errores, 'q', consulta.q, { nombre: 'el texto de búsqueda', maximo: 60 });
    const category = texto(errores, 'category', consulta.category, { nombre: 'la categoría', maximo: 60 });

    if (errores.length > 0) {
        throw errorDeValidacion(errores);
    }

    return { q, category };
}