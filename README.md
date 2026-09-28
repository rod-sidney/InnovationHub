# Innovation Hub

Proyecto del curso SOFT-12-C1 -- Programación Web Avanzada

**Estudiante:** Sidney Rodríguez

**Seccion:** SCV2   **Periodo:** III Cuatrimestre 2026

**Docente:** Álvaro Cordero Peña

## Descripción

Aplicación web que permite publicar ideas, necesidades y retos, 
declarar las competencias que cada iniciativa requiere y conformar 
equipos interdisciplinarios dentro de la comunidad universitaria.

## Estructura del repositorio

- `avance1/` — prototipo con HTML, CSS, JavaScript, Bootstrap y Sass
  - `paginas/` — pantallas del prototipo
  - `datos/`   — archivos JSON con datos simulados
  - `js/`      — módulos de JavaScript
  - `scss/`    — variables y parciales de Sass
  - `css/`     — hoja de estilos compilada
 
## Cómo ejecutar
 
**Nota:** Debido a que la aplicación utiliza la API `fetch` de JavaScript para leer archivos JSON locales, abrir el archivo directamente en el navegador (`file://`) generará un error de CORS. 

Para ejecutar el proyecto correctamente:
1. Abrir el proyecto en un editor como Visual Studio Code.
2. Utilizar una extensión de servidor local (como Live Server).
3. Levantar el servidor en el archivo `index.html` de la raíz o dentro de `avance1/`.
 
## Decisiones de diseño
 
1. **Diseño Responsive y UI:** Se utilizó Bootstrap 5 junto con Sass para que la interfaz sea responsive (mobile-first), accesible y visualmente coherente. Se emplearon utilidades de flexbox y grid system para el catálogo y perfiles.
2. **Persistencia de Datos Simulada:** Dado que aún no hay un backend, se implementó `localStorage` de HTML5. Esto permite que las nuevas iniciativas creadas desde los formularios se guarden en el navegador del usuario y persistan al cambiar de página, simulando una base de datos real.
3. **Carga Asíncrona de Datos:** Los datos iniciales se extraen de archivos estáticos `.json` utilizando Fetch API y promesas (async/await), inyectándose en el DOM al inicializar la aplicación.
4. **Enrutamiento por Parámetros:** Para navegar entre el catálogo, el detalle de una iniciativa y la solicitud de participación, se utilizó `URLSearchParams`. Esto permite capturar el `?id=X` de la URL para saber exactamente qué información renderizar en las vistas de detalle sin necesidad de múltiples archivos HTML.
5. **Delegación de Eventos:** Para mejorar el rendimiento y manejar elementos creados dinámicamente (como la adición de múltiples competencias en el formulario de registro), se implementó el patrón de delegación de eventos en JavaScript.
 
## Resumen de commits
 
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
| 18 | 2026-09-27 | 5ef5dab | Se hace la edición final del README | Global | README.md |

<!-- FIN TABLA COMMITS -->
