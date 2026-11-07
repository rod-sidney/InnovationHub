# Contrato de la API — Innovation Hub

Este documento define la API REST que usa el cliente React. El contrato queda **congelado** desde el
Avance 2: en la entrega final, el servidor de .NET debe responder exactamente igual (rutas, verbos,
formato de peticiones y respuestas, y códigos de estado), y el cliente no debe cambiar más allá de la
variable de entorno con la dirección del servidor.

## 1. Convenciones generales

### 1.1 Dirección base y formato

- Todas las rutas empiezan con `/api`. En desarrollo, la dirección completa es
  `http://localhost:3000/api` (el cliente la lee de la variable `VITE_API_URL`).
- Las peticiones con cuerpo envían JSON con el encabezado `Content-Type: application/json`.
- Todas las respuestas con contenido son JSON en UTF-8. Las respuestas `204` no tienen cuerpo.
- Los nombres de rutas, parámetros y campos están en inglés y en `camelCase`. Los textos para
  personas (mensajes de error) están en español.
- El tamaño máximo de un cuerpo es 1 MB.

### 1.2 Identificadores

- Todo recurso tiene un campo `id` de tipo **cadena de texto opaca**. El cliente no debe suponer su
  formato (en MongoDB son 24 caracteres hexadecimales; en la entrega final pueden ser otro tipo de
  identificador).
- Un identificador en la ruta que no corresponde a ningún recurso, incluso si su formato no es válido,
  responde `404`.
- Un identificador dentro del cuerpo que no es válido o no existe responde `400` (es un dato inválido
  de la petición).
- En los parámetros de consulta, un identificador con formato inválido responde `400`; si tiene un
  formato válido pero no corresponde a ningún recurso, el filtro no encuentra resultados y la
  respuesta es una página vacía. La excepción es `initiative` en `GET /api/requests/received`, que se
  verifica porque además decide el permiso (`400` si no existe y `403` si la iniciativa no es del
  usuario).

### 1.3 Fechas

- Las fechas con hora (`createdAt`, `updatedAt`, `joinedAt`, `decidedAt`) se envían en formato
  ISO 8601 en UTC, por ejemplo `"2026-10-15T14:30:00.000Z"`.
- Las fechas sin hora (`startDate`, `estimatedEndDate`) usan el formato `"AAAA-MM-DD"`.

### 1.4 Autenticación

- `POST /api/auth/register` y `POST /api/auth/login` devuelven un `token` (cadena opaca).
- Las rutas protegidas exigen el encabezado `Authorization: Bearer <token>`.
- Un token vence cuando pasa el tiempo de sesión configurado en el servidor (8 horas por defecto) o
  cuando se cierra la sesión (`POST /api/auth/logout`); desde ese momento el servidor lo rechaza.
- Columna **Acceso** en las tablas de este documento:
  - **Público**: no requiere token.
  - **Opcional**: funciona sin token; con un token válido, la respuesta incluye lo que ese usuario
    puede ver. Un token vencido o inválido en una ruta opcional se trata como si no se hubiera enviado.
  - **Sesión**: requiere un token válido; sin él responde `401`.
  - **Admin**: requiere un token válido de un usuario con `role: "admin"`; si no lo es, `403`.

### 1.5 Paginación, filtros y orden

Los listados que pueden crecer se paginan en el servidor. Reciben estos parámetros de consulta:

| Parámetro | Valor | Por defecto |
|---|---|---|
| `page` | Entero mayor o igual que 1 | `1` |
| `size` | Entero entre 1 y 50 | `10` |
| `sort` | Uno de los valores que indica cada listado | El indicado en cada listado |

Y responden siempre con este sobre:

```json
{
  "data": [],
  "page": 1,
  "size": 10,
  "total": 0,
  "totalPages": 0
}
```

`total` es la cantidad de resultados que cumplen los filtros (en todas las páginas) y `totalPages` es
`ceil(total / size)`. Pedir una página mayor que `totalPages` devuelve `data` vacío, no un error. Un
parámetro con un valor no permitido (por ejemplo, `size=500` o `type=otro`) responde `400`.

### 1.6 Formato uniforme de errores

Toda respuesta de error (`4xx` y `5xx`) tiene esta forma:

```json
{
  "error": {
    "status": 400,
    "code": "VALIDATION_ERROR",
    "message": "Los datos enviados no son válidos.",
    "details": [
      { "field": "title", "message": "El título es obligatorio." }
    ]
  }
}
```

- `status` repite el código HTTP.
- `code` es un identificador estable en mayúsculas que el cliente puede usar para decidir qué hacer.
- `message` es un texto en español para mostrar a la persona.
- `details` es una lista con un elemento por campo inválido. Solo tiene elementos en los errores de
  validación; en los demás es una lista vacía.
- Los errores nunca incluyen trazas de pila, mensajes internos de la base de datos, hashes, secretos ni
  cadenas de conexión.

### 1.7 Códigos de estado

| Código | Uso |
|---|---|
| `200 OK` | Consulta o modificación correcta con contenido en la respuesta |
| `201 Created` | Recurso creado; la respuesta contiene el recurso nuevo |
| `204 No Content` | Operación correcta sin contenido (cerrar sesión, eliminar, retirar un miembro) |
| `400 Bad Request` | Datos inválidos en el cuerpo o en los parámetros, o JSON mal formado |
| `401 Unauthorized` | Falta el token, es inválido o venció; o las credenciales son incorrectas |
| `403 Forbidden` | El usuario está identificado, pero no tiene permiso para la operación o para ver el recurso |
| `404 Not Found` | El recurso o la ruta no existen |
| `409 Conflict` | La operación choca con el estado actual de los datos (una regla de negocio lo impide) |
| `500 Internal Server Error` | Error inesperado del servidor; el mensaje es genérico |

