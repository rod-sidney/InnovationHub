// SelectorCompetencias.jsx
// Competencias requeridas por una iniciativa
// se elige una del catálogo y se agrega, cada una se puede quitar
// Guarda en el formulario padre solo los identificadores

import { useState } from 'react';

import OpcionesCompetencias from '../comunes/OpcionesCompetencias.jsx';

function SelectorCompetencias({ id, catalogo, seleccionadas, onCambiar, maximo, error }) {
    // La competencia elegida en la lista, antes de presionar "Agregar"
    const [elegida, setElegida] = useState('');

    // En la lista solo aparecen las que todavía no se agregaron, no se pueden repetir
    const disponibles = catalogo.filter((competencia) => !seleccionadas.includes(competencia.id));

    function agregar() {
        if (!elegida || seleccionadas.length >= maximo) {
            return;
        }
        onCambiar([...seleccionadas, elegida]);
        setElegida('');
    }

    function quitar(idCompetencia) {
        onCambiar(seleccionadas.filter((idSeleccionada) => idSeleccionada !== idCompetencia));
    }

    function nombreDe(idCompetencia) {
        const competencia = catalogo.find((elemento) => elemento.id === idCompetencia);
        return competencia ? competencia.name : 'Competencia';
    }

    return (
        <div className="mb-3">
            <label htmlFor={id} className="form-label fw-semibold">
                Competencias requeridas <span className="text-danger" aria-hidden="true">*</span>
            </label>

            <div className="input-group">
                <select
                    id={id}
                    className={`form-select ${error ? 'is-invalid' : ''}`}
                    value={elegida}
                    onChange={(evento) => setElegida(evento.target.value)}
                    aria-describedby={`${id}-ayuda`}
                >
                    <option value="">Elige una competencia del catálogo</option>
                    <OpcionesCompetencias competencias={disponibles} />
                </select>
                <button type="button" className="btn btn-outline-primary" onClick={agregar} disabled={!elegida}>
                    Agregar
                </button>
            </div>

            <div id={`${id}-ayuda`} className="form-text">Al menos una y como máximo {maximo}.</div>
            {error && <div className="invalid-feedback d-block">{error}</div>}

            {seleccionadas.length > 0 && (
                <ul className="list-unstyled d-flex flex-wrap gap-2 mt-2 mb-0">
                    {seleccionadas.map((idCompetencia) => (
                        <li key={idCompetencia} className="badge rounded-pill text-bg-secondary d-flex align-items-center gap-2 px-3 py-2">
                            {nombreDe(idCompetencia)}
                            <button
                                type="button"
                                className="btn-close"
                                style={{ fontSize: '0.6rem' }}
                                aria-label={`Quitar ${nombreDe(idCompetencia)}`}
                                onClick={() => quitar(idCompetencia)}
                            ></button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default SelectorCompetencias;
