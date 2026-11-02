// ui.js
import { rutaBase, esErrorDeEspacio } from './api.js';
import { obtenerUsuarioActual, cerrarSesion, esPropietario, esMiembro, tieneAccesoCompleto, nombreCompleto, esAdministrador } from './auth.js';
import { separarEtiquetas, revisarEtiqueta, validarImagen, mostrarErrorCampo, limpiarErrorCampo, revisarCompetenciasRepetidas } from './validations.js';
import { leerImagenReducida } from './imagenes.js';

// Convierte en texto seguro un dato antes de ponerlo dentro de un innerHTML. Se usa con todo dato que venga de las iniciativas o de los usuarios
export function escaparHTML(texto) {
    if (texto === undefined || texto === null) return '';
    return String(texto)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

export function mostrarCarga(contenedor) {
    contenedor.innerHTML = '<div class="text-center my-5"><div class="spinner-border text-primary" role="status"></div><p>Cargando iniciativas...</p></div>';
}

export function mostrarError(contenedor, mensaje) {
    contenedor.innerHTML = `<div class="alert alert-danger" role="alert">${mensaje}</div>`;
}

export function mostrarAviso(contenedor, mensaje) {
    contenedor.innerHTML = `<div class="alert alert-warning" role="alert">${mensaje}</div>`;
}

export function mostrarExito(contenedor, mensaje) {
    contenedor.innerHTML = `<div class="alert alert-success py-2 mb-0" role="status">${mensaje}</div>`;
}

// ----- Notificaciones (toast) -----

const CLAVE_NOTIFICACION = 'notificacion_pendiente';
const TITULOS_NOTIFICACION = { success: 'Listo', danger: 'No se pudo completar' };

export function mostrarNotificacion(texto, tipo = 'success') {
    // El contenedor se crea la primera vez y se reutiliza para las siguientes notificaciones
    let contenedor = document.getElementById('contenedor-notificaciones');
    if (!contenedor) {
        contenedor = document.createElement('div');
        contenedor.id = 'contenedor-notificaciones';
        contenedor.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        document.body.appendChild(contenedor);
    }

    const notificacion = document.createElement('div');
    // bg-white: semitransparente y el contenido de atrás se notaba
    notificacion.className = 'toast bg-white';
    // Lectores de pantalla: un éxito se anuncia sin interrumpir, un errorinmediatamente
    notificacion.setAttribute('role', tipo === 'danger' ? 'alert' : 'status');
    notificacion.setAttribute('aria-live', tipo === 'danger' ? 'assertive' : 'polite');
    notificacion.setAttribute('aria-atomic', 'true');
    notificacion.innerHTML = `
        <div class="toast-header bg-white">
            <span class="d-inline-block rounded-circle bg-${tipo} p-1 me-2" aria-hidden="true"></span>
            <strong class="me-auto">${TITULOS_NOTIFICACION[tipo]}</strong>
            <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Cerrar"></button>
        </div>
        <div class="toast-body"></div>
    `;

    notificacion.querySelector('.toast-body').textContent = texto; // el texto puede incluir datos que escribió el usuario
    contenedor.appendChild(notificacion);

    // Cuando termina de ocultarse se quita de la página para no acumular nodos
    notificacion.addEventListener('hidden.bs.toast', () => notificacion.remove());

    bootstrap.Toast.getOrCreateInstance(notificacion).show();
}

// Para mensajes que se deben ver en la página siguiente, se guardan en sessionStorage y esa página los muestra al cargar
export function notificarAlLlegar(texto, tipo = 'success') {
    sessionStorage.setItem(CLAVE_NOTIFICACION, JSON.stringify({ texto, tipo }));
}

// Se llama al cargar cada página, muestra la notificación que dejó la página anterior, si hay
export function mostrarNotificacionPendiente() {
    const pendiente = JSON.parse(sessionStorage.getItem(CLAVE_NOTIFICACION));
    if (!pendiente) return;

    sessionStorage.removeItem(CLAVE_NOTIFICACION); // se muestra solo una vez
    mostrarNotificacion(pendiente.texto, pendiente.tipo);
}

// ----- Confirmación con modal -----

// Modal para confirmar una acción, solo se ejecuta si la persona confirma
// opciones { titulo, mensaje, textoConfirmar, textoCancelar, alConfirmar }
export function pedirConfirmacion(opciones) {
    // El modal se crea la primera vez y se reutiliza en las siguientes confirmaciones
    let modal = document.getElementById('modal-confirmacion');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal-confirmacion';
        modal.className = 'modal fade';
        modal.tabIndex = -1;
        modal.setAttribute('aria-labelledby', 'modal-confirmacion-titulo');
        modal.setAttribute('aria-hidden', 'true');
        modal.innerHTML = `
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content border-0 shadow">
                    <div class="modal-header">
                        <h2 class="modal-title h5" id="modal-confirmacion-titulo"></h2>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
                    </div>
                    <div class="modal-body">
                        <p class="mb-0" id="modal-confirmacion-mensaje"></p>
                    </div>
                    <div class="modal-footer border-0 bg-light">
                        <button type="button" class="btn btn-outline-primary" data-bs-dismiss="modal"
                            id="modal-confirmacion-cancelar"></button>
                        <button type="button" class="btn btn-danger" id="modal-confirmacion-aceptar"></button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    // textContent: los textos pueden incluir datos que escribió el usuario
    document.getElementById('modal-confirmacion-titulo').textContent = opciones.titulo;
    document.getElementById('modal-confirmacion-mensaje').textContent = opciones.mensaje;
    document.getElementById('modal-confirmacion-cancelar').textContent = opciones.textoCancelar;

    const botonAceptar = document.getElementById('modal-confirmacion-aceptar');
    botonAceptar.textContent = opciones.textoConfirmar;
    // onclick, como el modal se reutiliza no se acumulan escuchas de confirmaciones pasadas
    botonAceptar.onclick = () => {
        bootstrap.Modal.getInstance(modal).hide();
        opciones.alConfirmar();
    };

    // Al cerrarse, el foco vuelve al botón que abrió el modal (para quien usa teclado o lector
    // de pantalla). { once: true } quita esta escucha después de usarla
    const elementoAnterior = document.activeElement;
    modal.addEventListener('hidden.bs.modal', () => elementoAnterior?.focus(), { once: true });

    bootstrap.Modal.getOrCreateInstance(modal).show();
}

// Mensaje cuando localStorage no pudo guardar
export function mensajeErrorAlGuardar(error) {
    if (esErrorDeEspacio(error)) {
        return 'El navegador ya no tiene espacio para guardar más fotos. Quita la foto de alguna iniciativa o de tu perfil e intenta de nuevo.';
    }
    return 'No se pudieron guardar los cambios. Intenta de nuevo.';
}

//formatear fechas de YYYY-MM-DD a texto
export function formatearFecha(fechaIso) {
    const opciones = { year: 'numeric', month: 'long', day: 'numeric' };
    const fecha = new Date(fechaIso + 'T00:00:00');
    return fecha.toLocaleDateString('es-ES', opciones);
}

// Enlace a la página de inicio de sesión que al entrar regresa a la página indicada
export function enlaceIniciarSesion(paginaDeRegreso) {
    return `<a href="${rutaBase()}paginas/iniciar-sesion.html?volver=${encodeURIComponent(paginaDeRegreso)}" class="alert-link">iniciar sesión</a>`;
}

function claseEstado(estado) {
    const texto = estado?.toLowerCase() || '';
    if (texto.includes('abiert')) return 'estado-abierta';
    if (texto.includes('progres')) return 'estado-progreso';
    if (texto.includes('revis')) return 'estado-revision';
    return 'bg-secondary';
}

// candado y texto
function etiquetaVisibilidad(nivel) {
    const icono = nivel === 'Restringida' || nivel === 'Privada' ? '<span aria-hidden="true">🔒</span> ' : '';
    return `<span class="badge bg-light text-dark border">${icono}${escaparHTML(nivel)}</span>`;
}

// Texto con saltos de línea, un <p> por párrafo
function parrafos(texto) {
    return texto
        .split('\n')
        .filter(linea => linea.trim() !== '')
        .map(linea => `<p class="text-dark">${escaparHTML(linea)}</p>`)
        .join('');
}

// ----- Imágenes -----

export function imagenPredeterminadaIniciativa() {
    return `${rutaBase()}img/iniciativa.svg`;
}

export function avatarPredeterminado() {
    return `${rutaBase()}img/avatar.svg`;
}

// Foto del usuario o, si no tiene, el avatar predeterminado
export function fotoDePerfil(usuario) {
    return usuario.foto || avatarPredeterminado();
}

// <img> de una iniciativa. Si no tiene foto se usa la imagen predeterminada
export function imagenDeIniciativaHTML(iniciativa, clases) {
    const src = iniciativa.imagen || imagenPredeterminadaIniciativa();
    const alt = iniciativa.imagen ? `Foto de la iniciativa ${iniciativa.titulo}` : '';
    return `<img src="${escaparHTML(src)}" alt="${escaparHTML(alt)}" class="${clases}">`;
}

// ----- Menú de sesión -----

// Sin sesión se deja el enlace "Iniciar sesión" que ya trae el HTML.
// Con sesión, el saludo con el nombre es el enlace a Mi perfil
export function inicializarMenuSesion() {
    const itemSesion = document.getElementById('menu-sesion');
    const usuario = obtenerUsuarioActual();
    if (!itemSesion || !usuario) return;

    // En la página del perfil, el enlace se marca como la página actual
    const estaEnPerfil = window.location.pathname.endsWith('perfil-de-usuario.html');
    const insigniaAdmin = esAdministrador(usuario) ? ' <span class="badge text-bg-light">Administrador</span>' : '';

    itemSesion.classList.add('d-flex', 'align-items-center', 'gap-2', 'pb-2', 'pb-lg-0');
    itemSesion.innerHTML = `
        <a class="nav-link ${estaEnPerfil ? 'active' : ''}" href="${rutaBase()}paginas/perfil-de-usuario.html"
            ${estaEnPerfil ? 'aria-current="page"' : ''}>
            Hola, <strong>${escaparHTML(usuario.nombre)}</strong>${insigniaAdmin}<span class="visually-hidden"> (ir a mi perfil)</span>
        </a>
        <button type="button" class="btn btn-outline-light btn-sm" id="btn-cerrar-sesion">Cerrar sesión</button>
    `;

    document.getElementById('btn-cerrar-sesion').addEventListener('click', () => {
        cerrarSesion();
        window.location.href = `${rutaBase()}index.html`;
    });
}

// ----- Competencias (catálogo de datos/competencias.json) -----

// Agrega al <select> las competencias del catálogo, agrupadas por categoría con <optgroup>
export function llenarSelectCompetencias(select, catalogo) {
    // Categorías sin repetir, en el orden en que aparecen en el catálogo
    const categorias = [...new Set(catalogo.map(competencia => competencia.categoria))];

    categorias.forEach(categoria => {
        const grupo = document.createElement('optgroup');
        grupo.label = categoria;
        catalogo
            .filter(competencia => competencia.categoria === categoria)
            .sort((a, b) => a.nombre.localeCompare(b.nombre)) // orden alfabético dentro del grupo
            .forEach(competencia => grupo.appendChild(new Option(competencia.nombre, competencia.nombre)));
        select.appendChild(grupo);
    });
}

// Selecciona una competencia guardada. Si ya no está en el catálogo, se agrega como opción para no perderla sin aviso,al guardar, la validación pide cambiarla por una del catálogo
export function seleccionarCompetencia(select, valor) {
    const existe = Array.from(select.options).some(opcion => opcion.value === valor);
    if (valor !== '' && !existe) {
        select.add(new Option(`${valor} (fuera del catálogo)`, valor));
    }
    select.value = valor;
}

// ----- Competencias dinámicas (formularios de registro y edición de iniciativa) -----

export function crearFilaCompetencia(numero, catalogo, valor = '') {
    const fila = document.createElement('div');
    fila.className = 'input-group has-validation mb-2';
    fila.innerHTML = `
        <select id="competencia-${numero}" name="competencias[]" class="form-select"
            aria-label="Competencia requerida ${numero}">
            <option value="">Seleccione una competencia</option>
        </select>
        <button class="btn btn-outline-danger btn-eliminar-competencia" type="button"
            aria-label="Eliminar competencia ${numero}">Eliminar</button>
    `;
    const select = fila.querySelector('select');
    llenarSelectCompetencias(select, catalogo);
    seleccionarCompetencia(select, valor);
    return fila;
}

// Una escucha para el botón de agregar, en el contenedor, delegación para todos los botones
// Eliminar y para revisar repetidas en cuanto se elige una competencia
export function activarCompetenciasDinamicas(contenedor, botonAgregar, catalogo) {
    let contador = contenedor.querySelectorAll('select[name="competencias[]"]').length;

    botonAgregar.addEventListener('click', () => {
        contador++;
        const fila = crearFilaCompetencia(contador, catalogo);
        contenedor.appendChild(fila);
        fila.querySelector('select').focus();
    });

    contenedor.addEventListener('click', (e) => {
        if (!e.target.classList.contains('btn-eliminar-competencia')) return;

        const fila = e.target.closest('.input-group');
        const competencia = fila.querySelector('select').value;
        const quitarFila = () => {
            fila.remove();
            revisarCompetenciasRepetidas(contenedor); // la que quedaba repetida puede dejar de estarlo
            botonAgregar.focus();
        };

        // Una fila vacía se quita
        if (competencia === '') {
            quitarFila();
            return;
        }
        pedirConfirmacion({
            titulo: 'Quitar competencia',
            mensaje: `¿Quieres quitar "${competencia}" de las competencias requeridas?`,
            textoConfirmar: 'Quitar',
            textoCancelar: 'Conservar',
            alConfirmar: quitarFila
        });
    });

    // Validación inmediata de repetidas
    contenedor.addEventListener('change', (e) => {
        if (e.target.name === 'competencias[]') {
            revisarCompetenciasRepetidas(contenedor);
        }
    });
}

// ----- Etiquetas chips (formularios de iniciativa) -----

// Cada etiqueta se muestra como una pastilla con un botón para quitarla.
// Lo que se escribe se agrega al presionar Enter o coma, y la lista completa se guarda separada por comas en el
// campo oculto
export function activarEtiquetas(bloque, etiquetasIniciales = []) {
    const campoTexto = bloque.querySelector('#nueva-etiqueta');
    const campoOculto = bloque.querySelector('#etiquetas');
    const lista = bloque.querySelector('#lista-etiquetas');
    let etiquetas = [...etiquetasIniciales];

    const dibujar = () => {
        lista.innerHTML = '';
        etiquetas.forEach(etiqueta => {
            const chip = document.createElement('span');
            chip.className = 'badge rounded-pill text-bg-light border d-inline-flex align-items-center gap-2 fs-6 fw-normal';
            chip.textContent = etiqueta; // textContent

            const botonQuitar = document.createElement('button');
            botonQuitar.type = 'button';
            botonQuitar.className = 'btn-close btn-quitar-etiqueta';
            botonQuitar.dataset.etiqueta = etiqueta;
            botonQuitar.setAttribute('aria-label', `Quitar etiqueta ${etiqueta}`);

            chip.appendChild(botonQuitar);
            lista.appendChild(chip);
        });
        campoOculto.value = etiquetas.join(', ');
    };

    // Si se pega "IoT, UX" se agregan las dos
    // Si una tiene problema, se avisa de una vez y su texto queda en el campo para corregirlo
    const agregar = () => {
        const nuevas = separarEtiquetas(campoTexto.value);
        for (let i = 0; i < nuevas.length; i++) {
            const error = revisarEtiqueta(nuevas[i], etiquetas);
            if (error !== '') {
                mostrarErrorCampo(campoTexto, error);
                campoTexto.value = nuevas.slice(i).join(', ');
                dibujar();
                return;
            }
            etiquetas.push(nuevas[i]);
        }
        campoTexto.value = '';
        limpiarErrorCampo(campoTexto);
        dibujar();
    };

    campoTexto.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault(); // Enter no envía el formulario y la coma no se escribe
            agregar();
        }
    });

    // Delegación: una sola escucha para los botones de quitar de todas las etiquetas
    lista.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-quitar-etiqueta')) {
            etiquetas = etiquetas.filter(etiqueta => etiqueta !== e.target.dataset.etiqueta);
            dibujar();
            campoTexto.focus();
        }
    });

    dibujar();
}

// ----- Contadores de caracteres -----

// Muestra "N de M caracteres" en el elemento #contador-<id> de cada campo que tenga maxlength.
// Una sola escucha en el form actualiza el contador del campo
export function activarContadores(form) {
    const actualizar = (campo) => {
        const contador = document.getElementById(`contador-${campo.id}`);
        if (contador && campo.maxLength > 0) {
            contador.textContent = `${campo.value.length} de ${campo.maxLength} caracteres`;
        }
    };

    form.querySelectorAll('[maxlength]').forEach(actualizar); // en la edición los campos ya vienen llenos
    form.addEventListener('input', (e) => actualizar(e.target));
}

// ----- Campo de foto con vista previa (registro de usuario y formularios de iniciativa) -----

// El bloque de la foto trae un input file, un input hidden (guarda la foto ya reducida), una <img> de vista previa y un botón "Quitar foto".
// imagenPredeterminada cuando no hay foto
export function activarCampoImagen(bloque, imagenPredeterminada, ladoMaximo) {
    const campoArchivo = bloque.querySelector('input[type="file"]');
    const campoOculto = bloque.querySelector('input[type="hidden"]');
    const vistaPrevia = bloque.querySelector('img');
    const botonQuitar = bloque.querySelector('.btn-quitar-foto');

    const actualizarVistaPrevia = () => {
        vistaPrevia.src = campoOculto.value || imagenPredeterminada;
        botonQuitar.hidden = campoOculto.value === '';
    };
    actualizarVistaPrevia();

    campoArchivo.addEventListener('change', async () => {
        if (campoArchivo.files.length === 0 || !validarImagen(campoArchivo)) return;

        try {
            campoOculto.value = await leerImagenReducida(campoArchivo.files[0], ladoMaximo);
            actualizarVistaPrevia();
        } catch (error) {
            mostrarErrorCampo(campoArchivo, 'No se pudo leer la imagen. Prueba con otro archivo.');
        }
    });

    botonQuitar.addEventListener('click', () => {
        campoArchivo.value = '';
        campoOculto.value = '';
        limpiarErrorCampo(campoArchivo);
        actualizarVistaPrevia();
        campoArchivo.focus();
    });
}

// Registro y edición usan los mismos campos
export function leerFormularioIniciativa(form) {
    const formData = new FormData(form);
    const competencias = formData.getAll('competencias[]').map(c => c.trim()).filter(c => c !== '');

    return {
        titulo: formData.get('titulo').trim(),
        tipo: formData.get('tipo'),
        categoria: formData.get('categoria'),
        imagen: formData.get('imagen'), // foto ya reducida, o '' si no tiene
        resumen: formData.get('resumen').trim(),
        descripcion: formData.get('descripcion').trim(),
        problema: formData.get('problema').trim(),
        beneficiarios: formData.get('beneficiarios').trim(),
        etiquetas: separarEtiquetas(formData.get('etiquetas')),
        limite_miembros: parseInt(formData.get('participantes')) || null,
        nivel_visibilidad: formData.get('visibilidad'),
        competencias: competencias
    };
}

// ----- Catálogo -----

// usuario: el usuario con sesión (o null). El botón Editar solo se muestra al propietario
export function renderizarCatalogo(iniciativas, contenedor, usuario = null) {
    if (iniciativas.length === 0) {
        contenedor.innerHTML = '<div class="col-12"><div class="alert alert-warning">No se encontraron iniciativas. Intenta ajustar tus filtros de búsqueda.</div></div>';
        return;
    }

    contenedor.innerHTML = iniciativas.map(ini => {
        const comps = ini.competencias || [];
        const botonEditar = esPropietario(ini, usuario)
            ? `<a href="modificacion-y-eliminacion.html?id=${ini.id}" class="btn btn-outline-primary w-100">Editar</a>`
            : '';

        return `
        <div class="col-12 col-md-6 col-lg-4">
            <article class="card h-100 shadow-sm border-0 d-flex flex-column">
                <div class="ratio ratio-16x9">
                    ${imagenDeIniciativaHTML(ini, 'card-img-top object-fit-cover')}
                </div>
                <div class="card-body d-flex flex-column">
                    <div class="d-flex flex-wrap gap-2 mb-2">
                        <span class="badge bg-secondary text-dark">${escaparHTML(ini.tipo)} · ${escaparHTML(ini.categoria)}</span>
                        ${etiquetaVisibilidad(ini.nivel_visibilidad)}
                    </div>
                    <h3 class="card-title h5 fw-bold">${escaparHTML(ini.titulo)}</h3>
                    <p class="card-text text-muted small">${escaparHTML(ini.resumen)}</p>
                    <p class="small text-muted mb-3">Publicado por <strong>${escaparHTML(ini.propietario)}</strong></p>

                    <div class="mt-auto">
                        <h4 class="h6 fw-bold mb-1">Competencias:</h4>
                        <ul class="small text-muted mb-3 list-unstyled">
                            ${comps.map(c => `<li>· ${escaparHTML(c)}</li>`).join('')}
                        </ul>
                        <div class="d-flex justify-content-between align-items-center border-top pt-3">
                            <span class="${claseEstado(ini.estado)}"><span aria-hidden="true">●</span> ${escaparHTML(ini.estado || 'Indefinido')}</span>
                        </div>
                    </div>
                </div>
                <div class="card-footer bg-white border-0 pb-3 text-center d-flex gap-2">
                    <a href="detalle-de-iniciativa.html?id=${ini.id}" class="btn btn-outline-primary w-100">Ver iniciativa</a>
                    ${botonEditar}
                </div>
            </article>
        </div>
        `;
    }).join('');
}

// ----- Detalle -----

// Mensaje cuando el usuario solo puede ver el resumen
function avisoDeAcceso(iniciativa, usuario) {
    const paginaActual = `detalle-de-iniciativa.html?id=${iniciativa.id}`;

    if (iniciativa.nivel_visibilidad === 'Institucional') {
        return `<span aria-hidden="true">🔒</span> Esta iniciativa es <strong>institucional</strong>: el contenido completo solo está disponible para usuarios con sesión iniciada. Debes ${enlaceIniciarSesion(paginaActual)} para verla completa.`;
    }

    const sugerencia = usuario ? '' : ` Si eres parte del equipo, debes ${enlaceIniciarSesion(paginaActual)}.`;
    return `<span aria-hidden="true">🔒</span> Esta iniciativa es <strong>restringida</strong>: solo se muestra su resumen. La descripción completa, el problema identificado y el equipo solo los pueden ver su propietario y los miembros aceptados.${sugerencia}`;
}

function botonesDeAccion(iniciativa, usuario, espaciosDisponibles, solicitudPendiente) {
    const paginaActual = `detalle-de-iniciativa.html?id=${iniciativa.id}`;

    if (esPropietario(iniciativa, usuario)) {
        return `<a href="modificacion-y-eliminacion.html?id=${iniciativa.id}" class="btn btn-warning btn-lg fw-bold px-4 shadow mb-2">Editar iniciativa</a>`;
    }
    if (esMiembro(iniciativa, usuario)) {
        return '<p class="fw-semibold text-success mb-2"><span aria-hidden="true">✔</span> Formas parte del equipo de esta iniciativa.</p>';
    }
    // no se muestra el botón de solicitar si ya hay una solicitud pendiente
    if (solicitudPendiente) {
        return `<p class="fw-semibold mb-2"><span class="badge text-bg-warning me-1">Pendiente</span> Tu solicitud se envió el ${formatearFecha(solicitudPendiente.fecha)} y espera respuesta del propietario.</p>`;
    }
    if (espaciosDisponibles === 0) {
        return '<p class="fw-semibold text-muted mb-2">El equipo está completo: no hay espacios disponibles.</p>';
    }
    if (!usuario) {
        return `<a href="iniciar-sesion.html?volver=${encodeURIComponent(paginaActual)}" class="btn btn-primary btn-lg fw-bold px-4 shadow mb-2">Inicia sesión para unirte</a>`;
    }
    return `<a href="solicitud-de-participacion.html?id=${iniciativa.id}" class="btn btn-primary btn-lg fw-bold px-4 shadow mb-2">Solicitar unirme a la iniciativa</a>`;
}

// solicitudPendiente para la iniciativa, si tiene
export function renderizarDetalle(iniciativa, contenedor, usuario = null, solicitudPendiente = null) {
    const comps = iniciativa.competencias || [];
    const miembros = iniciativa.miembros_actuales || [];
    const etiquetas = iniciativa.etiquetas || [];
    const accesoCompleto = tieneAccesoCompleto(iniciativa, usuario);

    const limite = iniciativa.limite_miembros;
    const espaciosDisponibles = limite ? Math.max(limite - miembros.length, 0) : null;
    const textoIntegrantes = limite
        ? `${miembros.length} de ${limite} integrantes · ${espaciosDisponibles} ${espaciosDisponibles === 1 ? 'espacio disponible' : 'espacios disponibles'}`
        : `${miembros.length} integrantes`;

    const avisoPrivada = iniciativa.nivel_visibilidad === 'Privada'
        ? '<div class="alert alert-info" role="note">Esta iniciativa es <strong>privada</strong>: no aparece en el catálogo y solo la ven su propietario y su equipo.</div>'
        : '';

    // La foto se muestra como portada solo si la iniciativa tiene
    const portada = iniciativa.imagen
        ? `<div class="ratio mb-4" style="--bs-aspect-ratio: 35%;">${imagenDeIniciativaHTML(iniciativa, 'rounded shadow-sm object-fit-cover')}</div>`
        : '';

    contenedor.innerHTML = `
        <h1 class="fw-bold text-dark mb-4">${escaparHTML(iniciativa.titulo)}</h1>
        ${portada}
        <section aria-labelledby="informacion-iniciativa">
            <h2 id="informacion-iniciativa" class="visually-hidden">Detalles de la iniciativa</h2>

            <div class="d-flex flex-wrap gap-3 mb-4">
                <div class="meta-box-flex shadow-sm">
                    <div class="meta-title">Tipo</div>
                    <div class="meta-content">${escaparHTML(iniciativa.tipo)}</div>
                </div>
                <div class="meta-box-flex shadow-sm">
                    <div class="meta-title">Categoría</div>
                    <div class="meta-content">${escaparHTML(iniciativa.categoria)}</div>
                </div>
                <div class="meta-box-flex shadow-sm">
                    <div class="meta-title">Propietario</div>
                    <div class="meta-content">${escaparHTML(iniciativa.propietario || 'Anónimo')}</div>
                </div>
                <div class="meta-box-flex shadow-sm">
                    <div class="meta-title">Estado</div>
                    <div class="meta-content">
                        <span class="${claseEstado(iniciativa.estado)}"><span aria-hidden="true">●</span> ${escaparHTML(iniciativa.estado)}</span>
                    </div>
                </div>
                <div class="meta-box-flex shadow-sm">
                    <div class="meta-title">Visibilidad</div>
                    <div class="meta-content">${escaparHTML(iniciativa.nivel_visibilidad)}</div>
                </div>
            </div>

            ${accesoCompleto ? avisoPrivada : `<div class="alert alert-warning" role="note">${avisoDeAcceso(iniciativa, usuario)}</div>`}

            <div class="row g-4">
                <div class="col-12 col-lg-8 d-flex flex-column gap-4">
                    <section class="card border-0 shadow-sm p-4">
                        <h2 class="h4 fw-bold text-primary mb-3">Resumen</h2>
                        <p class="text-dark mb-0">${escaparHTML(iniciativa.resumen)}</p>
                    </section>
                    ${accesoCompleto ? `
                    <section class="card border-0 shadow-sm p-4">
                        <h2 class="h4 fw-bold text-primary mb-3">Descripción</h2>
                        ${parrafos(iniciativa.descripcion || '')}
                    </section>
                    <section class="card border-0 shadow-sm p-4">
                        <h2 class="h5 fw-bold text-primary mb-2">Problema identificado</h2>
                        <p class="text-dark">${escaparHTML(iniciativa.problema || 'No se especificó.')}</p>
                        <h2 class="h5 fw-bold text-primary mb-2">Beneficiarios</h2>
                        <p class="text-dark mb-0">${escaparHTML(iniciativa.beneficiarios || 'No se especificaron.')}</p>
                    </section>` : ''}
                </div>
                <div class="col-12 col-lg-4 d-flex flex-column gap-4">
                    <section class="card border-0 shadow-sm p-4">
                        <h2 class="h5 fw-bold text-primary mb-3">Competencias requeridas</h2>
                        <ul class="list-group list-group-flush">
                            ${comps.length > 0 ? comps.map(c => `<li class="list-group-item border-0 px-0 py-1 text-dark bg-transparent">· ${escaparHTML(c)}</li>`).join('') : '<p class="text-muted small mb-0">No se especificaron competencias.</p>'}
                        </ul>
                    </section>
                    ${accesoCompleto ? `
                    <section class="card border-0 shadow-sm p-4">
                        <h2 class="h5 fw-bold text-primary mb-1">Equipo</h2>
                        <p class="small text-muted mb-3">${textoIntegrantes}</p>
                        <ul class="list-unstyled mb-0">
                            ${miembros.map(m => `<li class="mb-2"><strong>${escaparHTML(m.nombre)}</strong><br><span class="small text-muted">${escaparHTML(m.rol)}</span></li>`).join('')}
                        </ul>
                    </section>
                    <section class="card border-0 shadow-sm p-4">
                        <h2 class="h5 fw-bold text-primary mb-3">Etiquetas</h2>
                        ${etiquetas.length > 0
                ? `<div class="d-flex flex-wrap gap-2">${etiquetas.map(e => `<span class="badge border border-primary text-primary px-3 py-2">${escaparHTML(e)}</span>`).join('')}</div>`
                : '<p class="text-muted small mb-0">Sin etiquetas.</p>'}
                    </section>` : ''}
                    <p class="small text-muted mb-0">
                        Publicada el <time datetime="${escaparHTML(iniciativa.fecha)}">${formatearFecha(iniciativa.fecha)}</time>
                        ${iniciativa.fecha_modificacion ? `<br>Última modificación: <time datetime="${escaparHTML(iniciativa.fecha_modificacion)}">${formatearFecha(iniciativa.fecha_modificacion)}</time>` : ''}
                    </p>
                </div>
            </div>

            <div class="mt-5 pt-3 text-center text-md-end">
                ${botonesDeAccion(iniciativa, usuario, espaciosDisponibles, solicitudPendiente)}
            </div>
        </section>
    `;
}

// ----- Perfil de usuario -----

// proyectos: iniciativas en las que el usuario es propietario o miembro
export function renderizarPerfil(usuario, proyectos, contenedor) {
    const nombre = nombreCompleto(usuario);
    const competencias = usuario.competencias || [];
    const intereses = usuario.intereses || [];

    const listaCompetencias = competencias.length > 0
        ? competencias.map(c => `<span class="badge bg-secondary text-dark px-3 py-2">${escaparHTML(c)}</span>`).join('')
        : '<p class="text-muted small mb-0">Aún no has agregado competencias.</p>';

    const listaIntereses = intereses.length > 0
        ? intereses.map(i => `<span class="badge border border-primary text-primary px-3 py-2">${escaparHTML(i)}</span>`).join('')
        : '<p class="text-muted small mb-0">Aún no has agregado intereses.</p>';

    const listaProyectos = proyectos.length > 0
        ? proyectos.map(ini => `
            <article class="card card-iniciativa border border-secondary mb-3">
                <div class="card-header bg-secondary fw-bold text-dark border-0 d-flex justify-content-between align-items-center">
                    <span>${escaparHTML(ini.tipo)} · ${escaparHTML(ini.categoria)}</span>
                    <span class="badge bg-light text-dark border">${esPropietario(ini, usuario) ? 'Propietario' : 'Miembro'}</span>
                </div>
                <div class="card-body row align-items-center">
                    <div class="col-md-8 mb-3 mb-md-0">
                        <h3 class="h5 fw-bold mb-1">${escaparHTML(ini.titulo)}</h3>
                        <p class="text-muted small mb-0">Estado: <span class="${claseEstado(ini.estado)}"><span aria-hidden="true">●</span> ${escaparHTML(ini.estado)}</span></p>
                    </div>
                    <div class="col-md-4 text-md-end">
                        <a href="detalle-de-iniciativa.html?id=${ini.id}" class="btn btn-outline-primary btn-sm">Ir a la iniciativa</a>
                    </div>
                </div>
            </article>`).join('')
        : '<p class="text-muted">Todavía no participas en ninguna iniciativa. <a href="catalogo-de-iniciativas.html">Explora el catálogo</a>.</p>';

    contenedor.innerHTML = `
        <div class="row g-4">
            <div class="col-12 col-lg-4">
                <section aria-labelledby="titulo-info-personal"
                    class="card bg-secondary bg-opacity-50 shadow-sm border-0 text-center p-4">
                    <div class="mb-2">
                        <img src="${escaparHTML(fotoDePerfil(usuario))}" alt="Foto de perfil de ${escaparHTML(nombre)}" width="150" height="150"
                            class="rounded-circle shadow-sm border border-3 border-white object-fit-cover">
                    </div>
                    <div class="mb-3">
                        <button type="button" id="btn-cambiar-foto" class="btn btn-outline-primary btn-sm">Cambiar foto</button>
                        ${usuario.foto ? '<button type="button" id="btn-quitar-foto-perfil" class="btn btn-link btn-sm text-dark">Quitar foto</button>' : ''}
                        <!-- El selector de archivos se abre desde el botón "Cambiar foto" -->
                        <input type="file" id="archivo-foto-perfil" accept="image/jpeg, image/png, image/webp, image/gif" hidden>
                        <div id="mensaje-foto" class="small mt-2" aria-live="polite"></div>
                    </div>

                    <h2 id="titulo-info-personal" class="h4 fw-bold text-dark mb-1">${escaparHTML(nombre)}</h2>
                    ${esAdministrador(usuario) ? '<p class="mb-1"><span class="badge bg-primary">Administrador de la plataforma</span></p>' : ''}
                    <p class="text-muted mb-3">${escaparHTML(usuario.tipo_miembro)} · ${escaparHTML(usuario.carrera)}</p>

                    <a href="mailto:${escaparHTML(usuario.correo)}" class="btn btn-outline-primary btn-sm w-100 mb-2 text-break">${escaparHTML(usuario.correo)}</a>
                    <button type="button" class="btn btn-light btn-sm w-100 text-dark border">Editar Perfil</button>

                    <dl class="text-start small mt-4 mb-0">
                        <dt>Disponibilidad</dt>
                        <dd>${escaparHTML(usuario.disponibilidad || 'Sin indicar')}</dd>
                        <dt>Portafolio</dt>
                        <dd>${/^https?:\/\//.test(usuario.portafolio || '') ? `<a href="${escaparHTML(usuario.portafolio)}" class="text-break">${escaparHTML(usuario.portafolio)}</a>` : 'Sin indicar'}</dd>
                        <dt>Miembro desde</dt>
                        <dd class="mb-0"><time datetime="${escaparHTML(usuario.fecha_registro)}">${formatearFecha(usuario.fecha_registro)}</time></dd>
                    </dl>
                </section>
            </div>

            <div class="col-12 col-lg-8">
                <div class="card shadow-sm border border-secondary p-4 mb-4">
                    ${usuario.descripcion ? `
                    <h2 class="h5 fw-bold text-primary mb-2">Sobre mí</h2>
                    <p class="mb-4">${escaparHTML(usuario.descripcion)}</p>` : ''}
                    <div class="row g-4">
                        <div class="col-md-6">
                            <h2 id="titulo-competencias" class="h5 fw-bold text-primary mb-3">Mis Competencias</h2>
                            <div class="d-flex flex-wrap gap-2">${listaCompetencias}</div>
                        </div>
                        <div class="col-md-6">
                            <h2 id="titulo-intereses" class="h5 fw-bold text-primary mb-3">Mis Intereses</h2>
                            <div class="d-flex flex-wrap gap-2">${listaIntereses}</div>
                        </div>
                    </div>
                </div>

                <section aria-labelledby="titulo-proyectos">
                    <h2 id="titulo-proyectos" class="h4 fw-bold text-dark mb-3 mt-2">Proyectos en los que participo</h2>
                    ${listaProyectos}
                </section>
            </div>
        </div>
    `;
}