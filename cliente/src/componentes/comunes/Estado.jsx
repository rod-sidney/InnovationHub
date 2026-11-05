// Estado.jsx
// Estado de una iniciativa, una solicitud o un proyecto con su color (_estados.scss)

function Estado({ valor, etiqueta }) {
    return (
        <span className={`estado estado-${valor}`}>
            <span aria-hidden="true">●</span>
            {etiqueta}
        </span>
    );
}

export default Estado;