Si una petición tiene varios problemas, el servidor responde el primero que encuentra, en este orden:
`401` (sesión), `400` (formato de los datos de la petición), `404` (recurso), `403` (permiso) y `409`
(reglas de negocio). Las validaciones que necesitan consultar la base de datos (por ejemplo, que una
competencia exista en el catálogo) también responden `400`, pero después de comprobar el recurso y los
permisos.

Valores de `code` que puede devolver la API:

| `code` | Estado | Significado |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Uno o más campos o parámetros no son válidos (ver `details`) |
| `INVALID_JSON` | 400 | El cuerpo no es JSON válido |
| `PAYLOAD_TOO_LARGE` | 400 | El cuerpo supera 1 MB |
| `UNAUTHENTICATED` | 401 | Falta el token, es inválido o venció |
| `INVALID_CREDENTIALS` | 401 | Correo o contraseña incorrectos |
| `FORBIDDEN` | 403 | No tiene permiso para esta operación o este recurso |
| `ACCOUNT_INACTIVE` | 403 | La cuenta está inactiva |
| `OWN_INITIATIVE` | 403 | El propietario no puede solicitar participación en su propia iniciativa |
| `NOT_FOUND` | 404 | El recurso no existe |
| `ROUTE_NOT_FOUND` | 404 | La ruta o el verbo no existen en la API |
| `EMAIL_TAKEN` | 409 | El correo ya pertenece a otra cuenta |
| `SKILL_EXISTS` | 409 | Ya existe una competencia con ese nombre |
| `INITIATIVE_ARCHIVED` | 409 | La iniciativa está archivada y no admite cambios |
| `ALREADY_ARCHIVED` | 409 | La iniciativa ya estaba archivada |
| `MEMBER_LIMIT_TOO_LOW` | 409 | El límite de integrantes es menor que los miembros actuales |
| `ALREADY_MEMBER` | 409 | El usuario ya forma parte del equipo |
| `PENDING_REQUEST_EXISTS` | 409 | Ya existe una solicitud pendiente del usuario para esa iniciativa |
| `TEAM_FULL` | 409 | El equipo no tiene espacios disponibles |
| `REQUEST_NOT_PENDING` | 409 | La solicitud ya no está pendiente |
| `OWNER_CANNOT_LEAVE` | 409 | El propietario no puede retirarse del equipo |
| `NOT_ENOUGH_MEMBERS` | 409 | La iniciativa no tiene miembros además del propietario |
| `PROJECT_ALREADY_EXISTS` | 409 | La iniciativa ya generó un proyecto |
| `INTERNAL_ERROR` | 500 | Error inesperado |

### 1.8 CORS

El servidor solo acepta peticiones del navegador que vengan del origen configurado para el cliente
(variable `CLIENT_ORIGIN`, por ejemplo `http://localhost:5173`), con los verbos `GET`, `POST`, `PUT`,
`PATCH` y `DELETE` y los encabezados `Content-Type` y `Authorization`.

## 2. Valores controlados

| Campo | Valores (etiqueta en la interfaz) |
|---|---|
| Iniciativa `type` | `idea` (Idea), `need` (Necesidad), `challenge` (Reto) |
| Iniciativa `category` | `technology` (Tecnología), `education` (Educación), `sustainability` (Sostenibilidad), `social_impact` (Impacto social), `business` (Negocios y emprendimiento), `health` (Salud y bienestar), `culture` (Cultura y creatividad), `other` (Otro) |
| Iniciativa `visibility` | `public` (Pública), `institutional` (Institucional), `restricted` (Restringida), `private` (Privada) |
| Iniciativa `status` | `draft` (Borrador, reservado), `published` (Publicada), `team_building` (En formación de equipo), `converted` (Convertida en proyecto), `archived` (Archivada) |
| Solicitud `status` | `pending` (Pendiente), `accepted` (Aceptada), `rejected` (Rechazada), `cancelled` (Cancelada) |
| Proyecto `status` | `planning` (Planificación), `in_progress` (En desarrollo), `paused` (Pausado), `finished` (Finalizado), `archived` (Archivado) |
| Usuario `memberType` | `student` (Estudiante), `teacher` (Docente), `staff` (Administrativo) |
| Usuario `role` | `user` (Usuario), `admin` (Administrador) |
| `availability` | `low` (Menos de 5 horas semanales), `medium` (5 a 10 horas semanales), `high` (Más de 10 horas semanales) |
| Competencia del usuario `level` | `basic` (Básico), `intermediate` (Intermedio), `advanced` (Avanzado) |

Cambios automáticos del estado de una iniciativa:

- Al crearse queda en `published`.
- Pasa a `team_building` cuando se acepta la primera solicitud (el equipo empieza a formarse) y vuelve
  a `published` si se retiran todos los miembros además del propietario.
- Pasa a `converted` cuando se convierte en proyecto.
- Pasa a `archived` cuando el propietario la elimina y tiene información relacionada.

## 3. Visibilidad de las iniciativas

| Visibilidad | Sin sesión | Con sesión, sin ser del equipo | Propietario o miembro |
|---|---|---|---|
| `public` | Completa | Completa | Completa |
| `institutional` | No la ve (`401`) | Completa | Completa |
| `restricted` | No la ve (`401`) | Solo el resumen (`access: "summary"`) | Completa |
| `private` | No la ve (`401`) | No la ve (`403`) | Completa |

