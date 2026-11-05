// etiquetas.js
// La API usa valores controlados en inglés (sección 2 del contrato)
// la interfaz los muestra en español con estas tablas
// Si el servidor cambia de lenguaje, estos valores no cambian

export const TIPOS = {
    idea: 'Idea',
    need: 'Necesidad',
    challenge: 'Reto'
};

export const CATEGORIAS = {
    technology: 'Tecnología',
    education: 'Educación',
    sustainability: 'Sostenibilidad',
    social_impact: 'Impacto social',
    business: 'Negocios y emprendimiento',
    health: 'Salud y bienestar',
    culture: 'Cultura y creatividad',
    other: 'Otro'
};

export const VISIBILIDADES = {
    public: 'Pública',
    institutional: 'Institucional',
    restricted: 'Restringida',
    private: 'Privada'
};

export const ESTADOS_INICIATIVA = {
    draft: 'Borrador',
    published: 'Publicada',
    team_building: 'En formación de equipo',
    converted: 'Convertida en proyecto',
    archived: 'Archivada'
};

export const ESTADOS_SOLICITUD = {
    pending: 'Pendiente',
    accepted: 'Aceptada',
    rejected: 'Rechazada',
    cancelled: 'Cancelada'
};

export const ESTADOS_PROYECTO = {
    planning: 'Planificación',
    in_progress: 'En desarrollo',
    paused: 'Pausado',
    finished: 'Finalizado',
    archived: 'Archivado'
};

export const TIPOS_MIEMBRO = {
    student: 'Estudiante',
    teacher: 'Docente',
    staff: 'Administrativo'
};

export const DISPONIBILIDADES = {
    low: 'Menos de 5 horas semanales',
    medium: '5 a 10 horas semanales',
    high: 'Más de 10 horas semanales'
};

export const NIVELES = {
    basic: 'Básico',
    intermediate: 'Intermedio',
    advanced: 'Avanzado'
};

// Convierte una tabla en la lista de opciones de un <select>: [{ valor, etiqueta }]
export function opcionesDe(tabla) {
    return Object.entries(tabla).map(([valor, etiqueta]) => ({ valor, etiqueta }));
}
