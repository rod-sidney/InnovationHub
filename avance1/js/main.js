// main.js
// Lógica de las páginas de inicio, publicar iniciativa, perfil y solicitud de participación
import { cargarDatos, cargarCompetencias, iniciativasLocales, agregarIniciativaLocal, obtenerIniciativaPorId, fechaDeHoy } from './api.js';
import { obtenerUsuarioActual, nombreCorto, esPropietario, esMiembro, puedeVerIniciativa, obtenerPerfil, actualizarUsuario } from './auth.js';
import { inicializarMenuSesion, activarCompetenciasDinamicas, llenarSelectCompetencias, activarCampoImagen, activarEtiquetas, activarContadores, leerFormularioIniciativa, renderizarPerfil, mostrarError, mostrarAviso, mostrarExito, mensajeErrorAlGuardar, formatearFecha, enlaceIniciarSesion, imagenDeIniciativaHTML, imagenPredeterminadaIniciativa, notificarAlLlegar, mostrarNotificacionPendiente, pedirConfirmacion, escaparHTML } from './ui.js';
import { validarFormularioIniciativa, validarFormularioSolicitud, limpiarErroresAlEscribir, revisarImagen } from './validations.js';
import { leerImagenReducida } from './imagenes.js';
import { buscarSolicitudPendiente, registrarSolicitud } from './solicitudes.js';

document.addEventListener('DOMContentLoaded', () => {
    inicializarAplicacion();
});

//Función principal que se encarga de cargar datos y funcionalidades segun la página
async function inicializarAplicacion() {
    inicializarMenuSesion();
    mostrarNotificacionPendiente();

    try {
        await cargarDatos();
    } catch (error) {
        // Estado de error visible en todas las pantallas, se avisa en la sección que necesitaba los datos (inicio, perfil, o el formulario de publicar o de solicitud)
        const contenedor = document.getElementById('contenedor-iniciativas-recientes')
            || document.getElementById('perfil-contenedor')
            || document.querySelector('#form-registro-iniciativa, #form-solicitud')?.parentElement;
        if (contenedor) mostrarError(contenedor, "No se pudieron cargar las iniciativas. Verifica que estás usando Live Server.");
        return;
    }

    //index.html
    if (document.getElementById('contenedor-iniciativas-recientes')) {
        renderizarIniciativasInicio();
    }

    //registro iniciativa
    if (document.getElementById('form-registro-iniciativa')) {
        configurarFormularioRegistro();
    }

    //solicitud de participacion
    if (document.getElementById('form-solicitud')) {
        configurarFormularioSolicitud();
    }

    //perfil de usuario
    if (document.getElementById('perfil-contenedor')) {
        configurarPerfil();
    }
}

//Inyecta las iniciativas en el HTML de la página de inicio
function renderizarIniciativasInicio() {
    const contenedor = document.getElementById('contenedor-iniciativas-recientes');
    const usuario = obtenerUsuarioActual();

    // Las privadas solo las ve su propietario y su equipo (filter devuelve un arreglo nuevo)
    let iniciativas = iniciativasLocales.filter(ini => puedeVerIniciativa(ini, usuario));

    if (iniciativas.length === 0) {
        contenedor.innerHTML = '<div class="col-12"><div class="alert alert-warning">Todavía no hay iniciativas publicadas.</div></div>';
        return;
    }

    // Ordenar de la más nueva a la más antigua por id
    iniciativas.sort((a, b) => b.id - a.id);

    // Tomar solo las primeras 3 para el index
    const iniciativasRecientes = iniciativas.slice(0, 3);

    contenedor.innerHTML = '';

    iniciativasRecientes.forEach(ini => {
        //html (la foto sale de los datos de la iniciativa)
        const cardHTML = `
            <div class="col-12 col-md-6 col-lg-4">
                <article class="card h-100 card-iniciativa shadow-sm">
                    <div class="ratio ratio-16x9">
                        ${imagenDeIniciativaHTML(ini, 'card-img-top object-fit-cover')}
                    </div>
                    <div class="card-header bg-secondary fw-bold text-dark border-0 text-capitalize">
                        ${escaparHTML(ini.tipo)} · ${escaparHTML(ini.categoria)}
                    </div>
                    <div class="card-body">
                        <h3 class="card-title h5">${escaparHTML(ini.titulo)}</h3>
                        <p class="card-text">${escaparHTML(ini.resumen)}</p>
                    </div>
                    <div class="card-footer bg-white border-0">
                        <small class="text-muted d-block mb-3">Por <strong>${escaparHTML(ini.propietario || 'Usuario Anónimo')}</strong> · <time datetime="${escaparHTML(ini.fecha)}">${formatearFecha(ini.fecha)}</time></small>
                        <a href="paginas/detalle-de-iniciativa.html?id=${ini.id}" class="btn btn-outline-primary w-100">Ver iniciativa</a>
                    </div>
                </article>
            </div>
        `;
        contenedor.innerHTML += cardHTML;
    });
}

