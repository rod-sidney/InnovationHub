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
- Un identificador dentro del cuerpo o en un parámetro de consulta que no es válido o no existe
  responde `400` (es un dato inválido de la petición).

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
