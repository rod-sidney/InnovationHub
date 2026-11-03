// valores.js
// Valores controlados del contrato (sección 2 de docs/api-contract.md)
// Los usan los modelos (enum) y las validaciones, para que cada lista exista en un solo lugar

export const TIPOS_INICIATIVA = ['idea', 'need', 'challenge'];

export const CATEGORIAS = [
    'technology', 'education', 'sustainability', 'social_impact',
    'business', 'health', 'culture', 'other'
];

export const VISIBILIDADES = ['public', 'institutional', 'restricted', 'private'];

export const ESTADOS_INICIATIVA = ['draft', 'published', 'team_building', 'converted', 'archived'];

export const ESTADOS_SOLICITUD = ['pending', 'accepted', 'rejected', 'cancelled'];

export const ESTADOS_PROYECTO = ['planning', 'in_progress', 'paused', 'finished', 'archived'];

export const TIPOS_MIEMBRO = ['student', 'teacher', 'staff'];

export const ROLES = ['user', 'admin'];

export const DISPONIBILIDADES = ['low', 'medium', 'high'];

export const NIVELES = ['basic', 'intermediate', 'advanced'];

export const ESTADOS_CUENTA = ['active', 'inactive'];
