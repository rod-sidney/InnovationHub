# Innovation Hub

Proyecto del curso SOFT-12-C1 -- Programación Web Avanzada

**Estudiante:** Sidney Rodríguez Carranza

**Sección:** SCV2   **Periodo:** III Cuatrimestre 2026

**Docente:** Álvaro Cordero Peña

## Descripción

Aplicación web que permite publicar ideas, necesidades y retos, declarar las competencias que cada
iniciativa requiere y conformar equipos interdisciplinarios dentro de la comunidad universitaria.

- **Avance 1** (`avance1/`): prototipo navegable con HTML, CSS, JavaScript, Bootstrap y Sass.
- **Avance 2** (`cliente/` y `servidor/`): aplicación cliente-servidor. La interfaz es una aplicación
  de React (Vite) que consume una API propia hecha con Node.js y Express, y la información se guarda
  en MongoDB.

```
React (Vite)  --HTTP/JSON-->  API en Node.js con Express  -->  MongoDB
```

El cliente nunca se conecta a la base de datos: toda regla de negocio, verificación de permisos y
acceso a datos ocurre en el servidor.

## Estructura del repositorio

```
innovation-hub/
├── README.md
├── .gitignore
├── docs/
│   ├── api-contract.md      contrato de la API (rutas, verbos, formatos y códigos)
│   └── modelo-datos.md      modelo de datos de MongoDB (embebido frente a referencia)
├── avance1/                 prototipo del Avance 1 (se conserva)
├── cliente/                 aplicación React
│   ├── .env.example
│   └── src/
│       ├── api/             funciones que llaman a la API (una por recurso) y a GitHub
│       ├── componentes/     componentes por dominio: comunes, layout, iniciativas,
│       │                    solicitudes, usuarios y proyectos
│       ├── contexto/        sesión compartida con Context de React
│       ├── paginas/         una página por ruta de React Router
│       ├── styles/          Bootstrap y Sass del Avance 1
│       └── utils/           validaciones, etiquetas, formato de fechas e imágenes
├── servidor/                API con Express
│   ├── .env.example
│   ├── datos-prueba/        datos que carga el script de semilla
│   └── src/
│       ├── config/          variables de entorno y conexión a MongoDB
│       ├── rutas/           enrutamiento: ruta + verbo + middlewares -> controlador
│       ├── controladores/   capa HTTP: valida la entrada, llama al servicio y responde
│       ├── servicios/       lógica de negocio: reglas RN y visibilidad
│       ├── modelos/         acceso a datos: esquemas de Mongoose
│       ├── middlewares/     sesión (token) y manejo uniforme de errores
│       ├── validaciones/    validación de cuerpos y parámetros
│       └── utils/           errores, paginación, representaciones y valores controlados
├── pruebas/                 colección de Postman de la API
└── herramientas/            script que genera la tabla de commits de este README
```

## Requisitos

- Node.js 20.19 o superior (lo exige Mongoose 9; probado con Node.js 24) y npm.
- MongoDB Community Server 8 o superior escuchando en `localhost:27017`.
- Postman (opcional) para ejecutar la colección de pruebas.

## 1. Instalar las dependencias

Cada parte tiene su propio `package.json`. Las dependencias (`node_modules`) no se suben al
repositorio, así que se instalan una vez:

```bash
cd servidor
npm install
cd ../cliente
npm install
```

## 2. Configurar las variables de entorno

Los archivos `.env` no se suben al repositorio porque pueden tener secretos. Cada carpeta trae un
`.env.example` que se copia con el nombre `.env`:

```bash
cp servidor/.env.example servidor/.env
cp cliente/.env.example cliente/.env
```

(En PowerShell: `Copy-Item servidor/.env.example servidor/.env`.)

**servidor/.env**

| Variable | Ejemplo | Para qué sirve |
|---|---|---|
| `PORT` | `3000` | Puerto donde escucha la API |
| `MONGODB_URI` | `mongodb://127.0.0.1:27017/innovation-hub` | Cadena de conexión de MongoDB |
| `CLIENT_ORIGIN` | `http://localhost:5173` | Origen del cliente permitido por CORS |
| `SESSION_HOURS` | `8` | Horas que dura una sesión |

