// Paginacion.jsx
// Botones de paginación
// No guarda estado propio: recibe la página actual y el total, y avisa al componente padre qué página se eligió (onCambiar)

function Paginacion({ pagina, totalPaginas, onCambiar }) {
    if (totalPaginas <= 1) {
        return null;
    }

    // [1, 2, ..., totalPaginas]
    const numeros = Array.from({ length: totalPaginas }, (_, posicion) => posicion + 1);

    return (
        <nav aria-label="Paginación de resultados" className="mt-4">
            <ul className="pagination justify-content-center flex-wrap">
                <li className={`page-item ${pagina === 1 ? 'disabled' : ''}`}>
                    <button type="button" className="page-link" disabled={pagina === 1} onClick={() => onCambiar(pagina - 1)}>
                        Anterior
                    </button>
                </li>

                {numeros.map((numero) => (
                    <li key={numero} className={`page-item ${numero === pagina ? 'active' : ''}`}>
                        <button
                            type="button"
                            className="page-link"
                            aria-current={numero === pagina ? 'page' : undefined}
                            onClick={() => onCambiar(numero)}
                        >
                            {numero}
                        </button>
                    </li>
                ))}

                <li className={`page-item ${pagina === totalPaginas ? 'disabled' : ''}`}>
                    <button
                        type="button"
                        className="page-link"
                        disabled={pagina === totalPaginas}
                        onClick={() => onCambiar(pagina + 1)}
                    >
                        Siguiente
                    </button>
                </li>
            </ul>
        </nav>
    );
}

export default Paginacion;
