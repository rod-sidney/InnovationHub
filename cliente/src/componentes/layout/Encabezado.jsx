// Encabezado.jsx
// Barra de navegación de todas las páginas
// NavLink agrega la clase "active" al enlace de la página actual. en pantallas pequeñas el menú se abre y se cierra con estado de React
// Con sesión muestra "Hola, Nombre" (lleva al perfil) y "Cerrar sesión"
// sin sesión, "Iniciar sesión" y "Crear cuenta"
// el menú se despliega desde navbar-expand-xl, antes se usa el botón de menú.

import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router';

import { useSesion } from '../../contexto/SesionContexto.jsx';

function Encabezado() {
    const { usuario, cerrarSesion } = useSesion();
    const navegar = useNavigate();
    const [menuAbierto, setMenuAbierto] = useState(false);

    // Al elegir una opción en el teléfono, el menú se cierra
    function cerrarMenu() {
        setMenuAbierto(false);
    }

    async function salir() {
        cerrarMenu();
        await cerrarSesion();
        navegar('/');
    }

    return (
        <header>
            <nav className="navbar navbar-expand-xl navbar-dark bg-primary sticky-top shadow-sm" aria-label="Principal">
                <div className="container">
                    <Link className="navbar-brand fw-bold" to="/" onClick={cerrarMenu}>
                        Innovation Hub
                    </Link>

                    <button
                        className="navbar-toggler"
                        type="button"
                        aria-controls="menuPrincipal"
                        aria-expanded={menuAbierto}
                        aria-label="Alternar navegación"
                        onClick={() => setMenuAbierto((abierto) => !abierto)}
                    >
                        <span className="navbar-toggler-icon"></span>
                    </button>

                    <div className={`collapse navbar-collapse ${menuAbierto ? 'show' : ''}`} id="menuPrincipal">
                        <ul className="navbar-nav ms-auto align-items-xl-center gap-xl-1">
                            <li className="nav-item">
                                {/* end: solo se marca en /iniciativas, no en /iniciativas/nueva */}
                                <NavLink className="nav-link text-nowrap" to="/iniciativas" end onClick={cerrarMenu}>
                                    Catálogo de iniciativas
                                </NavLink>
                            </li>
                            <li className="nav-item">
                                <NavLink className="nav-link text-nowrap" to="/proyectos" onClick={cerrarMenu}>
                                    Proyectos
                                </NavLink>
                            </li>

                            {usuario ? (
                                <>
                                    <li className="nav-item">
                                        <NavLink className="nav-link text-nowrap" to="/usuarios" onClick={cerrarMenu}>
                                            Usuarios
                                        </NavLink>
                                    </li>
                                    <li className="nav-item">
                                        <NavLink className="nav-link text-nowrap" to="/solicitudes" onClick={cerrarMenu}>
                                            Solicitudes
                                        </NavLink>
                                    </li>
                                    <li className="nav-item">
                                        <NavLink className="nav-link text-nowrap" to="/iniciativas/nueva" onClick={cerrarMenu}>
                                            Publicar iniciativa
                                        </NavLink>
                                    </li>
                                    <li className="nav-item d-flex align-items-center gap-2">
                                        <NavLink className="nav-link text-nowrap" to="/perfil" onClick={cerrarMenu}>
                                            Hola, {usuario.firstName}
                                        </NavLink>
                                        {usuario.role === 'admin' && <span className="badge text-bg-light">Administrador</span>}
                                    </li>
                                    <li className="nav-item">
                                        <button type="button" className="btn btn-outline-light btn-sm my-2 my-xl-0" onClick={salir}>
                                            Cerrar sesión
                                        </button>
                                    </li>
                                </>
                            ) : (
                                <>
                                    <li className="nav-item">
                                        <NavLink className="nav-link text-nowrap" to="/iniciar-sesion" onClick={cerrarMenu}>
                                            Iniciar sesión
                                        </NavLink>
                                    </li>
                                    <li className="nav-item">
                                        <Link className="btn btn-light btn-sm my-2 my-xl-0" to="/registro" onClick={cerrarMenu}>
                                            Crear cuenta
                                        </Link>
                                    </li>
                                </>
                            )}
                        </ul>
                    </div>
                </div>
            </nav>
        </header>
    );
}

export default Encabezado;