**cliente/.env**

| Variable | Ejemplo | Para qué sirve |
|---|---|---|
| `VITE_API_URL` | `http://localhost:3000/api` | Dirección de la API (en la entrega final solo cambia este valor) |
| `VITE_GITHUB_API_URL` | `https://api.github.com` | API pública de GitHub |

## 3. Levantar la base de datos y cargar los datos de prueba

1. Instalar MongoDB Community Server (incluye el servicio de Windows) y, si se quiere, MongoDB Compass:
   ```bash
   winget install MongoDB.Server
   winget install MongoDB.Compass.Full
   ```
   También se puede descargar el instalador desde mongodb.com. El instalador deja MongoDB como un
   servicio de Windows que se inicia solo.
2. Comprobar que el servicio está encendido (PowerShell):
   ```bash
   Get-Service MongoDB
   ```
3. Cargar los datos de prueba (vacía las colecciones y vuelve a llenarlas):
   ```bash
   cd servidor
   npm run seed
   ```
   La base de datos `innovation-hub` se crea sola. El script guarda las contraseñas con bcrypt y
   crea los índices (correo único, solicitud pendiente única, proyecto único por iniciativa y
   vencimiento de sesiones).

## 4. Ejecutar el servidor

```bash
cd servidor
npm run dev
```

`npm run dev` usa `node --watch`: el servidor se reinicia solo al guardar un archivo. Para
comprobar que funciona, abrir `http://localhost:3000/api/health` (responde `{"status":"ok"}`).

## 5. Ejecutar el cliente

En otra terminal:

```bash
cd cliente
npm run dev
```

Abrir `http://localhost:5173`. El cliente usa el puerto 5173 de forma fija porque es el origen que el
servidor acepta por CORS.

## 6. Probar la API con Postman

1. Cargar los datos de prueba (`npm run seed`) y encender el servidor.
2. En Postman: *Import* → `pruebas/innovation-hub.postman_collection.json`.
3. Ejecutar la colección completa en orden (*Run collection*): unas peticiones usan los tokens e
   identificadores que guardan las anteriores.

Cada recurso tiene casos **[Correcta]**, **[Datos inválidos]**, **[Inexistente]** y
**[No autorizado]**, y los casos **[Conflicto]** prueban las reglas de negocio (409). También se
puede ejecutar desde la terminal con Newman:

```bash
npx newman run pruebas/innovation-hub.postman_collection.json
```

## Cuentas de prueba

Todas usan la contraseña `Hub12345`.

| Correo | Para probar |
|---|---|
| `cmontero@ucenfotec.ac.cr` | Estudiante: propietaria de una iniciativa pública con solicitudes pendientes y de una privada; miembro de una restringida |
| `svargas@ucenfotec.ac.cr` | Estudiante: propietaria de una iniciativa restringida; tiene una solicitud pendiente |
| `vmorales@ucenfotec.ac.cr` | Estudiante: su iniciativa ya tiene un miembro y se puede convertir en proyecto |
| `lmendez@ucenfotec.ac.cr` | Estudiante: propietaria del proyecto TutorHub (repositorio de GitHub válido) |
| `ecampos@ucenfotec.ac.cr` | Docente: propietaria del proyecto EcoDatos (repositorio inexistente, para ver el manejo de errores de GitHub) |
| `equiros@ucenfotec.ac.cr` | Docente: propietario de una iniciativa institucional |
| `admin.innovationhub@ucenfotec.ac.cr` | La única cuenta de administrador (puede agregar competencias al catálogo) |

## Documentación

- [Contrato de la API](docs/api-contract.md): rutas, verbos, formato de peticiones y respuestas,
  códigos de estado, formato uniforme de errores y reglas de negocio que verifica el servidor.
