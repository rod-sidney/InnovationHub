// FiltrosUsuarios.jsx
// Filtros de la búsqueda de usuarios: nombre, competencia, carrera, disponibilidad, tipo de miembro y orden
// Formulario controlado sin estado propio

import OpcionesCompetencias from '../comunes/OpcionesCompetencias.jsx';
import { DISPONIBILIDADES, TIPOS_MIEMBRO, opcionesDe } from '../../utils/etiquetas.js';

function FiltrosUsuarios({ valores, textos, competencias, onCambiarTexto, onCambiarFiltro, onLimpiar }) {
    return (
        <form
            className="card border-0 shadow-sm p-3 p-md-4 mb-4"
            role="search"
            aria-label="Filtrar usuarios"
            onSubmit={(evento) => evento.preventDefault()}
        >
            <div className="row g-3 align-items-end">
                <div className="col-12 col-md-6 col-lg-4">
                    <label htmlFor="filtro-nombre" className="form-label fw-semibold">Nombre</label>
                    <input
                        id="filtro-nombre"
                        type="search"
                        className="form-control"
                        maxLength={60}
                        value={textos.q}
                        onChange={(evento) => onCambiarTexto('q', evento.target.value)}
                    />
                </div>
                <div className="col-12 col-md-6 col-lg-4">
                    <label htmlFor="filtro-carrera" className="form-label fw-semibold">Carrera o área</label>
                    <input
                        id="filtro-carrera"
                        type="search"
                        className="form-control"
                        maxLength={80}
                        value={textos.career}
                        onChange={(evento) => onCambiarTexto('career', evento.target.value)}
                    />
                </div>
                <div className="col-12 col-md-6 col-lg-4">
                    <label htmlFor="filtro-competencia" className="form-label fw-semibold">Competencia</label>
                    <select
                        id="filtro-competencia"
                        className="form-select"
                        value={valores.skill}
                        onChange={(evento) => onCambiarFiltro('skill', evento.target.value)}
                    >
                        <option value="">Todas</option>
                        <OpcionesCompetencias competencias={competencias} />
                    </select>
                </div>
                <div className="col-6 col-lg-3">
                    <label htmlFor="filtro-disponibilidad" className="form-label fw-semibold">Disponibilidad</label>
                    <select
                        id="filtro-disponibilidad"
                        className="form-select"
                        value={valores.availability}
                        onChange={(evento) => onCambiarFiltro('availability', evento.target.value)}
                    >
                        <option value="">Cualquiera</option>
                        {opcionesDe(DISPONIBILIDADES).map((opcion) => (
                            <option key={opcion.valor} value={opcion.valor}>{opcion.etiqueta}</option>
                        ))}
                    </select>
                </div>
                <div className="col-6 col-lg-3">
                    <label htmlFor="filtro-tipo" className="form-label fw-semibold">Tipo de miembro</label>
                    <select
                        id="filtro-tipo"
                        className="form-select"
                        value={valores.memberType}
                        onChange={(evento) => onCambiarFiltro('memberType', evento.target.value)}
                    >
                        <option value="">Todos</option>
                        {opcionesDe(TIPOS_MIEMBRO).map((opcion) => (
                            <option key={opcion.valor} value={opcion.valor}>{opcion.etiqueta}</option>
                        ))}
                    </select>
                </div>
                <div className="col-6 col-lg-3">
                    <label htmlFor="filtro-orden" className="form-label fw-semibold">Ordenar por</label>
                    <select
                        id="filtro-orden"
                        className="form-select"
                        value={valores.sort}
                        onChange={(evento) => onCambiarFiltro('sort', evento.target.value)}
                    >
                        <option value="name">Nombre (A-Z)</option>
                        <option value="recent">Registro más reciente</option>
                    </select>
                </div>
                <div className="col-6 col-lg-3">
                    <button type="button" className="btn btn-outline-primary w-100" onClick={onLimpiar}>
                        Limpiar filtros
                    </button>
                </div>
            </div>
        </form>
    );
}

export default FiltrosUsuarios;
