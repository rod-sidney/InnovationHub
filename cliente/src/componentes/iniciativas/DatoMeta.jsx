// DatoMeta.jsx
// Caja con un dato corto del detalle (Tipo, Categoría, Estado...)
// valor llega por children

function DatoMeta({ titulo, children }) {
    return (
        <div className="meta-box-flex shadow-sm">
            <div className="meta-title">{titulo}</div>
            <div className="meta-content">{children}</div>
        </div>
    );
}

export default DatoMeta;
