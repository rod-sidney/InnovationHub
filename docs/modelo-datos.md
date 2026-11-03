# Modelo de datos (MongoDB)

Este documento describe cómo se guarda la información de Innovation Hub en MongoDB y por qué cada
relación se resolvió con **documentos embebidos** o con **referencias**. Los nombres de colecciones y
campos están en inglés, igual que el contrato de la API (`docs/api-contract.md`), para que el mismo
vocabulario se use en la base de datos, en el servidor y en el cliente.

## Criterio general

- **Se embebe** cuando la información pertenece a un solo documento, tiene un tamaño acotado y casi
  siempre se lee junto con él (por ejemplo, los miembros del equipo dentro de su iniciativa).
- **Se referencia** cuando la información es una entidad independiente, se consulta por separado,
  puede crecer sin límite o se comparte entre varios documentos (por ejemplo, los usuarios, las
  competencias del catálogo y las solicitudes).
- No se copian datos que puedan cambiar (como el nombre de un usuario) dentro de otros documentos:
  se guarda el identificador y el servidor completa los datos al responder (`populate` de Mongoose).

## Diagrama de colecciones

```
users ───────────────┐ owner (1)            skills (catálogo)
  │ skills[] ────────┼───────────────────────▲   ▲
  │  {skill, level}  │                       │   │
  │                  ▼                       │   │
  │            initiatives ── skills[] ──────┘   │
  │              │ members[]  {user, role, joinedAt}      (embebido)
  │              │ removedMembers[] {user, role, ...}     (embebido)
  │              │                                │
  │   requester  ▼ initiative                     │ skill
  └────────▶ requests ────────────────────────────┘
                 ▲
  projects ── initiative (1 a 1, índice único)
  sessions ── user
```

## Colecciones

### `users`

| Campo | Tipo | Notas |
|---|---|---|
| `_id` | ObjectId | Identificador generado por MongoDB |
| `firstName`, `lastName`, `secondLastName` | String | El segundo apellido es opcional |
| `email` | String | Único (índice único), se guarda en minúsculas; no se modifica desde el perfil |
| `passwordHash` | String | Hash de bcrypt; `select: false` para que nunca salga en una consulta normal |
| `memberType` | String | `student`, `teacher` o `staff` |
| `role` | String | `user` o `admin`; al registrarse siempre es `user` |
| `career` | String | Carrera o área profesional |
| `description` | String | Descripción personal |
| `skills` | [{ `skill`: ObjectId → skills, `level`: String }] | **Embebido con referencia** (ver decisión 1) |
| `interests` | [String] | Lista de textos cortos |
| `availability` | String o null | `low` (menos de 5 h), `medium` (5 a 10 h), `high` (más de 10 h) |
| `portfolio` | String | Enlace opcional |
| `photo` | String o null | Foto reducida en formato data URL o enlace |
| `status` | String | `active` o `inactive` |
| `createdAt`, `updatedAt` | Date | Los genera Mongoose (`timestamps`) |

### `skills` (catálogo de competencias)

| Campo | Tipo | Notas |
|---|---|---|
| `_id` | ObjectId | |
| `name` | String | Único (índice único) |
| `category` | String | Por ejemplo, "Desarrollo de software" o "Diseño" |

### `initiatives`

| Campo | Tipo | Notas |
|---|---|---|
| `_id` | ObjectId | |
| `title`, `summary`, `description` | String | Obligatorios |
| `problem`, `beneficiaries` | String | Opcionales |
| `type` | String | `idea`, `need` o `challenge` (RN-04) |
| `category` | String | `technology`, `education`, `sustainability`, `social_impact`, `business`, `health`, `culture` u `other` |
| `visibility` | String | `public`, `institutional`, `restricted` o `private`; exactamente uno (RN-05) |
| `status` | String | `published`, `team_building`, `converted` o `archived` (`draft` queda reservado) |
| `tags` | [String] | Etiquetas |
| `skills` | [ObjectId → skills] | **Referencias** al catálogo (ver decisión 2) |
| `owner` | ObjectId → users | **Referencia**; exactamente un propietario (RN-02) |
| `members` | [{ `user`: ObjectId → users, `role`: String, `joinedAt`: Date }] | **Embebido**: equipo actual, incluye al propietario (RN-16) |
| `removedMembers` | [{ `user`, `role`, `joinedAt`, `removedAt`, `reason` }] | **Embebido**: historial de retiros |
| `memberLimit` | Number | Cantidad estimada de integrantes (1 a 20) |
| `image` | String o null | Imagen reducida (data URL) o enlace |
| `createdAt`, `updatedAt` | Date | `timestamps` |