//Configura la interactividad y envío del formulario de registro de iniciativas
async function configurarFormularioRegistro() {
    const formulario = document.getElementById('form-registro-iniciativa');
    const usuario = obtenerUsuarioActual();

    // solo un usuario autenticado registra iniciativas y queda como propietario
    if (!usuario) {
        mostrarAviso(formulario.closest('.card'), `Para publicar una iniciativa debes ${enlaceIniciarSesion('registro-de-iniciativa.html')}.`);
        return;
    }

    // Las competencias se eligen del catálogo (datos/competencias.json)
    let catalogo;
    try {
        catalogo = await cargarCompetencias();
    } catch (error) {
        mostrarError(formulario.closest('.card'), "No se pudo cargar el catálogo de competencias. Verifica que estás usando Live Server.");
        return;
    }
    const nombresCatalogo = catalogo.map(competencia => competencia.nombre);
    llenarSelectCompetencias(document.getElementById('competencia-1'), catalogo);

    //añadir y eliminar campos dinámicos de competencias
    activarCompetenciasDinamicas(document.getElementById('contenedor-competencias'), document.getElementById('btn-agregar-competencia'), catalogo);
    //foto de la iniciativa con vista previa (se reduce a 800 px)
    activarCampoImagen(document.getElementById('bloque-imagen'), imagenPredeterminadaIniciativa(), 800);
    //etiquetas como chips y contadores de caracteres
    activarEtiquetas(document.getElementById('bloque-etiquetas'));
    activarContadores(formulario);
    limpiarErroresAlEscribir(formulario);

    //guardar formulario
    formulario.addEventListener('submit', (e) => {
        e.preventDefault();

        if (!validarFormularioIniciativa(formulario, nombresCatalogo)) return;

        const hoy = fechaDeHoy(); // YYYY-MM-DD

        // El id lo genera agregarIniciativaLocal
        try {
            agregarIniciativaLocal({
                ...leerFormularioIniciativa(formulario),
                propietario_id: usuario.id,
                propietario: nombreCorto(usuario),
                fecha: hoy,
                fecha_modificacion: hoy,
                miembros_actuales: [{ usuario_id: usuario.id, nombre: nombreCorto(usuario), rol: 'Propietario' }],
                estado: "Abierta"
            });
        } catch (error) {
            mostrarError(document.getElementById('mensaje-formulario'), mensajeErrorAlGuardar(error));
            return;
        }

        // El mensaje se muestra como toast en la página de inicio, después de redirigir
        notificarAlLlegar('¡Iniciativa publicada con éxito! Ya aparece en la página principal y en el catálogo.');

        //volver a catálogo o index
        window.location.href = '../index.html';
    });
}

