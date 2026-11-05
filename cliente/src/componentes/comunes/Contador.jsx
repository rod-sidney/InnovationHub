// Contador.jsx
// Contador de caracteres de un campo de texto
// ejemplo: "120/300"

function Contador({ texto, maximo }) {
    return (
        <div className="form-text text-end" aria-live="polite">
            {texto.length}/{maximo} 
        </div>
    );
}

export default Contador;
