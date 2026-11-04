// usuarios.validacion.js
// Validación de la búsqueda de usuarios y de la modificación del perfil

import { texto, opcion, id, imagen, listaDeTextos, esIdValido } from './reglas.js';
import { validarNombres, validarCarrera } from './autenticacion.validacion.js';
import { errorDeValidacion } from '../utils/ErrorApi.js';
import { leerPaginacion } from '../utils/paginacion.js';
import { DISPONIBILIDADES, TIPOS_MIEMBRO, NIVELES } from '../utils/valores.js';

// Parámetros de GET /api/users
export function validarConsultaUsuarios(consulta) {
    const errores = [];

    const q = texto(errores, 'q', consulta.q, { nombre: 'el texto de búsqueda', maximo: 60 });
    const skill = id(errores, 'skill', consulta.skill, { nombre: 'la competencia', obligatorio: false });
    const career = texto(errores, 'career', consulta.career, { nombre: 'la carrera', maximo: 80 });
    const availability = opcion(errores, 'availability', consulta.availability, {
        nombre: 'la disponibilidad', permitidos: DISPONIBILIDADES, obligatorio: false
    });
    const memberType = opcion(errores, 'memberType', consulta.memberType, {
        nombre: 'el tipo de miembro', permitidos: TIPOS_MIEMBRO, obligatorio: false
    });
    const paginacion = leerPaginacion(errores, consulta, ['name', 'recent']);

    if (errores.length > 0) {
        throw errorDeValidacion(errores);
    }

    return { filtros: { q, skill, career, availability, memberType }, paginacion };
}

// Competencias del perfil: lista de { skillId, level } sin competencias repetidas
// Devuelve la forma que usa el modelo { skill, level }
function validarCompetenciasDelPerfil(errores, valor) {
    const lista = valor === undefined || valor === null ? [] : valor;

    if (!Array.isArray(lista)) {
        errores.push({ field: 'skills', message: 'Las competencias: se esperaba una lista.' });
        return [];
    }

    if (lista.length > 15) {
        errores.push({ field: 'skills', message: 'Se permiten como máximo 15 competencias en el perfil.' });
        return [];
    }

    const vistas = [];

    for (const elemento of lista) {
        if (!elemento || !esIdValido(elemento.skillId) || !NIVELES.includes(elemento.level)) {
            errores.push({ field: 'skills', message: 'Cada competencia necesita una competencia del catálogo y un nivel válido.' });
            return [];
        }

        if (vistas.includes(elemento.skillId)) {
            errores.push({ field: 'skills', message: 'Hay competencias repetidas en el perfil.' });
            return [];
        }

        vistas.push(elemento.skillId);
    }

    return lista.map((elemento) => ({ skill: elemento.skillId, level: elemento.level }));
}

// Cuerpo de PUT /api/users/:id
export function validarPerfil(cuerpo) {
    const errores = [];

    const nombres = validarNombres(errores, cuerpo);
    const career = validarCarrera(errores, cuerpo.career);
    const description = texto(errores, 'description', cuerpo.description, { nombre: 'la descripción', maximo: 500 });
    const interests = listaDeTextos(errores, 'interests', cuerpo.interests, {
        nombre: 'los intereses', maximo: 10, largoMaximo: 40
    });
    const availability = opcion(errores, 'availability', cuerpo.availability, {
        nombre: 'la disponibilidad', permitidos: DISPONIBILIDADES, obligatorio: false
    });
    const portfolio = texto(errores, 'portfolio', cuerpo.portfolio, {
        nombre: 'el portafolio', maximo: 200,
        patron: /^https?:\/\/\S+$/, mensajePatron: 'El portafolio debe ser un enlace que empiece con http:// o https://.'
    });
    const skills = validarCompetenciasDelPerfil(errores, cuerpo.skills);
    const photo = imagen(errores, 'photo', cuerpo.photo, { nombre: 'la foto', maximoCaracteres: 300000 });

    // El correo no se modifica desde el perfil, se devuelve para que el servicio lo compare
    const email = typeof cuerpo.email === 'string' ? cuerpo.email.trim().toLowerCase() : '';

    if (errores.length > 0) {
        throw errorDeValidacion(errores);
    }

    return { ...nombres, career, description, interests, availability, portfolio, skills, photo, email };
}