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

// "Carla Montero Ruiz": nombre y apellidos, sin espacios de más si falta el segundo apellido
export function nombreCompleto(usuario) {
    return [usuario.firstName, usuario.lastName, usuario.secondLastName].filter(Boolean).join(' ');
}

// Competencias del perfil con el nombre del catálogo (requiere populate('skills.skill'))
// filter descarta una competencia que ya no exista en el catálogo.
function aCompetenciasDelUsuario(competencias) {
    return competencias
        .filter((elemento) => elemento.skill)
        .map((elemento) => ({ skill: aCompetencia(elemento.skill), level: elemento.level }));
}

// Perfil de un usuario (sección 4.2)
// El correo solo se incluye cuando el perfil es de quien hace la petición
// El hash de la contraseña no se incluye
export function aUsuario(usuario, incluirCorreo = false) {
    const perfil = {
        id: String(usuario._id),
        firstName: usuario.firstName,
        lastName: usuario.lastName,
        secondLastName: usuario.secondLastName,
        fullName: nombreCompleto(usuario),
        memberType: usuario.memberType,
        role: usuario.role,
        career: usuario.career,
        description: usuario.description,
        skills: aCompetenciasDelUsuario(usuario.skills),
        interests: usuario.interests,
        availability: usuario.availability,
        portfolio: usuario.portfolio,
        photo: usuario.photo,
        status: usuario.status,
        createdAt: usuario.createdAt,
        updatedAt: usuario.updatedAt
    };

    if (incluirCorreo) {
        perfil.email = usuario.email;
    }

    return perfil;
}