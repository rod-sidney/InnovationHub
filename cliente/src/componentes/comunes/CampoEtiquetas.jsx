// CampoEtiquetas.jsx
// Lista de textos cortos como chips
// Sirve para etiquetas, intereses y tecnologías
// la lista vive en el formulario padre (valores y onCambiar)

import { useState } from 'react';

function CampoEtiquetas({ id, etiqueta, valores, onCambiar, maximo, largoMaximo, ayuda, error, obligatorio = false }) {
    // Lo que se está escribiendo todavía no forma parte de la lista
    const [texto, setTexto] = useState('');
    const [aviso, setAviso] = useState('');

    function agregar() {
        // Si se pegó un texto con comas ("React, Node.js"), cada parte es un elemento
        const nuevos = texto.split(',').map((parte) => parte.trim()).filter((parte) => parte !== '');
        let lista = valores;

        for (const nuevo of nuevos) {
            if (nuevo.length > largoMaximo) {
                setAviso(`Cada elemento admite como máximo ${largoMaximo} caracteres.`);
                return;
            }
            if (lista.some((valor) => valor.toLowerCase() === nuevo.toLowerCase())) {
                setAviso(`"${nuevo}" ya está en la lista.`);
                return;
            }
            if (lista.length >= maximo) {
                setAviso(`Se permiten como máximo ${maximo} elementos.`);
                return;
            }
            // Cada vez se crea un arreglo nuevo, el estado nunca se modifica directamente
            lista = [...lista, nuevo];
        }

        onCambiar(lista);
        setTexto('');
        setAviso('');
    }

    function alPresionarTecla(evento) {
        if (evento.key === 'Enter' || evento.key === ',') {
            evento.preventDefault();   // Enter no debe enviar el formulario completo
            agregar();
        }
    }

    function quitar(valorAQuitar) {
        onCambiar(valores.filter((valor) => valor !== valorAQuitar));
    }

    const mensaje = aviso || error;

    return (
        <div className="mb-3">
            <label htmlFor={id} className="form-label fw-semibold">
                {etiqueta}
                {obligatorio && <span className="text-danger" aria-hidden="true"> *</span>}
            </label>

            <div className="input-group">
                <input
                    id={id}
                    type="text"
                    className={`form-control ${mensaje ? 'is-invalid' : ''}`}
                    value={texto}
                    onChange={(evento) => setTexto(evento.target.value)}
                    onKeyDown={alPresionarTecla}
                    aria-describedby={`${id}-ayuda`}
                />
                <button type="button" className="btn btn-outline-primary" onClick={agregar}>Agregar</button>
            </div>

            <div id={`${id}-ayuda`} className="form-text">
                {ayuda} Escribe y presiona Enter o coma. Máximo {maximo}.
            </div>
            {mensaje && <div className="invalid-feedback d-block">{mensaje}</div>}

            {valores.length > 0 && (
                <ul className="list-unstyled d-flex flex-wrap gap-2 mt-2 mb-0">
                    {valores.map((valor) => (
                        <li key={valor} className="badge rounded-pill text-bg-light border d-flex align-items-center gap-2 px-3 py-2">
                            {valor}
                            <button
                                type="button"
                                className="btn-close"
                                style={{ fontSize: '0.6rem' }}
                                aria-label={`Quitar ${valor}`}
                                onClick={() => quitar(valor)}
                            ></button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default CampoEtiquetas;