//formulario de postulación a una iniciativa
function configurarFormularioSolicitud() {
    const formulario = document.getElementById('form-solicitud');
    const contenidoTarjeta = formulario.closest('.card-body');
    const textoIniciativa = document.getElementById('titulo-iniciativa-solicitud');

    const parametros = new URLSearchParams(window.location.search);
    const idIniciativa = parametros.get('id');
    const usuario = obtenerUsuarioActual();
    const iniciativa = idIniciativa ? obtenerIniciativaPorId(idIniciativa) : undefined;

    // Volver regresa al detalle de la iniciativa, o al catálogo si no hay una
    const urlDestino = iniciativa ? `detalle-de-iniciativa.html?id=${iniciativa.id}` : 'catalogo-de-iniciativas.html';
    const btnVolver = document.getElementById('btn-volver-solicitud');
    btnVolver.href = urlDestino;

    // Las competencias se eligen entre las de la iniciativa
    // Una privada que el usuario no puede ver se trata como si no existiera
    if (!iniciativa || !puedeVerIniciativa(iniciativa, usuario)) {
        textoIniciativa.textContent = 'ninguna iniciativa';
        mostrarAviso(contenidoTarjeta, 'No se encontró la iniciativa. Elige una en el <a href="catalogo-de-iniciativas.html" class="alert-link">catálogo</a> y usa el botón "Solicitar unirme".');
        return;
    }
    textoIniciativa.textContent = iniciativa.titulo;

    // solo un usuario autenticado puede solicitar participación
    if (!usuario) {
        mostrarAviso(contenidoTarjeta, `Para solicitar participación debes ${enlaceIniciarSesion(`solicitud-de-participacion.html?id=${iniciativa.id}`)}.`);
        return;
    }
    // no se puede solicitar participación en una iniciativa propia
    if (esPropietario(iniciativa, usuario)) {
        mostrarAviso(contenidoTarjeta, "No puedes solicitar participación en una iniciativa de la que eres propietario.");
        return;
    }
    // no se puede entrar dos veces al mismo equipo
    if (esMiembro(iniciativa, usuario)) {
        mostrarAviso(contenidoTarjeta, "Ya formas parte del equipo de esta iniciativa.");
        return;
    }
    // no puede haber dos solicitudes pendientes para la misma iniciativa
    const solicitudPendiente = buscarSolicitudPendiente(iniciativa.id, usuario.id);
    if (solicitudPendiente) {
        mostrarAviso(contenidoTarjeta, `Ya enviaste una solicitud para esta iniciativa el ${formatearFecha(solicitudPendiente.fecha)} y está pendiente de respuesta.`);
        return;
    }
    // Sin espacios disponibles no se puede pedir unirse
    const miembros = iniciativa.miembros_actuales || [];
    if (iniciativa.limite_miembros && miembros.length >= iniciativa.limite_miembros) {
        mostrarAviso(contenidoTarjeta, "El equipo de esta iniciativa está completo: no hay espacios disponibles.");
        return;
    }

    // Las opciones de competencia se generan desde la iniciativa
    const competencias = iniciativa.competencias || [];
    competencias.forEach(competencia => {
        formulario.elements.competencia.add(new Option(competencia, competencia)); // new Option(texto, valor)
    });

    // Contadores de caracteres (rol y mensaje) comunican el máximo mientras se escribe
    activarContadores(formulario);

    // Cancelar y Volver: si ya escribió algo se pide confirmación antes de salir
    const salirDeLaSolicitud = () => {
        const hayAlgoEscrito = ['rol', 'competencia', 'disponibilidad', 'mensaje']
            .some(nombre => formulario.elements[nombre].value.trim() !== '');
        if (!hayAlgoEscrito) {
            window.location.href = urlDestino;
            return;
        }
        pedirConfirmacion({
            titulo: 'Descartar solicitud',
            mensaje: 'Todavía no enviaste tu solicitud. Si sales ahora, se perderá lo que escribiste.',
            textoConfirmar: 'Descartar solicitud',
            textoCancelar: 'Seguir escribiendo',
            alConfirmar: () => { window.location.href = urlDestino; }
        });
    };

    document.getElementById('btn-cancelar-solicitud').addEventListener('click', salirDeLaSolicitud);
    // Volver es un enlace, se detiene la navegación para revisar primero si hay algo escrito
    btnVolver.addEventListener('click', (e) => {
        e.preventDefault();
        salirDeLaSolicitud();
    });

    limpiarErroresAlEscribir(formulario);

    formulario.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!validarFormularioSolicitud(formulario, competencias)) return;

        const campos = formulario.elements;
        let solicitud;
        try {
            solicitud = registrarSolicitud({
                iniciativa_id: iniciativa.id,
                usuario_id: usuario.id,
                solicitante: nombreCorto(usuario),
                rol: campos.rol.value.trim(),
                competencia: campos.competencia.value,
                disponibilidad: campos.disponibilidad.value,
                mensaje: campos.mensaje.value.trim()
            });
        } catch (error) {
            mostrarError(document.getElementById('mensaje-solicitud'), mensajeErrorAlGuardar(error));
            return;
        }

        // por si se envió otra solicitud desde otra pestaña mientras tanto
        if (!solicitud) {
            mostrarAviso(document.getElementById('mensaje-solicitud'), "Ya tienes una solicitud pendiente para esta iniciativa.");
            return;
        }

        // En el detalle se ve el toast y, en lugar del botón, que la solicitud está pendiente
        notificarAlLlegar('Tu solicitud fue enviada. Queda pendiente hasta que el propietario la revise.');
        window.location.href = `detalle-de-iniciativa.html?id=${iniciativa.id}`;
    });
}

