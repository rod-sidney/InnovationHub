// competencias.js (api)
// Funciones para las rutas /api/skills del contrato

import { pedir } from './cliente.js';

// GET /api/skills: el catálogo completo
export function listarCompetencias(signal) {
    return pedir('/skills', { signal });
}
