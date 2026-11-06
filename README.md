# Innovation Hub

Proyecto del curso SOFT-12-C1 -- Programación Web Avanzada

**Estudiante:** Sidney Rodríguez

**Sección:** SCV2   **Periodo:** III Cuatrimestre 2026

**Docente:** Álvaro Cordero Peña

## Descripción

Aplicación web que permite publicar ideas, necesidades y retos, 
declarar las competencias que cada iniciativa requiere y conformar 
equipos interdisciplinarios dentro de la comunidad universitaria.

## Estructura del repositorio

- `avance1/` — prototipo con HTML, CSS, JavaScript, Bootstrap y Sass
  - `index.html` — página principal
  - `paginas/` — pantallas del prototipo (catálogo, detalle, publicar, editar, perfil, solicitud, iniciar sesión y crear cuenta)
  - `datos/`   — archivos JSON con datos simulados: `iniciativas.json`, `usuarios.json`, `competencias.json` y `categorias.json`
  - `js/`      — módulos de JavaScript, cada uno con una responsabilidad:
    - `api.js` — carga de iniciativas y del catálogo de competencias, y su persistencia
    - `auth.js` — sesión (iniciar, cerrar, registrarse) y reglas de permisos y visibilidad
    - `solicitudes.js` — solicitudes de participación
    - `validations.js` — validación propia de los formularios
    - `ui.js` — generación del HTML y componentes de la interfaz (toasts, modales, chips)
    - `imagenes.js` — reducción de fotos antes de guardarlas
    - `main.js` y `app.js` — controladores de cada página
  - `scss/`    — variables y parciales de Sass
  - `css/`     — hoja de estilos compilada
  - `img/`     — imágenes predeterminadas (perfil e iniciativa sin foto)
- `herramientas/` — script que genera la tabla de commits de este README
- `package.json` — dependencias (Bootstrap y Sass) y scripts para compilar los estilos
 
## Cómo ejecutar
 
**Nota:** Debido a que la aplicación utiliza la API `fetch` de JavaScript para leer archivos JSON locales, abrir el archivo directamente en el navegador (`file://`) generará un error de CORS. 

Para ejecutar el proyecto correctamente:
1. Abrir el proyecto en un editor como Visual Studio Code.
2. Utilizar una extensión de servidor local (como Live Server).
3. Abrir `avance1/index.html` con el servidor (clic derecho → *Open with Live Server*).

## Cómo compilar los estilos (Sass)

Los estilos se escriben en `avance1/scss/` y se compilan a `avance1/css/`. El CSS compilado ya está incluido en el repositorio, así que no hace falta compilar para ver el prototipo.

1. Instalar las dependencias (Bootstrap y Sass) una sola vez:
   ```bash
   npm install
   ```
2. Compilar todos los estilos:
   ```bash
   npm run sass
   ```
   O dejarlo compilando automáticamente cada vez que se guarda un archivo `.scss`:
   ```bash
   npm run sass:watch
   ```

`main.scss` importa primero las variables propias (`_variables.scss`), que sobrescriben las de Bootstrap, luego Bootstrap y al final los parciales (`_tarjetas.scss` y `_detalle.scss`). Al compilar, Sass muestra advertencias de obsolescencia (por ejemplo, de `@import`) que vienen en parte del propio Bootstrap 5.3; no impiden la compilación.

## Cuentas de prueba

Todas usan la contraseña `Hub12345`. Las cuentas creadas desde "Crear cuenta" se guardan en el navegador.

| Correo | Para probar |
|---|---|
| `cmontero@ucenfotec.ac.cr` | Estudiante: propietaria de una iniciativa pública y de una privada, y miembro de una restringida |
| `svargas@ucenfotec.ac.cr` | Estudiante: propietaria de una iniciativa restringida |
| `equiros@ucenfotec.ac.cr` | Docente: propietario de una iniciativa institucional |
| `admin.innovationhub@ucenfotec.ac.cr` | La única cuenta de administrador |
 
## Decisiones de diseño
 
1. **Diseño Responsive y UI:** Se utilizó Bootstrap 5 junto con Sass para que la interfaz sea responsive (mobile-first), accesible y visualmente coherente. Se emplearon utilidades de flexbox y grid system para el catálogo y perfiles.
2. **Persistencia de Datos Simulada:** Dado que aún no hay un backend, se implementó `localStorage` de HTML5. Esto permite que las nuevas iniciativas creadas desde los formularios se guarden en el navegador del usuario y persistan al cambiar de página, simulando una base de datos real.
3. **Carga Asíncrona de Datos:** Los datos iniciales se extraen de archivos estáticos `.json` utilizando Fetch API y promesas (async/await), inyectándose en el DOM al inicializar la aplicación.
4. **Enrutamiento por Parámetros:** Para navegar entre el catálogo, el detalle de una iniciativa y la solicitud de participación, se utilizó `URLSearchParams`. Esto permite capturar el `?id=X` de la URL para saber exactamente qué información renderizar en las vistas de detalle sin necesidad de múltiples archivos HTML.
5. **Delegación de Eventos:** Para mejorar el rendimiento y manejar elementos creados dinámicamente (como la adición de múltiples competencias en el formulario de registro), se implementó el patrón de delegación de eventos en JavaScript.
6. **Sesión y permisos en el navegador:** `auth.js` valida el inicio de sesión contra `datos/usuarios.json` y contra las cuentas nuevas guardadas en `localStorage`; la sesión no guarda la contraseña. Las reglas de visibilidad (pública, institucional, restringida y privada) y de propietario (RN-06, RN-07, RN-10, RN-11 y RN-15) se revisan en el cliente; desde el Avance 2 se verificarán en el servidor. Las contraseñas de prueba están en texto plano solo porque todavía no hay servidor.
7. **Versión de los datos:** `VERSION_DATOS` (en `api.js`) hace que el navegador descarte la copia vieja de `localStorage` cuando cambia la estructura de los archivos JSON.
8. **Catálogo de competencias:** `datos/competencias.json` se carga con `fetch` y llena las listas del filtro del catálogo y del formulario de iniciativa, agrupadas por categoría, en lugar de escribir las competencias como texto libre.
9. **Retroalimentación con componentes de Bootstrap:** los mensajes de éxito usan toasts y las confirmaciones usan modales (eliminar, descartar cambios, quitar una competencia), en lugar de `alert()` y `confirm()`.
10. **Validación propia:** los formularios usan `novalidate` y JavaScript propio (`validations.js`) con un mensaje por campo; se revisan campos obligatorios, formato, longitud (con contadores de caracteres), rangos, selecciones válidas, coincidencias y repetidos.
11. **Fotos reducidas:** `imagenes.js` reduce las fotos con `canvas` (300 px las de perfil y 800 px las de iniciativas) para que quepan en `localStorage`.
12. **Contenido seguro:** todo dato de usuarios o iniciativas pasa por `escaparHTML()` antes de insertarse con `innerHTML`, para que no se interprete como HTML.
13. **Versión fija de Sass (1.100.0):** desde la 1.101, Sass escribe algunos colores calculados en porcentajes y eso rompe íconos SVG incrustados de Bootstrap.
 
## Resumen de commits

Commits del avance 1: 1-18
Commits del avance 2: 19-
 
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
| 50 | 2026-11-05 | 8f831ff | Implementar la eliminación o el archivado de iniciativas y el retiro de miembros con confirmación | cliente/src | ModalConfirmacion.jsx, DetalleIniciativa.jsx, AccionesIniciativa.jsx, EquipoIniciativa.jsx, Catalogo.jsx, iniciativas.js |

<!-- FIN TABLA COMMITS -->
