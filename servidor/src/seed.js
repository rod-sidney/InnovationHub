// seed.js
// Carga los datos de prueba de la carpeta datos-prueba en MongoDB
// Antes vacía las colecciones, deja la base de datos en un estado conocido para probar
// Uso: npm run seed

import { readFile } from 'node:fs/promises';
import bcrypt from 'bcryptjs';

import { conectarBaseDeDatos, desconectarBaseDeDatos } from './config/db.js';
import Competencia from './modelos/Competencia.js';
import Usuario from './modelos/Usuario.js';
import Iniciativa from './modelos/Iniciativa.js';
import Solicitud from './modelos/Solicitud.js';
import Proyecto from './modelos/Proyecto.js';
import Sesion from './modelos/Sesion.js';

// Lee un archivo JSON de la carpeta datos-prueba (la ruta se calcula desde este archivo)
async function leerDatos(nombreArchivo) {
    const ruta = new URL(`../datos-prueba/${nombreArchivo}`, import.meta.url);
    const contenido = await readFile(ruta, 'utf-8');
    return JSON.parse(contenido);
}

async function cargarDatos() {
    await conectarBaseDeDatos();

    const competencias = await leerDatos('competencias.json');
    const usuarios = await leerDatos('usuarios.json');
    const iniciativas = await leerDatos('iniciativas.json');
    const solicitudes = await leerDatos('solicitudes.json');
    const proyectos = await leerDatos('proyectos.json');

    // Las contraseñas de prueba se reemplazan por su hash
    for (const usuario of usuarios) {
        usuario.passwordHash = await bcrypt.hash(usuario.password, 10);
        delete usuario.password;
    }

    // Se vacía cada colección y se crean sus índices (únicos, parcial y TTL) según los esquemas
    const modelos = [Competencia, Usuario, Iniciativa, Solicitud, Proyecto, Sesion];
    for (const modelo of modelos) {
        await modelo.deleteMany({});
        await modelo.syncIndexes();
    }

    // orden, primero lo que otros documentos referencian
    await Competencia.insertMany(competencias);
    await Usuario.insertMany(usuarios);
    await Iniciativa.insertMany(iniciativas);
    await Solicitud.insertMany(solicitudes);
    await Proyecto.insertMany(proyectos);

    console.log(`Datos cargados: ${competencias.length} competencias, ${usuarios.length} usuarios, `
        + `${iniciativas.length} iniciativas, ${solicitudes.length} solicitudes y ${proyectos.length} proyectos.`);
    console.log('Todas las cuentas de prueba usan la contraseña Hub12345.');
}

try {
    await cargarDatos();
} catch (error) {
    console.error('No se pudieron cargar los datos de prueba:', error.message);
    process.exitCode = 1;
} finally {
    await desconectarBaseDeDatos();
}