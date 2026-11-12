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
// filter descarta una competencia que ya no exista en el catálogo
function aCompetenciasDelUsuario(competencias) {
    return competencias
        .filter((elemento) => elemento.skill)
        .map((elemento) => ({ skill: aCompetencia(elemento.skill), level: elemento.level }));
}

// Perfil de un usuario
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

// Referencia corta a un usuario (sección 4.1)
// ej: propietario de una iniciativa
export function aUsuarioCorto(usuario) {
    return {
        id: String(usuario._id),
        fullName: nombreCompleto(usuario),
        photo: usuario.photo || null
    };
}

// Resumen de una iniciativa (sección 4.5)
// Requiere populate de skills y owner
export function aResumenIniciativa(iniciativa) {
    const memberCount = iniciativa.members.length;

    return {
        id: String(iniciativa._id),
        title: iniciativa.title,
        type: iniciativa.type,
        category: iniciativa.category,
        summary: iniciativa.summary,
        tags: iniciativa.tags,
        visibility: iniciativa.visibility,
        status: iniciativa.status,
        skills: iniciativa.skills.filter(Boolean).map((competencia) => aCompetencia(competencia)),
        owner: aUsuarioCorto(iniciativa.owner),
        memberCount,
        memberLimit: iniciativa.memberLimit,
        availableSlots: Math.max(0, iniciativa.memberLimit - memberCount),
        image: iniciativa.image,
        createdAt: iniciativa.createdAt,
        updatedAt: iniciativa.updatedAt,
        access: 'summary'
    };
}

// Integrante con los datos que muestra el equipo: referencia corta, carrera y competencias
export function aUsuarioDelEquipo(usuario) {
    return {
        ...aUsuarioCorto(usuario),
        career: usuario.career,
        skills: aCompetenciasDelUsuario(usuario.skills)
    };
}

// Miembro del equipo (sección 4.8)
// Requiere populate de members.user
export function aMiembro(miembro, idPropietario) {
    return {
        user: aUsuarioDelEquipo(miembro.user),
        role: miembro.role,
        joinedAt: miembro.joinedAt,
        isOwner: String(miembro.user._id) === idPropietario
    };
}

// Equipo completo, empezando por el propietario
export function aEquipo(miembros, idPropietario) {
    const equipo = miembros
        .filter((miembro) => miembro.user)   // por si una cuenta ya no existe
        .map((miembro) => aMiembro(miembro, idPropietario));

    return [
        ...equipo.filter((miembro) => miembro.isOwner),
        ...equipo.filter((miembro) => !miembro.isOwner)
    ];
}

// Detalle completo de una iniciativa (sección 4.6): el resumen más los textos y el equipo
export function aDetalleIniciativa(iniciativa, idProyecto) {
    return {
        ...aResumenIniciativa(iniciativa),
        description: iniciativa.description,
        problem: iniciativa.problem,
        beneficiaries: iniciativa.beneficiaries,
        members: aEquipo(iniciativa.members, String(iniciativa.owner._id)),
        projectId: idProyecto ? String(idProyecto) : null,
        access: 'full'
    };
}


// Solicitud de participación (sección 4.9)
// Requiere populate de initiative, skill y requester
export function aSolicitud(solicitud) {
    return {
        id: String(solicitud._id),
        status: solicitud.status,
        role: solicitud.role,
        message: solicitud.message,
        availability: solicitud.availability,
        skill: solicitud.skill ? aCompetencia(solicitud.skill) : null,
        initiative: {
            id: String(solicitud.initiative._id),
            title: solicitud.initiative.title,
            ownerId: String(solicitud.initiative.owner)
        },
        requester: aUsuarioDelEquipo(solicitud.requester),
        responseComment: solicitud.responseComment,
        decidedAt: solicitud.decidedAt,
        createdAt: solicitud.createdAt,
        updatedAt: solicitud.updatedAt
    };
}

// Fecha sin hora con el formato "AAAA-MM-DD"
function aFechaSinHora(fecha) {
    return fecha ? fecha.toISOString().slice(0, 10) : null;
}

// El servidor guarda solo propietario y nombre, el enlace se arma al responder
function aRepositorio(repositorio) {
    if (!repositorio) {
        return null;
    }

    return {
        owner: repositorio.owner,
        name: repositorio.name,
        url: `https://github.com/${repositorio.owner}/${repositorio.name}`
    };
}

// Resumen de un proyecto
// Requiere populate de initiative y owner
export function aResumenProyecto(proyecto) {
    const iniciativa = proyecto.initiative;

    return {
        id: String(proyecto._id),
        name: proyecto.name,
        objective: proyecto.objective,
        status: proyecto.status,
        technologies: proyecto.technologies,
        startDate: aFechaSinHora(proyecto.startDate),
        repository: aRepositorio(proyecto.repository),
        initiative: {
            id: String(iniciativa._id),
            title: iniciativa.title,
            category: iniciativa.category,
            visibility: iniciativa.visibility
        },
        owner: aUsuarioCorto(proyecto.owner),
        memberCount: iniciativa.members.length,
        createdAt: proyecto.createdAt
    };
}

// Detalle de un proyecto
// Los integrantes salen del equipo de la iniciativa, no se copian
export function aProyecto(proyecto) {
    return {
        ...aResumenProyecto(proyecto),
        description: proyecto.description,
        estimatedEndDate: aFechaSinHora(proyecto.estimatedEndDate),
        members: aEquipo(proyecto.initiative.members, String(proyecto.owner._id)),
        updatedAt: proyecto.updatedAt
    };
}