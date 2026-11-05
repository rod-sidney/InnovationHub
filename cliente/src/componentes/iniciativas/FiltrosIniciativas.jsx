// FiltrosIniciativas.jsx
// Formulario de filtros del catálogo
// no guarda estado propio: los valores vienen del padre (Catalogo) y cada cambio se le avisa con una función

import OpcionesCompetencias from '../comunes/OpcionesCompetencias.jsx';
import { TIPOS, CATEGORIAS, opcionesDe } from '../../utils/etiquetas.js';

function FiltrosIniciativas({ valores, textoBusqueda, competencias, onCambiarTexto, onCambiarFiltro, onLimpiar }) {
    return (
        <form
            className="card border-0 shadow-sm p-3 p-md-4 mb-4"
            role="search"
            aria-label="Filtrar iniciativas"
            onSubmit={(evento) => evento.preventDefault()}
        >
            <div className="row g-3 align-items-end">
                <div className="col-12 col-lg-6">
                    <label htmlFor="filtro-texto" className="form-label fw-semibold">Buscar</label>
                    <input
                        id="filtro-texto"
                        type="search"
                        className="form-control"
                        placeholder="Título, resumen o etiqueta"
                        maxLength={100}
                        value={textoBusqueda}
                        onChange={(evento) => onCambiarTexto(evento.target.value)}
                    />
                </div>

                <div className="col-6 col-lg-3">
                    <label htmlFor="filtro-tipo" className="form-label fw-semibold">Tipo</label>
                    <select
                        id="filtro-tipo"
                        className="form-select"
                        value={valores.type}
                        onChange={(evento) => onCambiarFiltro('type', evento.target.value)}
                    >
                        <option value="">Todos</option>
                        {opcionesDe(TIPOS).map((opcion) => (
                            <option key={opcion.valor} value={opcion.valor}>{opcion.etiqueta}</option>
                        ))}
                    </select>
                </div>

                <div className="col-6 col-lg-3">
                    <label htmlFor="filtro-categoria" className="form-label fw-semibold">Categoría</label>
                    <select
                        id="filtro-categoria"
                        className="form-select"
                        value={valores.category}
                        onChange={(evento) => onCambiarFiltro('category', evento.target.value)}
                    >
                        <option value="">Todas</option>
                        {opcionesDe(CATEGORIAS).map((opcion) => (
                            <option key={opcion.valor} value={opcion.valor}>{opcion.etiqueta}</option>
                        ))}
                    </select>
                </div>

                <div className="col-12 col-md-6 col-lg-4">
                    <label htmlFor="filtro-competencia" className="form-label fw-semibold">Competencia requerida</label>
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

                <div className="col-12 col-md-6 col-lg-3">
                    <label htmlFor="filtro-orden" className="form-label fw-semibold">Ordenar por</label>
                    <select
                        id="filtro-orden"
                        className="form-select"
                        value={valores.sort}
                        onChange={(evento) => onCambiarFiltro('sort', evento.target.value)}
                    >
                        <option value="recent">Más recientes</option>
                        <option value="oldest">Más antiguas</option>
                        <option value="title">Título (A-Z)</option>
                    </select>
                </div>

                <div className="col-12 col-md-6 col-lg-3">
                    <div className="form-check mb-2">
                        <input
                            id="filtro-espacios"
                            type="checkbox"
                            className="form-check-input"
                            checked={valores.available}
                            onChange={(evento) => onCambiarFiltro('available', evento.target.checked)}
                        />
                        <label htmlFor="filtro-espacios" className="form-check-label">Solo con espacios disponibles</label>
                    </div>
                </div>

                <div className="col-12 col-md-6 col-lg-2 text-lg-end">
                    <button type="button" className="btn btn-outline-primary w-100" onClick={onLimpiar}>
                        Limpiar filtros
                    </button>
                </div>
            </div>
        </form>
    );
}

export default FiltrosIniciativas;
