// PestanasSolicitudes.jsx
// Pestañas para pasar entre las solicitudes enviadas y las recibidas
// NavLink marca la pestaña de la página actual con la clase "active" (estilo de Bootstrap)

import { NavLink } from 'react-router';

function PestanasSolicitudes() {
    return (
        <ul className="nav nav-tabs mb-4">
            <li className="nav-item">
                {/* end: "/solicitudes" no debe quedar activa en "/solicitudes/recibidas" */}
                <NavLink to="/solicitudes" end className="nav-link">Mis solicitudes</NavLink>
            </li>
            <li className="nav-item">
                <NavLink to="/solicitudes/recibidas" className="nav-link">Solicitudes recibidas</NavLink>
            </li>
        </ul>
    );
}

export default PestanasSolicitudes;