- Un visitante sin sesión solo consulta información pública.
- En los listados aparecen las iniciativas que el usuario puede ver, completas o en resumen. Las
  privadas solo aparecen para su propietario y sus miembros.
- El resumen incluye todo excepto `description`, `problem`, `beneficiaries` y `members`.
- Las mismas reglas se aplican al proyecto que generó la iniciativa: un proyecto solo se consulta si
  el usuario tiene acceso completo a su iniciativa de origen.

## 4. Representaciones

Estas son las formas de los objetos que devuelve la API. Las secciones de cada ruta indican cuál usa.

### 4.1 `UserRef` (referencia corta a un usuario)

```json
{ "id": "650000000000000000000001", "fullName": "Carla Montero Ruiz", "photo": null }
```

### 4.2 `User` (perfil)

```json
{
  "id": "650000000000000000000001",
  "firstName": "Carla",
  "lastName": "Montero",
  "secondLastName": "Ruiz",
  "fullName": "Carla Montero Ruiz",
  "memberType": "student",
  "role": "user",
  "career": "Desarrollo de Software",
  "description": "Me gusta unir la programación con proyectos ambientales.",
  "skills": [
    { "skill": { "id": "660000000000000000000002", "name": "React", "category": "Desarrollo de software" }, "level": "advanced" }
  ],
  "interests": ["Sostenibilidad", "Automatización"],
  "availability": "medium",
  "portfolio": "https://example.com/portafolio/cmontero",
  "photo": "data:image/jpeg;base64,...",
  "status": "active",
  "createdAt": "2026-08-01T12:00:00.000Z",
  "updatedAt": "2026-10-20T16:45:00.000Z"
}
```

Cuando el perfil es del mismo usuario que hace la petición (`GET /api/auth/me`, login, registro y
`GET`/`PUT` del propio perfil), incluye además `"email"`. Ninguna respuesta incluye la contraseña ni su
hash.

### 4.3 `Skill` (competencia del catálogo)

```json
{ "id": "660000000000000000000002", "name": "React", "category": "Desarrollo de software" }
```

### 4.4 `Page<T>`

El sobre de la sección 1.5, donde `data` es una lista de objetos `T`.

### 4.5 `InitiativeSummary` (resumen de una iniciativa)

Es la forma de cada elemento del catálogo y del detalle cuando el usuario solo tiene acceso al
resumen.

```json
{
  "id": "670000000000000000000001",
  "title": "Mapa interactivo de espacios de estudio colaborativo",
  "type": "idea",
  "category": "technology",
  "summary": "Aplicación de mapas que muestra la disponibilidad de aulas libres.",
  "tags": ["Mapas", "Campus"],
  "visibility": "public",
  "status": "team_building",
  "skills": [{ "id": "660000000000000000000021", "name": "Geolocalización", "category": "Datos e inteligencia artificial" }],
  "owner": { "id": "650000000000000000000002", "fullName": "Valeria Morales Jiménez", "photo": null },
  "memberCount": 2,
  "memberLimit": 4,
  "availableSlots": 2,
  "image": "https://picsum.photos/id/11/800/450",
  "createdAt": "2026-08-07T15:00:00.000Z",
  "updatedAt": "2026-08-07T15:00:00.000Z",
  "access": "summary"
}
```

`memberCount` cuenta al propietario. `availableSlots` es `memberLimit - memberCount` (nunca negativo).

### 4.6 `InitiativeDetail` (detalle completo)

Es un `InitiativeSummary` con `"access": "full"` y estos campos adicionales:

```json
{
  "description": "Texto largo de la iniciativa...",
  "problem": "Los estudiantes pierden tiempo buscando un aula libre.",
  "beneficiaries": "Estudiantes de todas las sedes",
  "members": [
    {
      "user": {
        "id": "650000000000000000000002",
        "fullName": "Valeria Morales Jiménez",
        "photo": null,
        "career": "Diseño de Experiencia de Usuario",
        "skills": [{ "skill": { "id": "660000000000000000000016", "name": "UI/UX", "category": "Diseño" }, "level": "advanced" }]
      },
      "role": "Propietaria",
      "joinedAt": "2026-08-07T15:00:00.000Z",
      "isOwner": true
    }
  ],
  "projectId": null
}
```

`members` contiene el equipo actual, empezando por el propietario. `projectId` es el identificador del
proyecto que generó la iniciativa, o `null`.

### 4.7 `InitiativeView` (respuesta de `GET /api/initiatives/{id}`)

Es un `InitiativeDetail` (o un `InitiativeSummary` si el acceso es de resumen) con el campo `viewer`,
que describe la relación del usuario que consulta con la iniciativa:

```json
{
  "viewer": { "isOwner": false, "isMember": false, "pendingRequestId": "680000000000000000000003" }
}
```

`pendingRequestId` es el identificador de la solicitud pendiente del usuario para esta iniciativa, o
`null`. Sin sesión, los tres valores son `false`, `false` y `null`.

### 4.8 `Member` (integrante del equipo)

El mismo objeto que cada elemento de `members` en la sección 4.6.

### 4.9 `Request` (solicitud de participación)

```json
{
  "id": "680000000000000000000001",
  "status": "pending",
  "role": "Desarrollo del frontend",
  "message": "Tengo experiencia con React y me interesa el proyecto.",
  "availability": "medium",
  "skill": { "id": "660000000000000000000002", "name": "React", "category": "Desarrollo de software" },
  "initiative": { "id": "670000000000000000000001", "title": "Mapa interactivo de espacios de estudio colaborativo", "ownerId": "650000000000000000000002" },
  "requester": {
    "id": "650000000000000000000004",
    "fullName": "Sofía Vargas Castro",
    "photo": null,
    "career": "Desarrollo Web",
    "skills": [{ "skill": { "id": "660000000000000000000002", "name": "React", "category": "Desarrollo de software" }, "level": "intermediate" }]
  },
  "responseComment": null,
  "decidedAt": null,
  "createdAt": "2026-10-20T14:00:00.000Z",
  "updatedAt": "2026-10-20T14:00:00.000Z"
}
```

