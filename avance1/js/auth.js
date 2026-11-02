// Propósito: autenticación (iniciar sesión, registrarse, cerrar sesión) y reglas de permisos
// Los usuarios de prueba vienen de datos/usuarios.json. Las cuentas nuevas se guardan en localStorage

import { rutaBase, fechaDeHoy } from './api.js';

const CLAVE_SESION = 'sesion';
const CLAVE_USUARIOS_NUEVOS = 'usuarios_registrados';
// Cambios a cualquier cuenta guardados por id: { "3": { "foto": "..." } }
const CLAVE_CAMBIOS_USUARIOS = 'usuarios_modificados';

export async function cargarUsuarios() {
    const respuesta = await fetch(`${rutaBase()}datos/usuarios.json`);

    if (!respuesta.ok) {
        throw new Error("No se pudo leer el archivo de usuarios");
    }

    const usuariosBase = await respuesta.json();
    const usuariosNuevos = JSON.parse(localStorage.getItem(CLAVE_USUARIOS_NUEVOS)) || [];
    const cambios = JSON.parse(localStorage.getItem(CLAVE_CAMBIOS_USUARIOS)) || {};

    // A cada usuario se le aplican sus cambios guardados, si tiene
    return [...usuariosBase, ...usuariosNuevos].map(u => ({ ...u, ...cambios[u.id] }));
}

// La sesión guarda los datos del usuario sin la contraseña. Tampoco guarda la foto
function guardarSesion(usuario) {
    const datosSesion = { ...usuario };
    delete datosSesion.contrasena;
    delete datosSesion.foto;
    localStorage.setItem(CLAVE_SESION, JSON.stringify(datosSesion));
}

// Devuelve el usuario con sesión iniciada o null si no hay sesión
export function obtenerUsuarioActual() {
    return JSON.parse(localStorage.getItem(CLAVE_SESION));
}

export async function iniciarSesion(correo, contrasena) {
    const usuarios = await cargarUsuarios();
    const usuario = usuarios.find(u => u.correo.toLowerCase() === correo.trim().toLowerCase());

    // Si el correo no existe o la contraseña no coincide se devuelve null los dos
    if (!usuario || usuario.contrasena !== contrasena) {
        return null;
    }

    guardarSesion(usuario);
    return obtenerUsuarioActual();
}

export function cerrarSesion() {
    localStorage.removeItem(CLAVE_SESION);
}

// Devuelve null si el correo ya pertenece a otra cuenta
export async function registrarUsuario(datos) {
    const usuarios = await cargarUsuarios();

    if (usuarios.some(u => u.correo.toLowerCase() === datos.correo.toLowerCase())) {
        return null;
    }

    const nuevoUsuario = {
        id: Math.max(...usuarios.map(u => u.id)) + 1,
        ...datos,
        descripcion: '',
        competencias: [],
        intereses: [],
        disponibilidad: '',
        portafolio: '',
        // Va después de ...datos para que nadie pueda volverse administrador al registrarse
        rol: 'usuario',
        fecha_registro: fechaDeHoy(),
        estado: 'Activa'
    };

    const usuariosNuevos = JSON.parse(localStorage.getItem(CLAVE_USUARIOS_NUEVOS)) || [];
    usuariosNuevos.push(nuevoUsuario);
    localStorage.setItem(CLAVE_USUARIOS_NUEVOS, JSON.stringify(usuariosNuevos));

    guardarSesion(nuevoUsuario);
    return obtenerUsuarioActual();
}

// Datos actuales de un usuario para su perfil, sin la contraseña
export async function obtenerPerfil(id) {
    const usuarios = await cargarUsuarios();
    const usuario = usuarios.find(u => u.id === id);
    if (!usuario) return null;

    const perfil = { ...usuario };
    delete perfil.contrasena;
    return perfil;
}

// Las cuentas de usuarios.json no se pueden modificar desde el navegador,
// los cambios se guardan aparte y cargarUsuarios los aplica encima
export function actualizarUsuario(id, datosNuevos) {
    const cambios = JSON.parse(localStorage.getItem(CLAVE_CAMBIOS_USUARIOS)) || {};
    cambios[id] = { ...cambios[id], ...datosNuevos };
    localStorage.setItem(CLAVE_CAMBIOS_USUARIOS, JSON.stringify(cambios));
}

export function esAdministrador(usuario) {
    return Boolean(usuario) && usuario.rol === 'administrador';
}

// Nombre que se guarda como propietario y en el equipo de una iniciativa
export function nombreCorto(usuario) {
    return `${usuario.nombre} ${usuario.primer_apellido}`;
}

export function nombreCompleto(usuario) {
    return `${usuario.nombre} ${usuario.primer_apellido} ${usuario.segundo_apellido || ''}`.trim();
}

// ----- Permisos -----

// Solo el propietario modifica o elimina su iniciativa
export function esPropietario(iniciativa, usuario) {
    if (!usuario) return false;
    return iniciativa.propietario_id === usuario.id;
}

export function esMiembro(iniciativa, usuario) {
    if (!usuario) return false;
    const miembros = iniciativa.miembros_actuales || [];
    return miembros.some(m => m.usuario_id === usuario.id);
}

// Una iniciativa privada no aparece en el catálogo y solo la consultan su propietario y su equipo
export function puedeVerIniciativa(iniciativa, usuario) {
    if (iniciativa.nivel_visibilidad !== 'Privada') return true;
    return esPropietario(iniciativa, usuario) || esMiembro(iniciativa, usuario);
}

// el usuario puede ver la descripción completa o solo el resumen
export function tieneAccesoCompleto(iniciativa, usuario) {
    if (iniciativa.nivel_visibilidad === 'Pública') return true;

    // Institucional
    if (iniciativa.nivel_visibilidad === 'Institucional') return Boolean(usuario);

    // Restringida y Privada
    return esPropietario(iniciativa, usuario) || esMiembro(iniciativa, usuario);
}