//perfil del usuario con sesión iniciada
async function configurarPerfil() {
    const contenedor = document.getElementById('perfil-contenedor');
    const usuario = obtenerUsuarioActual();

    if (!usuario) {
        mostrarAviso(contenedor, `Para ver tu perfil debes ${enlaceIniciarSesion('perfil-de-usuario.html')}.`);
        return;
    }

    // una sola escucha para los botones de la foto, aunque el perfil se vuelva a dibujar
    contenedor.addEventListener('click', (e) => {
        if (e.target.id === 'btn-cambiar-foto') {
            document.getElementById('archivo-foto-perfil').click(); // abre el selector de archivos
        }
        if (e.target.id === 'btn-quitar-foto-perfil') {
            guardarFotoPerfil(usuario.id, '');
        }
    });

    contenedor.addEventListener('change', async (e) => {
        if (e.target.id !== 'archivo-foto-perfil' || e.target.files.length === 0) return;

        const archivo = e.target.files[0];
        const mensajeError = revisarImagen(archivo);
        if (mensajeError !== '') {
            mostrarError(document.getElementById('mensaje-foto'), mensajeError);
            return;
        }

        try {
            // La foto se muestra a 150 px; se guarda a 300 px para que se vea bien
            guardarFotoPerfil(usuario.id, await leerImagenReducida(archivo, 300));
        } catch (error) {
            mostrarError(document.getElementById('mensaje-foto'), 'No se pudo leer la imagen. Prueba con otro archivo.');
        }
    });

    await mostrarPerfil(usuario.id);
}

// Dibuja el perfil con los datos actuales del usuario (incluida foto)
async function mostrarPerfil(usuarioId) {
    const contenedor = document.getElementById('perfil-contenedor');

    try {
        const perfil = await obtenerPerfil(usuarioId);
        if (!perfil) {
            mostrarAviso(contenedor, "No se encontró tu cuenta. Cierra la sesión y vuelve a entrar.");
            return;
        }

        // Proyectos en los que participa: es propietario o miembro aceptado del equipo
        const proyectos = iniciativasLocales.filter(ini => esPropietario(ini, perfil) || esMiembro(ini, perfil));
        renderizarPerfil(perfil, proyectos, contenedor);
    } catch (error) {
        mostrarError(contenedor, "No se pudieron cargar los datos del perfil. Verifica que estás usando Live Server.");
    }
}

// foto: imagen ya reducida, o '' para volver al avatar predeterminado
async function guardarFotoPerfil(usuarioId, foto) {
    try {
        actualizarUsuario(usuarioId, { foto });
    } catch (error) {
        mostrarError(document.getElementById('mensaje-foto'), mensajeErrorAlGuardar(error));
        return;
    }

    await mostrarPerfil(usuarioId);

    const mensajeFoto = document.getElementById('mensaje-foto');
    if (mensajeFoto) {
        mostrarExito(mensajeFoto, foto ? 'Foto actualizada.' : 'Se quitó la foto.');
        document.getElementById('btn-cambiar-foto').focus(); // el botón se volvió a crear al redibujar
    }
}