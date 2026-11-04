// autenticacion.servicio.js
// Registro e inicio de sesión
// Las contraseñas se guardan con bcrypt, un hash lento y con sal
// aunque lea la base de datos, no puede saber la contraseña original

import bcrypt from 'bcryptjs';

import Usuario from '../modelos/Usuario.js';
import Sesion from '../modelos/Sesion.js';
import { config } from '../config/env.js';
import { ErrorApi } from '../utils/ErrorApi.js';
import { generarToken, hashDeToken } from '../utils/tokens.js';
import { aUsuario } from '../utils/representaciones.js';

// Rondas de bcrypt: cada ronda más duplica
const RONDAS_BCRYPT = 10;

// Crea la sesión en MongoDB y devuelve el token para el cliente
// En la base queda su hash
async function crearSesion(idUsuario) {
    const token = generarToken();
    const expiresAt = new Date(Date.now() + config.horasSesion * 60 * 60 * 1000);

    await Sesion.create({ tokenHash: hashDeToken(token), user: idUsuario, expiresAt });

    return token;
}

export async function registrarUsuario(datos) {
    // unique correo
    const existe = await Usuario.exists({ email: datos.email });
    if (existe) {
        throw new ErrorApi(409, 'EMAIL_TAKEN', 'El correo ya pertenece a otra cuenta.');
    }

    const passwordHash = await bcrypt.hash(datos.password, RONDAS_BCRYPT);

    let usuario;
    try {
        usuario = await Usuario.create({
            firstName: datos.firstName,
            lastName: datos.lastName,
            secondLastName: datos.secondLastName,
            email: datos.email,
            passwordHash,
            memberType: datos.memberType,
            career: datos.career,
            photo: datos.photo,
            role: 'user',        // nadie puede registrarse como administrador
            status: 'active'
        });
    } catch (error) {
        // Si dos registros con el mismo correo llegan a la vez, el índice único detiene el segundo
        if (error.code === 11000) {
            throw new ErrorApi(409, 'EMAIL_TAKEN', 'El correo ya pertenece a otra cuenta.');
        }
        throw error;
    }

    const token = await crearSesion(usuario._id);
    return { token, user: aUsuario(usuario, true) };
}

export async function autenticarUsuario({ email, password }) {
    // '+passwordHash' pide el campo que el modelo oculta por defecto (select: false)
    const usuario = await Usuario.findOne({ email }).select('+passwordHash').populate('skills.skill');

    // bcrypt.compare calcula el hash de la contraseña recibida con la sal guardada y los compara
    const coincide = usuario ? await bcrypt.compare(password, usuario.passwordHash) : false;

    // El mismo mensaje si falla el correo o la contraseña, no se revela qué cuentas existen
    if (!coincide) {
        throw new ErrorApi(401, 'INVALID_CREDENTIALS', 'El correo o la contraseña no son correctos.');
    }

    // solo las cuentas activas pueden usar la plataforma
    if (usuario.status !== 'active') {
        throw new ErrorApi(403, 'ACCOUNT_INACTIVE', 'La cuenta está inactiva.');
    }

    const token = await crearSesion(usuario._id);
    return { token, user: aUsuario(usuario, true) };
}