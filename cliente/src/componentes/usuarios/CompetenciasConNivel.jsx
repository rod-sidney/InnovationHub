// CompetenciasConNivel.jsx
// Competencias del perfil: agregar una competencia del catálogo con su nivel, cambiar el nivel y quitarla
// La lista [{ skillId, level }] vive en el formulario padre

import { useState } from 'react';

import OpcionesCompetencias from '../comunes/OpcionesCompetencias.jsx';
import { NIVELES, opcionesDe } from '../../utils/etiquetas.js';

function CompetenciasConNivel({ catalogo, valores, onCambiar, error }) {
    const [elegida, setElegida] = useState('');
    const [nivel, setNivel] = useState('basic');

    // Un usuario no registra dos veces la misma competencia, se ocultan las que ya tiene
    const disponibles = catalogo.filter((competencia) => !valores.some((elemento) => elemento.skillId === competencia.id));

    function nombreDe(idCompetencia) {
        const competencia = catalogo.find((elemento) => elemento.id === idCompetencia);
        return competencia ? competencia.name : 'Competencia';
    }

    function agregar() {
        if (!elegida) {
            return;
        }
        onCambiar([...valores, { skillId: elegida, level: nivel }]);
        setElegida('');
        setNivel('basic');
    }

    // map devuelve un arreglo nuevo con un objeto nuevo para la competencia que cambió
    function cambiarNivel(idCompetencia, nuevoNivel) {
        onCambiar(valores.map((elemento) => (
            elemento.skillId === idCompetencia ? { ...elemento, level: nuevoNivel } : elemento
        )));
    }

    function quitar(idCompetencia) {
        onCambiar(valores.filter((elemento) => elemento.skillId !== idCompetencia));
    }

    return (
        <div className="mb-3">
            <span className="form-label fw-semibold d-block">Competencias</span>

            <div className="row g-2 align-items-end">
                <div className="col-12 col-md-6">
                    <label htmlFor="nueva-competencia" className="form-label small">Competencia</label>
                    <select id="nueva-competencia" className="form-select" value={elegida} onChange={(evento) => setElegida(evento.target.value)}>
                        <option value="">Elige una competencia</option>
                        <OpcionesCompetencias competencias={disponibles} />
                    </select>
                </div>
                <div className="col-8 col-md-4">
                    <label htmlFor="nuevo-nivel" className="form-label small">Nivel</label>
                    <select id="nuevo-nivel" className="form-select" value={nivel} onChange={(evento) => setNivel(evento.target.value)}>
                        {opcionesDe(NIVELES).map((opcion) => (
                            <option key={opcion.valor} value={opcion.valor}>{opcion.etiqueta}</option>
                        ))}
                    </select>
                </div>
                <div className="col-4 col-md-2">
                    <button type="button" className="btn btn-outline-primary w-100" onClick={agregar} disabled={!elegida}>
                        Agregar
                    </button>
                </div>
            </div>

            {error && <div className="invalid-feedback d-block">{error}</div>}

            {valores.length > 0 && (
                <ul className="list-group mt-3">
                    {valores.map((elemento) => (
                        <li key={elemento.skillId} className="list-group-item d-flex flex-wrap align-items-center gap-2">
                            <span className="flex-grow-1">{nombreDe(elemento.skillId)}</span>
                            <select
                                className="form-select form-select-sm w-auto"
                                aria-label={`Nivel de ${nombreDe(elemento.skillId)}`}
                                value={elemento.level}
                                onChange={(evento) => cambiarNivel(elemento.skillId, evento.target.value)}
                            >
                                {opcionesDe(NIVELES).map((opcion) => (
                                    <option key={opcion.valor} value={opcion.valor}>{opcion.etiqueta}</option>
                                ))}
                            </select>
                            <button
                                type="button"
                                className="btn btn-outline-danger btn-sm"
                                aria-label={`Quitar ${nombreDe(elemento.skillId)}`}
                                onClick={() => quitar(elemento.skillId)}
                            >
                                Quitar
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default CompetenciasConNivel;
