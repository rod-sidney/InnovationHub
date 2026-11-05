// NoEncontrada.jsx
// Se muestra cuando la dirección no coincide con ninguna ruta (ruta "*" en App.jsx)

import { Link } from 'react-router';

function NoEncontrada() {
    return (
        <section className="container py-5 text-center">
            <p className="display-1 fw-bold text-primary mb-0">404</p>
            <h1 className="h3 fw-bold mb-3">Página no encontrada</h1>
            <p className="text-muted mb-4">La dirección que escribiste no existe en Innovation Hub.</p>
            <Link to="/" className="btn btn-primary">Volver al inicio</Link>
        </section>
    );
}

export default NoEncontrada;