- [Modelo de datos](docs/modelo-datos.md): colecciones de MongoDB y por qué cada relación se resolvió
  con documentos embebidos o con referencias, con su equivalencia en un modelo relacional.

## Decisiones de diseño (Avance 2)

1. **Servidor en capas:** las rutas definen la dirección, el verbo y los middlewares; los
   controladores leen y validan la petición y responden con el código de estado; los servicios
   aplican las reglas de negocio; los modelos de Mongoose son el acceso a datos. Ningún archivo
   mezcla las cuatro responsabilidades.
2. **Contrato pensado para dos implementaciones:** rutas, parámetros y campos en inglés, valores
   controlados como códigos (`public`, `pending`...), identificadores como texto opaco, fechas ISO y un
   único formato de error. Así el servidor de .NET de la entrega final puede responder igual.
3. **Validación en los dos lados:** el cliente valida para dar una respuesta inmediata y el servidor
   vuelve a validar todo (`servidor/src/validaciones`). El servidor solo copia los campos permitidos,
   así que el cliente no puede elegir el propietario, el rol ni el estado.
4. **Autorización en el servidor:** `servicios/visibilidad.js` decide qué iniciativas, equipos y
   proyectos ve cada usuario (cuatro niveles de visibilidad). Ocultar un botón en React nunca
   reemplaza esa verificación.
5. **Sesiones con token:** al iniciar sesión el servidor entrega un token aleatorio y guarda solo su
   hash SHA-256 en la colección `sessions`; cerrar sesión borra el documento y el token deja de
   servir. Un índice TTL elimina las sesiones vencidas.
6. **Contraseñas con bcrypt:** se guardan con hash y sal; el campo tiene `select: false` y las
   respuestas se arman campo por campo, así que nunca salen hashes ni secretos.
7. **Listados resueltos en MongoDB:** búsqueda, filtros, orden y paginación con `find`, `sort`, `skip`
   y `limit`; el servidor no descarga colecciones completas para filtrarlas o paginarlas en memoria.
8. **Modelo de datos documentado:** el equipo vive embebido en la iniciativa (acotado y siempre se lee
   con ella), y las solicitudes y los proyectos van en sus propias colecciones con referencias (ver
   `docs/modelo-datos.md`).
9. **Cliente organizado por dominio:** páginas por ruta, componentes reutilizables con props y
   children, estado inmutable, formularios controlados, Context para la sesión y `useEffect` con
   `AbortController` para cancelar las peticiones al desmontar un componente.
10. **GitHub desde el cliente y sin token:** un token en el navegador quedaría expuesto; se usa el
    acceso público y se manejan los casos de repositorio inexistente o privado, límite de consultas,
    servicio no disponible y respuesta inválida.
11. **Diseño del Avance 1:** se trasladaron las mismas variables y parciales de Sass, con Sass 1.100.0
    fijo: desde la 1.101, Sass escribe algunos colores calculados en porcentajes y eso rompe los íconos
    SVG que Bootstrap incrusta en el CSS.

## Avance 1

### Cómo ejecutar el prototipo

**Nota:** el prototipo usa `fetch` para leer archivos JSON locales, así que abrirlo directamente
desde el disco (`file://`) genera un error de CORS. Para ejecutarlo:

1. Abrir el proyecto en un editor como Visual Studio Code.
2. Utilizar una extensión de servidor local (como Live Server).
3. Abrir `avance1/index.html` con el servidor (clic derecho → *Open with Live Server*).

### Cómo compilar los estilos del prototipo (Sass)

Los estilos se escriben en `avance1/scss/` y se compilan a `avance1/css/`. El CSS compilado ya está
incluido, así que no hace falta compilar para ver el prototipo. Desde la raíz del repositorio:

```bash
npm install
npm run sass
```

### Decisiones de diseño del Avance 1

1. **Diseño Responsive y UI:** Bootstrap 5 junto con Sass para una interfaz responsive (mobile-first),
   accesible y visualmente coherente.
