// Encabezado.jsx
// Barra de navegación de todas las páginas
// NavLink agrega la clase "active" al enlace de la página actual
// En pantallas pequeñas el menú se abre y se cierra con estado de React

import { useState } from 'react';
import { Link, NavLink } from 'react-router';

function Encabezado() {
    const [menuAbierto, setMenuAbierto] = useState(false);

    // Al elegir una opción en el teléfono, el menú se cierra
    function cerrarMenu() {
        setMenuAbierto(false);
    }

    return (
        <header>
            <nav className="navbar navbar-expand-lg navbar-dark bg-primary sticky-top shadow-sm" aria-label="Principal">
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
                        <ul className="navbar-nav ms-auto align-items-lg-center gap-lg-1">
                            <li className="nav-item">
                                <NavLink className="nav-link" to="/iniciativas" onClick={cerrarMenu}>
                                    Catálogo de iniciativas
                                </NavLink>
                            </li>
                            <li className="nav-item">
                                <NavLink className="nav-link" to="/proyectos" onClick={cerrarMenu}>
                                    Proyectos
                                </NavLink>
                            </li>
                            <li className="nav-item">
                                <NavLink className="nav-link" to="/iniciar-sesion" onClick={cerrarMenu}>
                                    Iniciar sesión
                                </NavLink>
                            </li>
                            <li className="nav-item">
                                <Link className="btn btn-light btn-sm my-2 my-lg-0" to="/registro" onClick={cerrarMenu}>
                                    Crear cuenta
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
        </header>
    );
}

export default Encabezado;
