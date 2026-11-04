// autenticacion.js
// Identifica al usuario de cada petición con el encabezado Authorization: Bearer <token>
// Busca la sesión en MongoDB por el hash del token y si es válida, deja al usuario en req.usuario para que los controladores y servicios sepan quién hace la petición.

import Sesion from '../modelos/Sesion.js';
import { ErrorApi } from '../utils/ErrorApi.js';
import { hashDeToken } from '../utils/tokens.js';

// Devuelve la sesión vigente de la petición (con su usuario) o null si no hay una válida
async function buscarSesion(req) {
    const encabezado = req.headers.authorization || '';
    const [esquema, token] = encabezado.split(' ');

    if (esquema !== 'Bearer' || !token) {
        return null;
    }

    // La fecha también se revisa
    // el índice TTL borra las sesiones vencidas, pero puede tardar hasta un minuto
    const sesion = await Sesion.findOne({ tokenHash: hashDeToken(token), expiresAt: { $gt: new Date() } })
        .populate('user');

    if (!sesion || !sesion.user) {
        return null;
    }

    return sesion;
}

// Para las rutas que exigen sesión (columna "Sesión" contrato)
export async function requerirSesion(req, res, next) {
    const sesion = await buscarSesion(req);

    if (!sesion) {
        throw new ErrorApi(401, 'UNAUTHENTICATED', 'Debes iniciar sesión para continuar.');
    }

    // una cuenta inactiva no puede operar
    if (sesion.user.status !== 'active') {
        throw new ErrorApi(403, 'ACCOUNT_INACTIVE', 'La cuenta está inactiva.');
    }

    req.usuario = sesion.user;
    req.sesion = sesion;
    next();
}

// Para las rutas que funcionan con o sin sesión (columna "Opcional")
// si no hay una sesión válida, la petición sigue como visitante (req.usuario = null)
export async function sesionOpcional(req, res, next) {
    const sesion = await buscarSesion(req);
    req.usuario = sesion && sesion.user.status === 'active' ? sesion.user : null;
    next();
}

// Va después de requerirSesion en las rutas que solo puede usar un administrador
export function requerirAdministrador(req, res, next) {
    if (req.usuario.role !== 'admin') {
        throw new ErrorApi(403, 'FORBIDDEN', 'Solo un administrador puede realizar esta operación.');
    }

    next();
}