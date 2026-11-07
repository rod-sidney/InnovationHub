// proyectos.validacion.js
// Validación de la conversión de una iniciativa en proyecto y del listado de proyectos

import { texto, id, fecha, listaDeTextos } from './reglas.js';
import { errorDeValidacion } from '../utils/ErrorApi.js';
import { leerPaginacion } from '../utils/paginacion.js';

// https://github.com/propietario/repositorio (los paréntesis capturan cada parte)
const PATRON_GITHUB = /^https:\/\/github\.com\/([A-Za-z0-9-]+)\/([A-Za-z0-9._-]+)\/?$/;

// se guarda solo lo necesario para identificar el repositorio
function leerRepositorio(errores, valor) {
    if (valor === undefined || valor === null || valor === '') {
        return null;
    }

    const partes = typeof valor === 'string' ? valor.trim().match(PATRON_GITHUB) : null;
    // partes[1] es el propietario y partes[2] el nombre (sin la terminación .git, si la trae)
    const nombre = partes ? partes[2].replace(/\.git$/, '') : '';

    // Sin nombre (ej: "https://github.com/usuario/.git") tampoco es un repositorio
    if (!nombre) {
        errores.push({ field: 'repositoryUrl', message: 'El repositorio debe tener la forma https://github.com/propietario/repositorio.' });
        return null;
    }

    return { owner: partes[1], name: nombre };
}

// Cuerpo de POST /api/projects (RF-I-PRO-01)
export function validarProyecto(cuerpo) {
    const errores = [];

    const initiativeId = id(errores, 'initiativeId', cuerpo.initiativeId, { nombre: 'la iniciativa' });
    const name = texto(errores, 'name', cuerpo.name, { nombre: 'el nombre', obligatorio: true, maximo: 100 });
    const objective = texto(errores, 'objective', cuerpo.objective, { nombre: 'el objetivo', obligatorio: true, maximo: 500 });
    const description = texto(errores, 'description', cuerpo.description, {
        nombre: 'la descripción', obligatorio: true, maximo: 2000
    });
    const technologies = listaDeTextos(errores, 'technologies', cuerpo.technologies, {
        nombre: 'las tecnologías', minimo: 1, maximo: 10, largoMaximo: 40
    });
    const startDate = fecha(errores, 'startDate', cuerpo.startDate, { nombre: 'la fecha de inicio' });
    const estimatedEndDate = fecha(errores, 'estimatedEndDate', cuerpo.estimatedEndDate, {
        nombre: 'la fecha estimada de finalización', obligatorio: false
    });

    // Relación: el final estimado no puede ser antes del inicio
    if (startDate && estimatedEndDate && estimatedEndDate < startDate) {
        errores.push({ field: 'estimatedEndDate', message: 'La fecha estimada de finalización no puede ser anterior a la fecha de inicio.' });
    }

    const repository = leerRepositorio(errores, cuerpo.repositoryUrl);

    if (errores.length > 0) {
        throw errorDeValidacion(errores);
    }

    return { initiativeId, name, objective, description, technologies, startDate, estimatedEndDate, repository };
}

// Parámetros de GET /api/projects
export function validarConsultaProyectos(consulta) {
    const errores = [];

    const paginacion = leerPaginacion(errores, consulta, ['recent', 'oldest']);

    if (errores.length > 0) {
        throw errorDeValidacion(errores);
    }

    return paginacion;
}