### 4.10 `ProjectSummary` y `Project`

`ProjectSummary` (elementos del listado de proyectos):

```json
{
  "id": "690000000000000000000001",
  "name": "Huerta urbana inteligente",
  "objective": "Automatizar el riego de la huerta del campus.",
  "status": "planning",
  "technologies": ["Arduino", "Node.js"],
  "startDate": "2026-10-01",
  "repository": { "owner": "expressjs", "name": "express", "url": "https://github.com/expressjs/express" },
  "initiative": { "id": "670000000000000000000004", "title": "Huerta urbana con sensores", "category": "sustainability", "visibility": "public" },
  "owner": { "id": "650000000000000000000001", "fullName": "Carla Montero Ruiz", "photo": null },
  "memberCount": 3,
  "createdAt": "2026-10-01T13:00:00.000Z"
}
```

`Project` (detalle) es un `ProjectSummary` con estos campos adicionales:

```json
{
  "description": "Descripción completa del proyecto...",
  "estimatedEndDate": "2027-03-01",
  "members": [ "...lista de Member (sección 4.8), tomada del equipo de la iniciativa..." ],
  "updatedAt": "2026-10-01T13:00:00.000Z"
}
```

`repository` es `null` cuando el proyecto no tiene repositorio asociado. El servidor solo guarda el
propietario y el nombre del repositorio; la información de GitHub la consulta el cliente.

## 5. Rutas

### 5.1 Salud

| Verbo y ruta | Acceso | Respuesta |
|---|---|---|
| `GET /api/health` | Público | `200` `{ "status": "ok" }` |

### 5.2 Autenticación

#### `POST /api/auth/register` — Registrar usuario

Acceso: Público.

```json
{
  "firstName": "Ana",
  "lastName": "Rojas",
  "secondLastName": "Mora",
  "email": "arojas@ucenfotec.ac.cr",
  "password": "Clave1234",
  "passwordConfirmation": "Clave1234",
  "memberType": "student",
  "career": "Desarrollo de Software",
  "acceptTerms": true,
  "photo": null
}
```

| Campo | Regla |
|---|---|
| `firstName`, `lastName` | Obligatorios, 2 a 40 caracteres, solo letras, espacios, apóstrofos o guiones |
| `secondLastName` | Opcional, mismas reglas |
| `email` | Obligatorio, formato de correo, máximo 100 caracteres, único (sin distinguir mayúsculas) |
| `password` | Obligatoria, 8 a 64 caracteres, con al menos una letra y un número |
| `passwordConfirmation` | Obligatoria, igual a `password` |
| `memberType` | Obligatorio, un valor de la sección 2 |
| `career` | Obligatoria, 3 a 80 caracteres |
| `acceptTerms` | Obligatorio, debe ser `true` |
| `photo` | Opcional: `null`, enlace `https://` de hasta 500 caracteres o imagen en data URL (`data:image/jpeg`, `png`, `webp` o `gif`) de hasta 300 000 caracteres |

La cuenta se crea con `role: "user"` y `status: "active"`; el cuerpo no puede elegir el rol.

Respuesta `201`:

```json
{ "token": "9f2c...e81a", "user": { "...": "User con email" } }
```

Errores: `400 VALIDATION_ERROR`, `409 EMAIL_TAKEN`.

#### `POST /api/auth/login` — Iniciar sesión

Acceso: Público. Cuerpo: `{ "email": "cmontero@ucenfotec.ac.cr", "password": "Hub12345" }`.

Respuesta `200`: `{ "token": "...", "user": User con email }`.

Errores: `400 VALIDATION_ERROR` (falta un campo o el correo no tiene formato válido),
`401 INVALID_CREDENTIALS` (el mensaje no indica si falló el correo o la contraseña),
`403 ACCOUNT_INACTIVE`.

#### `POST /api/auth/logout` — Cerrar sesión

Acceso: Sesión. Sin cuerpo. Respuesta `204`. El token deja de ser válido de inmediato.

Errores: `401 UNAUTHENTICATED`.

#### `GET /api/auth/me` — Usuario de la sesión

Acceso: Sesión. Respuesta `200`: `User` con `email`. El cliente la usa para comprobar si el token
guardado sigue vigente.

Errores: `401 UNAUTHENTICATED`.

### 5.3 Usuarios

#### `GET /api/users` — Buscar y filtrar usuarios

Acceso: Sesión. Solo lista cuentas activas.

| Parámetro | Descripción |
|---|---|
| `q` | Texto que se busca en el nombre y los apellidos (sin distinguir mayúsculas) |
| `skill` | Identificador de una competencia del catálogo |
| `career` | Texto que se busca en la carrera o área |
| `availability` | `low`, `medium` o `high` |
| `memberType` | `student`, `teacher` o `staff` |
| `sort` | `name` (nombre A-Z, por defecto) o `recent` (registro más reciente primero) |
| `page`, `size` | Paginación (sección 1.5) |

Respuesta `200`: `Page<User>` (sin `email`).

Errores: `400 VALIDATION_ERROR`, `401 UNAUTHENTICATED`.

#### `GET /api/users/{id}` — Consultar perfil

