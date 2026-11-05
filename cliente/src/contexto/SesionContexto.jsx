// SesionContexto.jsx
// Estado de la sesión compartido por toda la aplicación con Context de React
// El estado vive en el ancestro común de todas las páginas (main.jsx envuelve la aplicación con ProveedorSesion)
// cualquier componente lo lee con useSesion(), sin pasarlo por props

import { createContext, useContext, useEffect, useState } from 'react';

import { usarToken, alVencerLaSesion } from '../api/cliente.js';
import { pedirRegistro, pedirInicioSesion, pedirCierreSesion, pedirUsuarioActual } from '../api/autenticacion.js';

const SesionContexto = createContext(null);

// Solo el token se guarda en el navegador, para no perder la sesión al recargar la página
const CLAVE_TOKEN = 'innovation-hub-token';

// try/catch: el navegador puede bloquear localStorage (ej: en modo privado)
function leerTokenGuardado() {
    try {
        return localStorage.getItem(CLAVE_TOKEN);
    } catch {
        return null;
    }
}

function guardarToken(token) {
    usarToken(token);
    try {
        localStorage.setItem(CLAVE_TOKEN, token);
    } catch {
        // Sin localStorage la sesión dura hasta recargar la página
    }
}

function olvidarToken() {
    usarToken(null);
    try {
        localStorage.removeItem(CLAVE_TOKEN);
    } catch {
        // No había nada guardado
    }
}

export function ProveedorSesion({ children }) {
    const [usuario, setUsuario] = useState(null);
    // true mientras se pregunta al servidor si el token guardado sigue vigente
    const [comprobando, setComprobando] = useState(true);

    // Al abrir la app, si hay un token guardado, el servidor confirma si sirve
    useEffect(() => {
        const token = leerTokenGuardado();

        if (!token) {
            setComprobando(false);
            return;
        }

        usarToken(token);
        const controlador = new AbortController();

        async function comprobar() {
            try {
                const datos = await pedirUsuarioActual(controlador.signal);
                if (!controlador.signal.aborted) setUsuario(datos);
            } catch {
                // El token venció o ya no existe la sesión: se descarta
                if (!controlador.signal.aborted) olvidarToken();
            } finally {
                if (!controlador.signal.aborted) setComprobando(false);
            }
        }

        comprobar();
        return () => controlador.abort();
    }, []);

    // Si el servidor responde 401 mientras se usa la aplicación, la sesión también se cierra aquí
    useEffect(() => {
        alVencerLaSesion(() => {
            olvidarToken();
            setUsuario(null);
        });

        return () => alVencerLaSesion(null);
    }, []);

    async function iniciarSesion(credenciales) {
        const respuesta = await pedirInicioSesion(credenciales);
        guardarToken(respuesta.token);
        setUsuario(respuesta.user);
        return respuesta.user;
    }

    async function registrarse(datos) {
        const respuesta = await pedirRegistro(datos);
        guardarToken(respuesta.token);
        setUsuario(respuesta.user);
        return respuesta.user;
    }

    async function cerrarSesion() {
        try {
            // El servidor borra la sesión: el token deja de servir aunque alguien lo haya copiado
            await pedirCierreSesion();
        } catch {
            // Aunque la petición falle, en este navegador la sesión se cierra igual
        } finally {
            olvidarToken();
            setUsuario(null);
        }
    }

    const valor = { usuario, comprobando, iniciarSesion, registrarse, cerrarSesion };

    return <SesionContexto.Provider value={valor}>{children}</SesionContexto.Provider>;
}

// Atajo para leer la sesión desde cualquier componente: const { usuario } = useSesion();
export function useSesion() {
    return useContext(SesionContexto);
}
