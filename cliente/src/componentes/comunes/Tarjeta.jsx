// Tarjeta.jsx
// Contenedor con título para las secciones de las páginas de detalle y perfil
// El contenido llega por children

function Tarjeta({ titulo, children }) {
    return (
        <section className="card border-0 shadow-sm p-4">
            <h2 className="h5 fw-bold text-primary mb-3">{titulo}</h2>
            {children}
        </section>
    );
}

export default Tarjeta;