Acceso: Sesión. Respuesta `200`: `User` (con `email` solo si es el propio perfil).

Errores: `401 UNAUTHENTICATED`, `404 NOT_FOUND`.

#### `PUT /api/users/{id}` — Modificar el propio perfil

Acceso: Sesión, y solo el dueño del perfil.

```json
{
  "firstName": "Carla",
  "lastName": "Montero",
  "secondLastName": "Ruiz",
  "career": "Desarrollo de Software",
  "description": "Texto libre.",
  "interests": ["Sostenibilidad"],
  "availability": "medium",
  "portfolio": "https://example.com/portafolio/cmontero",
  "skills": [{ "skillId": "660000000000000000000002", "level": "advanced" }],
  "photo": "data:image/jpeg;base64,..."
}
```

| Campo | Regla |
|---|---|
| `firstName`, `lastName`, `secondLastName` | Mismas reglas que en el registro |
| `career` | Obligatoria, 3 a 80 caracteres |
| `description` | Opcional, máximo 500 caracteres |
| `interests` | Lista de hasta 10 textos de 1 a 40 caracteres, sin repetidos |
| `availability` | `null` o un valor de la sección 2 |
| `portfolio` | Vacío o un enlace `http://` o `https://` de hasta 200 caracteres |
| `skills` | Lista de hasta 15 elementos `{ skillId, level }`; cada `skillId` existe en el catálogo y no se repite; `level` es un valor de la sección 2 |
| `photo` | `null` (sin foto), enlace `https://` de hasta 500 caracteres o imagen en data URL de hasta 300 000 caracteres |

Es un reemplazo completo de los campos editables. `email`, `role`, `memberType`, `status` y la
contraseña no se modifican aquí: si el cuerpo trae `email` con un valor distinto al actual, responde
`400`; los demás se ignoran.

Respuesta `200`: `User` con `email`.

Errores: `400 VALIDATION_ERROR`, `401 UNAUTHENTICATED`, `403 FORBIDDEN` (perfil de otra persona),
`404 NOT_FOUND`.

### 5.4 Competencias (catálogo)

#### `GET /api/skills` — Listar el catálogo

Acceso: Público. Parámetros opcionales: `q` (texto en el nombre) y `category` (texto exacto de la
categoría). Respuesta `200`: lista de `Skill` ordenada por categoría y nombre.

El catálogo no se pagina porque es corto (decenas de elementos) y el cliente lo necesita completo para
llenar las listas desplegables.

Errores: `400 VALIDATION_ERROR` (parámetros demasiado largos).

#### `GET /api/skills/{id}` — Consultar una competencia

Acceso: Público. Respuesta `200`: `Skill`. Errores: `404 NOT_FOUND`.

#### `POST /api/skills` — Agregar una competencia al catálogo

Acceso: Admin. Cuerpo: `{ "name": "Rust", "category": "Desarrollo de software" }` (ambos obligatorios,
de 1 a 60 caracteres).

Respuesta `201`: `Skill`.

Errores: `400 VALIDATION_ERROR`, `401 UNAUTHENTICATED`, `403 FORBIDDEN` (no es administrador),
`409 SKILL_EXISTS`.

### 5.5 Iniciativas

#### `GET /api/initiatives` — Catálogo con búsqueda, filtros, orden y paginación

Acceso: Opcional. Solo devuelve las iniciativas que el usuario puede ver (sección 3).

| Parámetro | Descripción |
|---|---|
| `q` | Texto que se busca en el título, el resumen y las etiquetas |
| `type` | `idea`, `need` o `challenge` |
| `category` | Un valor de la sección 2 |
| `skill` | Identificador de una competencia requerida |
| `status` | Un estado de iniciativa. Sin este parámetro se excluyen las archivadas |
| `visibility` | Una visibilidad (dentro de las que el usuario puede ver) |
| `available` | `true` para mostrar solo iniciativas con espacios disponibles |
| `owner` | Identificador del propietario |
| `member` | Identificador de un usuario que forma parte del equipo |
| `sort` | `recent` (más recientes primero, por defecto), `oldest` o `title` (A-Z) |
| `page`, `size` | Paginación (sección 1.5) |

Respuesta `200`: `Page<InitiativeSummary>`. El listado nunca incluye la descripción, el problema ni
los miembros.

Errores: `400 VALIDATION_ERROR`.

#### `GET /api/initiatives/{id}` — Detalle

Acceso: Opcional. Respuesta `200`: `InitiativeView` (sección 4.7) con `access: "full"` o
`access: "summary"` según la sección 3.

Errores: `401 UNAUTHENTICATED` (iniciativa no pública consultada sin sesión), `403 FORBIDDEN`
(iniciativa privada de un equipo al que no pertenece), `404 NOT_FOUND`.

#### `POST /api/initiatives` — Registrar iniciativa

Acceso: Sesión. El propietario es siempre el usuario de la sesión (RN-02); el cuerpo no puede elegirlo.

```json
{
  "title": "Mapa interactivo de espacios de estudio colaborativo",
  "type": "idea",
  "category": "technology",
  "summary": "Aplicación de mapas que muestra la disponibilidad de aulas libres.",
  "description": "Texto largo...",
  "problem": "Los estudiantes pierden tiempo buscando un aula libre.",
  "beneficiaries": "Estudiantes de todas las sedes",
  "tags": ["Mapas", "Campus"],
  "visibility": "public",
  "skills": ["660000000000000000000021"],
  "memberLimit": 4,
  "image": null
}
```