2. **Persistencia simulada:** `localStorage` guardaba las iniciativas nuevas en el navegador. Desde el
   Avance 2 la persistencia está en MongoDB.
3. **Carga asíncrona:** los datos iniciales se leían de archivos `.json` con `fetch` y `async/await`.
4. **Enrutamiento por parámetros:** `URLSearchParams` leía el `?id=X` de la dirección. En el Avance 2
   lo reemplaza React Router (`/iniciativas/:id`).
5. **Delegación de eventos** para los elementos creados dinámicamente.
6. **Validación propia** con `novalidate` y un mensaje por campo, que el Avance 2 conserva en React.
7. **Contenido seguro:** `escaparHTML()` evitaba que los datos se interpretaran como HTML. En React,
   JSX escapa el texto de forma automática.
 
## Resumen de commits

**Commits del avance 1:** 1-18. Total: 18 commits.
**Commits del avance 2:** 19-58. Total: 40 commits.
 
<!-- INICIO TABLA COMMITS -->

| # | Fecha | Hash | Mensaje | Zona | Cambio |
|---|---|---|---|---|---|
| 1 | 2026-09-06 | 5527ee9 | Crear estructura del avance 1 y documentación inicial | Global | Carpetas |
| 2 | 2026-09-06 | 92965c3 | Creación tabla resumen de commits | Global | README.md |
| 3 | 2026-09-06 | f71deb0 | Automatización de la tabla de commits | Global | Script y hook |
| 4 | 2026-09-06 | ed3d29a | Corrección de automatización de tabla de commits y cambios en README | Global | Script y hook |
| 5 | 2026-09-06 | 4d7eb50 | Corrección automatización tabla de commits | Global | Script tabla-commit.sh |
| 6 | 2026-09-06 | 7d6298d | Creación de pantallas mínimas para el avance 1. Modificación de catalogo-de-iniciativas.html y detalle-de-iniciativas.html. | avance1/paginas | Archivos HTML de vistas |
| 7 | 2026-09-08 | 1eefcf8 | Edición de la pantalla de la página principal | avance1/paginas/index.html | Estructura HTML |
| 8 | 2026-09-21 | e2d52b0 | Se desarrolla el contenido y forms de las páginas: detalle-de-iniciativa.html, modificacion-y-eliminacion.html y publicar-iniciativa.html | avance1/paginas | paginas/detalle-de-iniciativa.html, paginas/modificacion-y-eliminacion.html, paginas/registro-de-iniciativa.html |
| 9 | 2026-09-21 | cf81c36 | Se desarrolla el contenido y forms de las páginas: perfil-de-usuario y solicitud-de-participacion HTML. |  |  |
| 10 | 2026-09-25 | d3aaa96 | Configuración inicial de scss y se agregan links de bootstrap a los HTML | avance1/scss, avance1/paginas | Carpetas |
| 11 | 2026-09-25 | 39ec900 | Aplicar cambios de bootstrap y sass a la página principal | avance1/paginas, avance1/scss, avance1/css | index.html |
| 12 | 2026-09-26 | e44b115 | Se modifica la página de catálogo de iniciativas para añadir los estilos de bootstrap y css | avance1/paginas, avance1/css | catalogo-de-iniciativa.html |
| 13 | 2026-09-27 | 15b7cef | Se modifica la página de detalle de iniciativa, añadiendo los estilos | avance1/scss, avance1/paginas, avance1/css | detalle-de-iniciativa.html |
| 14 | 2026-09-27 | 73cab78 | Se modifican las páginas de modificación y elimminación de iniciativas, perfil de usuario, registro de iniciativas y solicitud de perticipación + correcciones de la página catálogo de iniciativas, para añadir los estilos | avance1/paginas, avance1/css, avance1/scss | modificacion-y-eliminacion.html, perfil-de-usuario.html, registro-de-iniciativa.html, solicitud-de-participacion.html |
| 15 | 2026-09-27 | 6163a4e | Se crean archivos js y se modifican archivos json para que las páginas catalogo de iniciativas, detalle de iniciativa y modificacion y eliminacion puedan traer los datos por medio de ellos | avance1/datos, avance1/js, avance1/paginas | catalogo-de-iniciativas.html, detalle-de-iniciativa.html, modificacion-y-eliminacion.html |
| 16 | 2026-09-27 | 70c08a4 | Correcciones js y de archivos json para poder cargar los datos | avance1/datos, avance1/js | iniciativas.json, userprofile.json, api.js, app.js, ui.js |
| 17 | 2026-09-27 | 98ff89f | Se modifican archivos js para implementar la funcionalidad en archivos html: perfil, registro de iniciativa, solicitud de participacion | avance1/js, avance1/paginas | index.html, perfil-de-usuario.html, registro-de-iniciativa.html, solicitud-de-participacion.html |
| 18 | 2026-09-27 | 92f9878 | Se hace la edición final del README | Global | README.md |
| 19 | 2026-11-02 | 15bcdc6 | Correcciones del avance 1 y preparación para avance 2 | /avance1 | /datos, /img, /js, /paginas, /scss/main.scss, index.html, package.json |
| 20 | 2026-11-02 | 75d5b58 | Diseñar el modelo de datos para MongoDB con decisiones de embebido y referencia | docs | modelo-datos.md |
| 21 | 2026-11-02 | 3a04060 | Definir las convenciones del contrato de la API y las rutas de autenticación, usuarios y competencias | docs | api-contract.md |
| 22 | 2026-11-03 | f0b8ccb | Completar el contrato de la API con iniciativas, equipo, solicitudes y proyectos | docs | api-contract.md |
| 23 | 2026-11-03 | ef959dc | Crear el proyecto del servidor con Express y configurar CORS | servidor, Global | package.json, .env.example, app.js, server.js, env.js, .gitignore |
| 24 | 2026-11-03 | 9a3f8c6 | Agregar el manejo uniforme de errores y de rutas inexistentes | servidor/src | ErrorApi.js, errores.js, app.js |
| 25 | 2026-11-03 | 859ce46 | Conectar el servidor con MongoDB mediante Mongoose | servidor | db.js, env.js, server.js, package.json, .env.example |
| 26 | 2026-11-03 | abea8a1 | Crear los modelos de usuarios, competencias y sesiones | servidor/src/modelos | valores.js, Usuario.js, Competencia.js, Sesion.js |
| 27 | 2026-11-03 | fd56598 | Crear los modelos de iniciativas, solicitudes y proyectos | servidor/src/modelos | Iniciativa.js, Solicitud.js, Proyecto.js |
| 28 | 2026-11-03 | d171d03 | Agregar los datos de prueba y el script para cargarlos en MongoDB | servidor | datos-prueba, seed.js, db.js, package.json |
| 29 | 2026-11-03 | ed79c51 | Agregar funciones reutilizables de validación, paginación y búsqueda | servidor/src | reglas.js, paginacion.js, texto.js |
| 30 | 2026-11-03 | 7de12f6 | Implementar la consulta del catálogo de competencias | servidor/src | competencias.rutas.js, competencias.controlador.js, competencias.servicio.js, competencias.validacion.js, representaciones.js |
| 31 | 2026-11-03 | d03db10 | Implementar el registro y el inicio de sesión con contraseñas cifradas | servidor/src | autenticacion.rutas.js, autenticacion.controlador.js, autenticacion.servicio.js, autenticacion.validacion.js, tokens.js |
| 32 | 2026-11-04 | f7c7960 | Proteger rutas con el middleware de sesión y agregar cierre de sesión, usuario actual y alta de competencias | servidor/src | middlewares/autenticacion.js, autenticacion, competencias |
| 33 | 2026-11-04 | 5fab554 | Implementar la búsqueda paginada de usuarios y la consulta y modificación del perfil | servidor/src | usuarios.rutas.js, usuarios.controlador.js, usuarios.servicio.js, usuarios.validacion.js |
| 34 | 2026-11-04 | bed07d5 | Implementar el catálogo de iniciativas con visibilidad, búsqueda, filtros, orden y paginación | servidor/src | iniciativas.rutas.js, iniciativas.controlador.js, iniciativas.servicio.js, iniciativas.validacion.js, visibilidad.js |
| 35 | 2026-11-04 | 9a1f35a | Implementar el detalle de iniciativa según su visibilidad y la relación del usuario | servidor/src | iniciativas.servicio.js, visibilidad.js, representaciones.js, iniciativas.controlador.js, iniciativas.rutas.js |
| 36 | 2026-11-04 | 386dd83 | Implementar el registro y la modificación de iniciativas con validación en el servidor | servidor/src | iniciativas.servicio.js, iniciativas.validacion.js, iniciativas.controlador.js, iniciativas.rutas.js |
| 37 | 2026-11-04 | 5a7a607 | Implementar la eliminación o el archivado de iniciativas según su información relacionada | servidor/src | iniciativas.servicio.js, iniciativas.controlador.js, iniciativas.rutas.js |
| 38 | 2026-11-04 | 7645624 | Implementar la consulta del equipo y el retiro de miembros | servidor/src | iniciativas.rutas.js, equipo.controlador.js, equipo.servicio.js, equipo.validacion.js, visibilidad.js |
| 39 | 2026-11-04 | 9c6c8fc | Implementar el registro, la consulta, los listados y la modificación de solicitudes | servidor/src | solicitudes.rutas.js, solicitudes.controlador.js, solicitudes.servicio.js, solicitudes.validacion.js, representaciones.js |
| 40 | 2026-11-04 | 4768af3 | Implementar la cancelación, la aceptación y el rechazo de solicitudes con incorporación al equipo | servidor/src | solicitudes.servicio.js, solicitudes.validacion.js, solicitudes.controlador.js, solicitudes.rutas.js |
| 41 | 2026-11-04 | 5809895 | Implementar la conversión de iniciativas en proyectos, su listado y su detalle | servidor/src | proyectos.rutas.js, proyectos.controlador.js, proyectos.servicio.js, proyectos.validacion.js, visibilidad.js, representaciones.js |
| 42 | 2026-11-04 | bbc9773 | Agregar la colección de Postman con casos correctos, inválidos, inexistentes y no autorizados. Todas las pruebas pasan | pruebas | innovation-hub.postman_collection.json |
| 43 | 2026-11-05 | 7897fc7 | Crear el proyecto del cliente con React y Vite | cliente | package.json, vite.config.js, index.html, main.jsx, App.jsx, imágenes predeterminadas |
| 44 | 2026-11-05 | 2536269 | Se trasladan los estilos de Bootstrap y Sass del avance 1 al cliente. Además, se agrega el diseño base y las rutas con React Router, incluida la página no encontrada | cliente/src y /src/styles | main.scss, _variables.scss, _tarjetas.scss, _detalle.scss, _estados.scss, _componentes.scss, App.jsx, main.jsx, Encabezado.jsx, PiePagina.jsx, Inicio.jsx, NoEncontrada.jsx |
| 45 | 2026-11-05 | 501fd9d | Crear el cliente HTTP con la dirección del servidor en variables de entorno y los estados de carga, error y vacío. También se implementa el catálogo con búsqueda, filtros, orden y paginación resueltos en el servidor | cliente/src | cliente.js, iniciativas.js, Cargando.jsx, MensajeError.jsx, SinResultados.jsx, TarjetaIniciativa.jsx, Inicio.jsx, Catalogo.jsx, FiltrosIniciativas.jsx, Paginacion.jsx, OpcionesCompetencias.jsx, competencias.js, App.jsx, .env.example |
| 46 | 2026-11-05 | ad3ca66 | Implementar el detalle de iniciativa a partir del parámetro de la ruta | cliente/src | DetalleIniciativa.jsx, EquipoIniciativa.jsx, DatoMeta.jsx, Tarjeta.jsx, iniciativas.js, App.jsx |
| 47 | 2026-11-05 | 069b42a | Implementar la sesión con Context: registro, inicio y cierre de sesión con token | cliente/src | SesionContexto.jsx, autenticacion.js, cliente.js, IniciarSesion.jsx, Registro.jsx, Encabezado.jsx, Campo.jsx, CampoImagen.jsx, validaciones.js, imagenes.js |
| 48 | 2026-11-05 | 12138d0 | Mostrar en el detalle las acciones según la sesión y la relación con la iniciativa | cliente/src | AccionesIniciativa.jsx, Aviso.jsx, DetalleIniciativa.jsx, Catalogo.jsx |
| 49 | 2026-11-05 | c8a0a8d | Proteger las rutas con sesión e implementar el formulario para publicar y modificar iniciativas | cliente/src | RutaProtegida.jsx, FormularioIniciativa.jsx, SelectorCompetencias.jsx, CampoEtiquetas.jsx, NuevaIniciativa.jsx, EditarIniciativa.jsx, validaciones.js, iniciativas.js, App.jsx |
| 50 | 2026-11-05 | 5c4bd60 | Implementar la eliminación o el archivado de iniciativas y el retiro de miembros con confirmación | cliente/src | ModalConfirmacion.jsx, DetalleIniciativa.jsx, AccionesIniciativa.jsx, EquipoIniciativa.jsx, Catalogo.jsx, iniciativas.js |
| 51 | 2026-11-06 | 34f4e6f | Implementar la solicitud de participación y Mis solicitudes con edición y cancelación | cliente/src | SolicitarParticipacion.jsx, EditarSolicitud.jsx, MisSolicitudes.jsx, FormularioSolicitud.jsx, TarjetaSolicitud.jsx, solicitudes.js, validaciones.js, App.jsx |
| 52 | 2026-11-06 | 5a6097d | Implementar las solicitudes recibidas con filtros, aceptación y rechazo | cliente/src | SolicitudesRecibidas.jsx, PestanasSolicitudes.jsx, MisSolicitudes.jsx, AccionesIniciativa.jsx, solicitudes.js, App.jsx |
| 53 | 2026-11-06 | 58c5b00 | Implementar el perfil: consulta y modificación con competencias por nivel, intereses y foto | cliente/src | MiPerfil.jsx, PerfilUsuario.jsx, VistaPerfil.jsx, FormularioPerfil.jsx, CompetenciasConNivel.jsx, IniciativasDelUsuario.jsx, usuarios.js, SesionContexto.jsx, validaciones.js, App.jsx |
| 54 | 2026-11-06 | 2134a46 | Implementar la búsqueda y el filtrado de usuarios | cliente/src | Usuarios.jsx, FiltrosUsuarios.jsx, TarjetaUsuario.jsx, usuarios.js, App.jsx |
| 55 | 2026-11-06 | e4a95cf | Implementar la conversión en proyecto, el listado y el detalle de proyectos | cliente/src | ConvertirEnProyecto.jsx, Proyectos.jsx, DetalleProyecto.jsx, FormularioProyecto.jsx, TarjetaProyecto.jsx, proyectos.js, AccionesIniciativa.jsx, DetalleIniciativa.jsx, validaciones.js, App.jsx |
| 56 | 2026-11-06 | 438c817 | Mostrar la información del repositorio con la API de GitHub y manejar sus errores | cliente | github.js, InfoRepositorio.jsx, DetalleProyecto.jsx, .env.example |
| 57 | 2026-11-06 | 970c7b9 | Correcciones: puerto ocupado, versión de Node, repositorio sin nombre y textos | servidor, cliente, docs | server.js, package.json, proyectos.validacion.js, iniciativas.servicio.js, DetalleIniciativa.jsx, Inicio.jsx, api-contract.md |
| 58 | 2026-11-08 | 55dbd99 | entrega-2. Correcciones finales. | cliente, Global | package.json, DetalleIniciativa.jsx, Inicio.jsx, README.md |

<!-- FIN TABLA COMMITS -->