### `requests` (solicitudes de participación)

| Campo | Tipo | Notas |
|---|---|---|
| `_id` | ObjectId | |
| `initiative` | ObjectId → initiatives | **Referencia** |
| `requester` | ObjectId → users | **Referencia** |
| `skill` | ObjectId → skills | Competencia principal que ofrece |
| `role` | String | Rol que desea desempeñar |
| `availability` | String | Mismos valores que en `users` |
| `message` | String | Mensaje de presentación |
| `status` | String | `pending`, `accepted`, `rejected` o `cancelled` |
| `responseComment` | String | Comentario opcional del propietario al resolver |
| `decidedAt` | Date o null | Fecha de la decisión del propietario |
| `createdAt`, `updatedAt` | Date | `timestamps` |

Índice único parcial `{ initiative: 1, requester: 1 }` solo para los documentos con `status: "pending"`:
la base de datos impide que exista una segunda solicitud pendiente del mismo usuario para la misma
iniciativa (RN-11), aunque dos peticiones lleguen al mismo tiempo.

### `projects`

| Campo | Tipo | Notas |
|---|---|---|
| `_id` | ObjectId | |
| `initiative` | ObjectId → initiatives | **Referencia** con índice único: una iniciativa genera un solo proyecto (RN-18) |
| `owner` | ObjectId → users | Copia del propietario de la iniciativa (ver decisión 6) |
| `name`, `objective`, `description` | String | |
| `technologies` | [String] | Tecnologías previstas |
| `startDate` | Date | Fecha de inicio |
| `estimatedEndDate` | Date o null | Fecha estimada de finalización (opcional) |
| `status` | String | `planning`, `in_progress`, `paused`, `finished` o `archived`; inicia en `planning` |
| `repository` | { `owner`: String, `name`: String } o null | Solo lo necesario para identificar el repositorio de GitHub |
| `createdAt`, `updatedAt` | Date | `timestamps` |

### `sessions`

| Campo | Tipo | Notas |
|---|---|---|
| `_id` | ObjectId | |
| `tokenHash` | String | Hash SHA-256 del token que recibe el cliente (índice único) |
| `user` | ObjectId → users | **Referencia** |
| `expiresAt` | Date | Índice TTL: MongoDB borra la sesión cuando vence |

## Decisiones de embebido y referencia

1. **Competencias del usuario: arreglo embebido de `{ skill, level }`.** El nivel (`basic`,
   `intermediate`, `advanced`) no es un dato del usuario ni de la competencia, sino de la relación entre
   ambos, así que vive en un subdocumento dentro del usuario. La lista es corta y siempre se lee con el
   perfil. Dentro del subdocumento se guarda la **referencia** a la competencia del catálogo y no su
   nombre: si el catálogo corrige un nombre, todos los perfiles lo muestran actualizado, y el filtro de
   usuarios por competencia compara identificadores.
2. **Competencias requeridas por una iniciativa: arreglo de referencias.** Es una relación de muchos a
   muchos con el catálogo compartido. Un arreglo de identificadores es pequeño, permite filtrar el
   catálogo de iniciativas por competencia (`skills: id`) y no duplica nombres.
3. **Propietario de la iniciativa: referencia.** El usuario es una entidad independiente que se
   modifica por separado. Si se copiara su nombre en cada iniciativa, un cambio de nombre dejaría
   datos inconsistentes. Al responder, el servidor completa nombre y foto con `populate`.