| Campo | Regla |
|---|---|
| `title` | Obligatorio, máximo 100 caracteres |
| `type`, `category`, `visibility` | Obligatorios, un valor de la sección 2 |
| `summary` | Obligatorio, máximo 300 caracteres |
| `description` | Obligatoria, máximo 3000 caracteres |
| `problem` | Opcional, máximo 1000 caracteres |
| `beneficiaries` | Opcional, máximo 150 caracteres |
| `tags` | Lista de hasta 8 textos de 1 a 30 caracteres, sin repetidos (sin distinguir mayúsculas) |
| `skills` | Lista de 1 a 10 identificadores del catálogo, sin repetidos |
| `memberLimit` | Obligatorio, entero de 1 a 20 |
| `image` | `null`, enlace `https://` de hasta 500 caracteres o imagen en data URL de hasta 700 000 caracteres |

El servidor genera `id`, `owner`, `status: "published"`, `members` (el propietario, con el rol
"Propietario") y las fechas.

Respuesta `201`: `InitiativeDetail`.

Errores: `400 VALIDATION_ERROR`, `401 UNAUTHENTICATED`.

#### `PUT /api/initiatives/{id}` — Modificar iniciativa

Acceso: Sesión, y solo el propietario (RN-06). Mismo cuerpo y mismas reglas que al registrar. Se
conservan `id`, `owner`, `members` y `createdAt`; se actualiza `updatedAt`.

Respuesta `200`: `InitiativeDetail`.

Errores: `400 VALIDATION_ERROR`, `401 UNAUTHENTICATED`, `403 FORBIDDEN`, `404 NOT_FOUND`,
`409 INITIATIVE_ARCHIVED` (no se modifica una iniciativa archivada),
`409 MEMBER_LIMIT_TOO_LOW` (el límite no puede quedar por debajo de los miembros actuales).

#### `DELETE /api/initiatives/{id}` — Eliminar o archivar

Acceso: Sesión, y solo el propietario (RN-07).

- Si la iniciativa **no** tiene solicitudes, miembros además del propietario (actuales o retirados) ni
  proyecto, se elimina (RN-08). Respuesta `204`.
- Si tiene información relacionada, se archiva en lugar de eliminarse (RN-09): `status` pasa a
  `archived`. Respuesta `200`:

```json
{ "result": "archived", "initiative": { "...": "InitiativeDetail" } }
```

Errores: `401 UNAUTHENTICATED`, `403 FORBIDDEN`, `404 NOT_FOUND`, `409 ALREADY_ARCHIVED`.

### 5.6 Equipo

#### `GET /api/initiatives/{id}/members` — Consultar el equipo

Acceso: Opcional; requiere acceso completo a la iniciativa (sección 3). Parámetros opcionales: `skill`
(identificador de competencia) y `role` (texto en el rol).

Respuesta `200`: lista de `Member`, empezando por el propietario.

Errores: `400 VALIDATION_ERROR`, `401 UNAUTHENTICATED`, `403 FORBIDDEN`, `404 NOT_FOUND`.

#### `DELETE /api/initiatives/{id}/members/{userId}` — Retirar a un miembro

Acceso: Sesión, y solo el propietario. Cuerpo opcional: `{ "reason": "Texto de hasta 300 caracteres" }`.
El miembro pasa al historial de retiros con la fecha y el motivo.

Respuesta `204`.

Errores: `400 VALIDATION_ERROR`, `401 UNAUTHENTICATED`, `403 FORBIDDEN`,
`404 NOT_FOUND` (la iniciativa no existe o el usuario no es miembro), `409 INITIATIVE_ARCHIVED`,
`409 OWNER_CANNOT_LEAVE`.

### 5.7 Solicitudes de participación

#### `POST /api/requests` — Registrar solicitud

Acceso: Sesión.

```json
{
  "initiativeId": "670000000000000000000001",
  "role": "Desarrollo del frontend",
  "skillId": "660000000000000000000002",
  "availability": "medium",
  "message": "Tengo experiencia con React y me interesa el proyecto."
}
```

| Campo | Regla |
|---|---|
| `initiativeId` | Obligatorio, iniciativa existente |
| `role` | Obligatorio, máximo 60 caracteres |
| `skillId` | Obligatorio, una de las competencias que requiere la iniciativa |
| `availability` | Obligatoria, un valor de la sección 2 |
| `message` | Opcional, máximo 500 caracteres |

Respuesta `201`: `Request` con `status: "pending"`.

Errores: `400 VALIDATION_ERROR` (incluye una iniciativa inexistente o una competencia
que la iniciativa no requiere), `401 UNAUTHENTICATED`, `403 FORBIDDEN` (iniciativa que el usuario no
puede ver), `403 OWN_INITIATIVE` (RN-10), `409 INITIATIVE_ARCHIVED`, `409 ALREADY_MEMBER` (RN-15),
`409 PENDING_REQUEST_EXISTS` (RN-11), `409 TEAM_FULL`.

#### `GET /api/requests/sent` — Mis solicitudes

Acceso: Sesión. Parámetros: `status`, `initiative` (identificador), `sort` (`recent` por defecto u
`oldest`), `page`, `size`.

Respuesta `200`: `Page<Request>` con las solicitudes del usuario de la sesión.

Errores: `400 VALIDATION_ERROR`, `401 UNAUTHENTICATED`.

#### `GET /api/requests/received` — Solicitudes recibidas

Acceso: Sesión. Lista las solicitudes de las iniciativas de las que el usuario es propietario.

| Parámetro | Descripción |
|---|---|
| `initiative` | Identificador de una iniciativa propia |
| `status` | Un estado de solicitud |
| `skill` | Identificador de la competencia ofrecida |
| `role` | Texto que se busca en el rol solicitado |
| `sort` | `recent` (por defecto) u `oldest` |
| `page`, `size` | Paginación |

