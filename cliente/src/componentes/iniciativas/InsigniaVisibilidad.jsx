// InsigniaVisibilidad.jsx
// Nivel de visibilidad de una iniciativa

import { VISIBILIDADES } from '../../utils/etiquetas.js';

function InsigniaVisibilidad({ visibilidad }) {
    const conCandado = visibilidad === 'restricted' || visibilidad === 'private';

    return (
        <span className="badge bg-light text-dark border">
            {conCandado && <span aria-hidden="true">🔒 </span>}
            {VISIBILIDADES[visibilidad]}
        </span>
    );
}

export default InsigniaVisibilidad;
