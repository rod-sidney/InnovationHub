// Campo.jsx
// Envoltorio de un campo de formulario: etiqueta, el control (llega por children), texto de ayuda, contador y mensaje de error
// Todos los formularios muestran los errores igual

function Campo({ id, etiqueta, obligatorio = false, error, ayuda, contador, children }) {
    return (
        <div className="mb-3">
            <label htmlFor={id} className="form-label fw-semibold">
                {etiqueta}
                {obligatorio && <span className="text-danger" aria-hidden="true"> *</span>}
            </label>

            {children}

            {ayuda && <div id={`${id}-ayuda`} className="form-text">{ayuda}</div>}
            {contador}
            {error && <div id={`${id}-error`} className="invalid-feedback d-block">{error}</div>}
        </div>
    );
}

export default Campo;