Respuesta `200`: `Page<Request>`.

Errores: `400 VALIDATION_ERROR`, `401 UNAUTHENTICATED`, `403 FORBIDDEN` (`initiative` de otra persona).

#### `GET /api/requests/{id}` — Consultar una solicitud

Acceso: Sesión; solo el solicitante o el propietario de la iniciativa. Respuesta `200`: `Request`.

Errores: `401 UNAUTHENTICATED`, `403 FORBIDDEN`, `404 NOT_FOUND`.

#### `PUT /api/requests/{id}` — Modificar una solicitud pendiente

Acceso: Sesión; solo el solicitante. Cuerpo: `role`, `skillId`, `availability` y `message`, con las
mismas reglas que al registrar. No se modifican la iniciativa, el solicitante ni la fecha original.

Respuesta `200`: `Request`.

Errores: `400 VALIDATION_ERROR`, `401 UNAUTHENTICATED`, `403 FORBIDDEN`, `404 NOT_FOUND`,
`409 REQUEST_NOT_PENDING` (RN-12).

#### `PATCH /api/requests/{id}/status` — Cancelar, aceptar o rechazar

Acceso: Sesión. Cuerpo: `{ "status": "accepted", "comment": "¡Bienvenida al equipo!" }`. El comentario
es opcional (máximo 300 caracteres) y solo se guarda al aceptar o rechazar.

| `status` | Quién puede | Efecto |
|---|---|---|
| `cancelled` | Solo el solicitante | La solicitud queda cancelada y se conserva (RN-13) |
| `accepted` | Solo el propietario de la iniciativa | La solicitud queda aceptada y el solicitante entra al equipo con el rol solicitado y la fecha de incorporación (RN-14) |
| `rejected` | Solo el propietario de la iniciativa | La solicitud queda rechazada; nadie entra al equipo |

Solo se resuelven solicitudes pendientes. Respuesta `200`: `Request` actualizado.

Errores: `400 VALIDATION_ERROR` (estado no permitido), `401 UNAUTHENTICATED`, `403 FORBIDDEN`,
`404 NOT_FOUND`, `409 REQUEST_NOT_PENDING`, `409 INITIATIVE_ARCHIVED`, `409 ALREADY_MEMBER` (RN-15),
`409 TEAM_FULL`.

### 5.8 Proyectos

#### `POST /api/projects` — Convertir una iniciativa en proyecto

Acceso: Sesión; solo el propietario de la iniciativa.

```json
{
  "initiativeId": "670000000000000000000004",
  "name": "Huerta urbana inteligente",
  "objective": "Automatizar el riego de la huerta del campus.",
  "description": "Texto largo...",
  "technologies": ["Arduino", "Node.js"],
  "startDate": "2026-11-02",
  "estimatedEndDate": "2027-03-01",
  "repositoryUrl": "https://github.com/expressjs/express"
}
```

| Campo | Regla |
|---|---|
| `initiativeId` | Obligatorio, iniciativa existente |
| `name` | Obligatorio, máximo 100 caracteres |
| `objective` | Obligatorio, máximo 500 caracteres |
| `description` | Obligatoria, máximo 2000 caracteres |
| `technologies` | Lista de 1 a 10 textos de 1 a 40 caracteres, sin repetidos |
| `startDate` | Obligatoria, fecha `AAAA-MM-DD` válida |
| `estimatedEndDate` | Opcional (`null`), fecha válida igual o posterior a `startDate` |
| `repositoryUrl` | Opcional (`null`), dirección `https://github.com/propietario/repositorio` |

El servidor obtiene la iniciativa de origen, el propietario y los integrantes; el estado inicial es
`planning` y la iniciativa pasa a `converted`.

Respuesta `201`: `Project`.

Errores: `400 VALIDATION_ERROR` (incluye una iniciativa inexistente), `401 UNAUTHENTICATED`,
`403 FORBIDDEN` (no es el propietario), `409 INITIATIVE_ARCHIVED`,
`409 NOT_ENOUGH_MEMBERS` (RN-17: se necesita al menos un miembro además del propietario),
`409 PROJECT_ALREADY_EXISTS` (RN-18).

#### `GET /api/projects` — Listar los proyectos accesibles

Acceso: Opcional. Devuelve los proyectos cuya iniciativa de origen el usuario puede ver completa
(sección 3). Parámetros: `sort` (`recent` por defecto u `oldest`), `page`, `size`.

Respuesta `200`: `Page<ProjectSummary>`.

Errores: `400 VALIDATION_ERROR`.

#### `GET /api/projects/{id}` — Consultar proyecto

Acceso: Opcional, con las reglas de visibilidad de la iniciativa de origen. Respuesta `200`: `Project`.

Errores: `401 UNAUTHENTICATED`, `403 FORBIDDEN`, `404 NOT_FOUND`.

### 5.9 Rutas reservadas para la entrega final

Estas rutas forman parte del contrato congelado, pero se implementan en la entrega final:

| Verbo y ruta | Descripción |
|---|---|
| `GET /api/projects?status=&category=&skill=&technology=&owner=&q=` | Búsqueda (`q` en nombre, objetivo y descripción) y filtros de proyectos, además de `sort`, `page` y `size` |
| `PUT /api/projects/{id}` | Modificar un proyecto (solo el propietario; no cambia la iniciativa de origen). `200` `Project` |
| `DELETE /api/projects/{id}` | Archivar un proyecto: `status` pasa a `archived`, nunca se borra. `200` `Project` |
| `PATCH /api/initiatives/{id}/members/{userId}` | Cambiar el rol de un integrante: `{ "role": "..." }`. `200` `Member` |
| `DELETE /api/users/{id}` | Desactivar la propia cuenta: `status` pasa a `inactive` y se conserva el historial. `204` |

