// usuarios.servicio.js
// Búsqueda de usuarios, consulta y modificación del perfil

import Usuario from '../modelos/Usuario.js';
import { ErrorApi, errorDeValidacion, noEncontrado } from '../utils/ErrorApi.js';
import { patronDeBusqueda } from '../utils/texto.js';
import { armarPagina, saltoDePagina } from '../utils/paginacion.js';
import { aUsuario } from '../utils/representaciones.js';
import { esIdValido } from '../validaciones/reglas.js';
import { verificarCompetencias } from './competencias.servicio.js';

// Criterios de orden permitidos
// _id desempata,cada página es siempre la misma
const ORDENES = {
    name: { firstName: 1, lastName: 1, _id: 1 },
    recent: { createdAt: -1, _id: 1 }
};

export async function buscarUsuarios(filtros, paginacion) {
    // Solo se listan cuentas activas
    const filtro = { status: 'active' };

    // Cada palabra buscada debe aparecer en el nombre o en alguno de los apellidos
    if (filtros.q) {
        filtro.$and = filtros.q.split(/\s+/).map((palabra) => {
            const patron = patronDeBusqueda(palabra);
            return { $or: [{ firstName: patron }, { lastName: patron }, { secondLastName: patron }] };
        });
    }

    if (filtros.skill) filtro['skills.skill'] = filtros.skill;
    if (filtros.career) filtro.career = patronDeBusqueda(filtros.career);
    if (filtros.availability) filtro.availability = filtros.availability;
    if (filtros.memberType) filtro.memberType = filtros.memberType;

    // La página y el total se piden a MongoDB al mismo tiempo, no se descarga la colección completa
    const [usuarios, total] = await Promise.all([
        Usuario.find(filtro)
            .collation({ locale: 'es' })
            .sort(ORDENES[paginacion.sort])
            .skip(saltoDePagina(paginacion))
            .limit(paginacion.size)
            .populate('skills.skill'),
        Usuario.countDocuments(filtro)
    ]);

    return armarPagina(usuarios.map((usuario) => aUsuario(usuario)), total, paginacion);
}

export async function obtenerPerfil(id, usuarioActual) {
    const usuario = esIdValido(id) ? await Usuario.findById(id).populate('skills.skill') : null;

    if (!usuario) {
        throw noEncontrado('El usuario no existe.');
    }

    // El correo solo se muestra en el propio perfil
    const esPropio = String(usuario._id) === String(usuarioActual._id);
    return aUsuario(usuario, esPropio);
}

export async function actualizarPerfil(id, datos, usuarioActual) {
    const usuario = esIdValido(id) ? await Usuario.findById(id) : null;

    if (!usuario) {
        throw noEncontrado('El usuario no existe.');
    }

    // Cada persona solo modifica su propio perfil
    if (String(usuario._id) !== String(usuarioActual._id)) {
        throw new ErrorApi(403, 'FORBIDDEN', 'Solo puedes modificar tu propio perfil.');
    }

    // El correo identifica la cuenta y no se cambia desde el perfil
    if (datos.email && datos.email !== usuario.email) {
        throw errorDeValidacion([{ field: 'email', message: 'El correo no se puede modificar desde el perfil.' }]);
    }

    await verificarCompetencias(datos.skills.map((elemento) => elemento.skill), 'skills');

    // Solo se copian los campos editables
    // email, role, memberType y status no cambian
    usuario.set({
        firstName: datos.firstName,
        lastName: datos.lastName,
        secondLastName: datos.secondLastName,
        career: datos.career,
        description: datos.description,
        interests: datos.interests,
        availability: datos.availability,
        portfolio: datos.portfolio,
        skills: datos.skills,
        photo: datos.photo
    });

    await usuario.save();   // timestamps actualiza updatedAt
    await usuario.populate('skills.skill');

    return aUsuario(usuario, true);
}