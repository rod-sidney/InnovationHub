// OpcionesCompetencias.jsx
// Opciones de un <select> con el catálogo de competencias agrupado por categoría (<optgroup>)
// Se usa en los filtros y en los formularios

function OpcionesCompetencias({ competencias }) {
    // { "Diseño": [competencia, competencia], "Negocios": [...] }
    const grupos = {};

    for (const competencia of competencias) {
        if (!grupos[competencia.category]) {
            grupos[competencia.category] = [];
        }
        grupos[competencia.category].push(competencia);
    }

    return Object.entries(grupos).map(([categoria, lista]) => (
        <optgroup key={categoria} label={categoria}>
            {lista.map((competencia) => (
                <option key={competencia.id} value={competencia.id}>{competencia.name}</option>
            ))}
        </optgroup>
    ));
}

export default OpcionesCompetencias;
