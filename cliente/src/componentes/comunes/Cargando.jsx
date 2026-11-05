// Cargando.jsx
// Estado de carga se muestra mientras se espera la respuesta del API

function Cargando({ texto = 'Cargando...' }) {
    return (
        <div className="text-center py-5" role="status">
            <div className="spinner-border text-primary" aria-hidden="true"></div>
            <p className="mt-2 text-muted mb-0">{texto}</p>
        </div>
    );
}

export default Cargando;
