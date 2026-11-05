// SinResultados.jsx
// Estado de resultado vacío: la API respondió bien, pero no hay datos que mostrar
// children permite agregar una acción, por ejemplo un botón para limpiar los filtros

function SinResultados({ mensaje, children }) {
    return (
        <div className="alert alert-warning text-center" role="status">
            <p className="mb-0">{mensaje}</p>
            {children}
        </div>
    );
}

export default SinResultados;
