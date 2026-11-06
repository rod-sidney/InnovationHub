// Aviso.jsx
// Mensaje de éxito que una página deja al navegar a otra
// ejemplo después de guardar: navegar('/iniciativas/123', { state: { aviso: 'La iniciativa se publicó.' } })
// La página de destino solo tiene que dibujar <Aviso />

import { useState } from 'react';
import { useLocation } from 'react-router';

function Aviso() {
    const ubicacion = useLocation();
    const mensaje = ubicacion.state?.aviso;
    // Cada navegación tiene una key distinta, recuerda en cuál se cerró el aviso
    const [cerradoEn, setCerradoEn] = useState(null);

    if (!mensaje || cerradoEn === ubicacion.key) {
        return null;
    }

    return (
        <div className="alert alert-success alert-dismissible" role="status">
            {mensaje}
            <button type="button" className="btn-close" aria-label="Cerrar aviso" onClick={() => setCerradoEn(ubicacion.key)}></button>
        </div>
    );
}

export default Aviso;