Mientras no estén implementadas, el servidor del Avance 2 responde `404 ROUTE_NOT_FOUND` a los
verbos nuevos, y `GET /api/projects` ignora los filtros que todavía no aplica.

## 6. Reglas de negocio que verifica el servidor

La numeración es la del documento general del proyecto; la segunda columna indica cómo las nombra la
consigna del Avance 2.

| Regla (documento general) | Consigna Avance 2 | Dónde se verifica | Respuesta si se incumple |
|---|---|---|---|
| RN-01 Correo único | — | `POST /api/auth/register` | `409 EMAIL_TAKEN` |
| RN-02 Un único propietario | RN-01 | `POST /api/initiatives` toma el propietario de la sesión | (no se puede elegir) |
| RN-03 Propietario registrado y activo | RN-01 | Toda ruta con sesión rechaza cuentas inactivas | `403 ACCOUNT_INACTIVE` |
| RN-04 Tipo idea, necesidad o reto | — | Validación de `type` | `400 VALIDATION_ERROR` |
| RN-05 Exactamente una visibilidad | RN-03 | Validación de `visibility` | `400 VALIDATION_ERROR` |
| RN-06 Solo el propietario modifica | RN-04 | `PUT /api/initiatives/{id}` | `403 FORBIDDEN` |
| RN-07 Solo el propietario elimina o archiva | RN-04 | `DELETE /api/initiatives/{id}` | `403 FORBIDDEN` |
| RN-08 Sin información relacionada se elimina | RN-10 | `DELETE /api/initiatives/{id}` | `204` |
| RN-09 Con información relacionada se archiva | RN-10 | `DELETE /api/initiatives/{id}` | `200` con `result: "archived"` |
| RN-10 No solicitar en una iniciativa propia | RN-05 | `POST /api/requests` | `403 OWN_INITIATIVE` |
| RN-11 Una sola solicitud pendiente por iniciativa | RN-06 | `POST /api/requests` e índice único parcial | `409 PENDING_REQUEST_EXISTS` |
| RN-12 Una solicitud resuelta no se modifica | RN-07 | `PUT /api/requests/{id}` | `409 REQUEST_NOT_PENDING` |
| RN-13 Solo se cancelan las pendientes | RN-07 | `PATCH /api/requests/{id}/status` | `409 REQUEST_NOT_PENDING` |
| RN-14 Al aceptar, el usuario entra al equipo | RN-08 | `PATCH /api/requests/{id}/status` | (efecto automático) |
| RN-15 No entrar dos veces al mismo equipo | RN-08 | `POST /api/requests` y al aceptar | `409 ALREADY_MEMBER` |
| RN-16 El propietario es parte del equipo | — | `POST /api/initiatives` lo agrega como primer miembro | (efecto automático) |
| RN-17 Proyecto solo con un miembro además del propietario | RN-09 | `POST /api/projects` | `409 NOT_ENOUGH_MEMBERS` |
| RN-18 Una iniciativa genera un solo proyecto | RN-09 | `POST /api/projects` e índice único | `409 PROJECT_ALREADY_EXISTS` |
| RN-19 La iniciativa convertida se conserva | RN-10 | `DELETE /api/initiatives/{id}` archiva (el proyecto es información relacionada) | `200` con `result: "archived"` |
| RN-20 Toda consulta respeta la visibilidad | RN-03 | Listados y detalles de iniciativas, equipos y proyectos | `401` o `403` |

## 7. Resumen de rutas

| Verbo | Ruta | Acceso | Éxito |
|---|---|---|---|
| GET | `/api/health` | Público | 200 |
| POST | `/api/auth/register` | Público | 201 |
| POST | `/api/auth/login` | Público | 200 |
| POST | `/api/auth/logout` | Sesión | 204 |
| GET | `/api/auth/me` | Sesión | 200 |
| GET | `/api/users` | Sesión | 200 |
| GET | `/api/users/{id}` | Sesión | 200 |
| PUT | `/api/users/{id}` | Sesión (dueño) | 200 |
| GET | `/api/skills` | Público | 200 |
| GET | `/api/skills/{id}` | Público | 200 |
| POST | `/api/skills` | Admin | 201 |
| GET | `/api/initiatives` | Opcional | 200 |
| GET | `/api/initiatives/{id}` | Opcional | 200 |
| POST | `/api/initiatives` | Sesión | 201 |
| PUT | `/api/initiatives/{id}` | Sesión (propietario) | 200 |
| DELETE | `/api/initiatives/{id}` | Sesión (propietario) | 204 o 200 |
| GET | `/api/initiatives/{id}/members` | Opcional | 200 |
| DELETE | `/api/initiatives/{id}/members/{userId}` | Sesión (propietario) | 204 |
| POST | `/api/requests` | Sesión | 201 |
| GET | `/api/requests/sent` | Sesión | 200 |
| GET | `/api/requests/received` | Sesión | 200 |
| GET | `/api/requests/{id}` | Sesión (solicitante o propietario) | 200 |
| PUT | `/api/requests/{id}` | Sesión (solicitante) | 200 |
| PATCH | `/api/requests/{id}/status` | Sesión (según el estado) | 200 |
| POST | `/api/projects` | Sesión (propietario de la iniciativa) | 201 |
| GET | `/api/projects` | Opcional | 200 |
| GET | `/api/projects/{id}` | Opcional | 200 |