4. **Equipo (`members`) embebido en la iniciativa.** El equipo está acotado por `memberLimit` (máximo
   20), siempre se consulta junto con su iniciativa (detalle, espacios disponibles, permisos de
   visibilidad) y cambia como parte de la misma operación (al aceptar una solicitud se agrega un
   miembro). Embebido, la verificación "¿es miembro?" se resuelve en el mismo documento, sin otra
   consulta. Cada miembro guarda la **referencia** al usuario, su rol y la fecha de incorporación. Los
   retiros se mueven a `removedMembers` para conservar la fecha de retiro y el motivo.
5. **Solicitudes en su propia colección, con referencias.** Las solicitudes crecen sin límite (incluye
   las rechazadas y canceladas), tienen su propio ciclo de vida y se consultan desde dos lados: "mis
   solicitudes" (por solicitante) y "solicitudes recibidas" (por iniciativa del propietario). Si
   estuvieran embebidas en la iniciativa, el documento crecería sin control y listar las solicitudes de
   un usuario obligaría a revisar todas las iniciativas.
6. **Proyecto en su propia colección, con referencia a la iniciativa de origen.** El proyecto tiene su
   propio ciclo de vida (estado, repositorio) y se lista por separado; la iniciativa se conserva para
   mantener el vínculo con el problema original (RN-19). El índice único sobre `initiative` garantiza
   desde la base de datos que una iniciativa genere un solo proyecto (RN-18). Los integrantes **no se
   copian** al proyecto: se leen del equipo de la iniciativa, que es la única fuente. El campo `owner`
   sí se copia porque el propietario de una iniciativa nunca cambia (RN-02); así, filtrar proyectos
   por propietario no requiere consultar las iniciativas.
7. **Etiquetas, intereses y tecnologías: arreglos de textos embebidos.** Son valores sin identidad
   propia que solo tienen sentido dentro de su documento.
8. **Sesiones en su propia colección, con referencia al usuario.** Cerrar sesión borra el documento y
   el token deja de servir al instante. Se guarda el hash del token y no el token, para que alguien con
   acceso a la base de datos no pueda usar las sesiones. El índice TTL limpia las sesiones vencidas.
9. **Imágenes como texto dentro del documento.** Las fotos se reducen en el navegador antes de enviarse
   (300 px las de perfil y 800 px las de iniciativas), así que pesan pocos kilobytes y caben con
   holgura en el límite de 16 MB de un documento. Con archivos grandes convendría guardarlas fuera de
   la base de datos (por ejemplo, GridFS o un servicio de archivos) y conservar solo el enlace.

## Equivalencia en un modelo relacional (entrega final)

El mismo dominio se modelará con tablas en la entrega final. Cada decisión anterior se traduce así:

| MongoDB | Modelo relacional |
|---|---|
| `users.skills[]` (embebido con referencia) | Tabla `user_skills (user_id, skill_id, level)` con llave primaria compuesta |
| `initiatives.skills[]` (referencias) | Tabla intermedia `initiative_skills (initiative_id, skill_id)` |
| `initiatives.owner` (referencia) | Llave foránea `initiatives.owner_id` |
| `initiatives.members[]` y `removedMembers[]` (embebidos) | Tabla `initiative_members (initiative_id, user_id, role, joined_at, removed_at, reason, status)` |
| `tags`, `interests`, `technologies` | Tablas hijas (`initiative_tags`, `user_interests`, `project_technologies`) |
| `requests` (referencias) | Tabla `requests` con llaves foráneas e índice único filtrado para las pendientes |
| `projects.initiative` (índice único) | Llave foránea `projects.initiative_id` con restricción `UNIQUE` |
| `sessions` | Tabla `sessions` con fecha de vencimiento |

Como el contrato de la API expone los datos con la misma forma en ambos casos (por ejemplo, los
miembros siempre llegan como un arreglo dentro del detalle de la iniciativa), el cliente React no
necesita cambios cuando cambie el modelo de datos.
