// representaciones.js
// Convierte los documentos de MongoDB en los objetos que define el contrato de la API
// (sección 4 de docs/api-contract.md)
// Cada objeto se arma campo por campo, evita enviar por accidente un dato interno, como el hash

export function aCompetencia(competencia) {
    return {
        id: String(competencia._id),
        name: competencia.name,
        category: competencia.category
    };
}