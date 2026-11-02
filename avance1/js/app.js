// app.js
import { cargarDatos, cargarCompetencias, iniciativasLocales, eliminarIniciativaLocal, obtenerIniciativaPorId, actualizarIniciativaLocal, fechaDeHoy, esErrorDeEspacio } from './api.js';
import { obtenerUsuarioActual, iniciarSesion, registrarUsuario, esPropietario, puedeVerIniciativa } from './auth.js';
import { renderizarCatalogo, mostrarCarga, mostrarError, mostrarAviso, renderizarDetalle, inicializarMenuSesion, crearFilaCompetencia, activarCompetenciasDinamicas, llenarSelectCompetencias, seleccionarCompetencia, activarEtiquetas, activarContadores, activarCampoImagen, leerFormularioIniciativa, formatearFecha, enlaceIniciarSesion, imagenPredeterminadaIniciativa, avatarPredeterminado, mensajeErrorAlGuardar, notificarAlLlegar, mostrarNotificacionPendiente, pedirConfirmacion, escaparHTML } from './ui.js';
import { buscarSolicitudPendiente } from './solicitudes.js';
import { validarFormularioIniciativa, validarFormularioLogin, validarFormularioRegistroUsuario, limpiarErroresAlEscribir, mostrarErrorCampo } from './validations.js';

document.addEventListener('DOMContentLoaded', async () => {
    inicializarMenuSesion();
    mostrarNotificacionPendiente(); // ej: "Cambios guardados" al llegar al detalle
    const usuario = obtenerUsuarioActual();

    // Páginas de cuenta no necesitan cargar las iniciativas
    const formLogin = document.getElementById('form-login');
    if (formLogin) {
        configurarLogin(formLogin, usuario);
        return;
    }

    const formRegistroUsuario = document.getElementById('form-registro-usuario');
    if (formRegistroUsuario) {
        configurarRegistroUsuario(formRegistroUsuario, usuario);
        return;
    }

    const contenedorCatalogo = document.getElementById('catalogo-contenedor');
    const inputTexto = document.getElementById('filtro-texto');
    const selectTipo = document.getElementById('filtro-tipo');
    const selectCategoria = document.getElementById('filtro-categoria');
    const selectCompetencia = document.getElementById('filtro-competencia');
    const formFiltros = document.getElementById('form-filtros');
    const tituloResultados = document.getElementById('titulo-resultados');

    const contenedorDetalle = document.getElementById('detalle-contenedor');
    const formEditar = document.getElementById('form-editar-iniciativa');

    const urlParams = new URLSearchParams(window.location.search);
    const idActual = urlParams.get('id');

    try {
        if (contenedorCatalogo) mostrarCarga(contenedorCatalogo);
        if (contenedorDetalle) mostrarCarga(contenedorDetalle);

        await cargarDatos();

        // El catálogo de competencias lo usan el filtro del catálogo y el formulario de edición
        const catalogoCompetencias = (contenedorCatalogo || formEditar) ? await cargarCompetencias() : [];


        // Inicializar Catálogo y Filtrado
        if (contenedorCatalogo) {
            // Las iniciativas privadas solo aparecen para su propietario y su equipo
            const iniciativasVisibles = iniciativasLocales.filter(ini => puedeVerIniciativa(ini, usuario));

            // Las opciones del filtro de competencia salen del catálogo, agrupadas por categoría
            llenarSelectCompetencias(selectCompetencia, catalogoCompetencias);

            renderizarCatalogo(iniciativasVisibles, contenedorCatalogo, usuario);
            if (tituloResultados) tituloResultados.textContent = textoResultados(iniciativasVisibles.length);

            const aplicarFiltros = (e) => {
                // Con Enter en la búsqueda el formulario se envía, la página no se recarga
                if (e) e.preventDefault();
                const texto = inputTexto?.value.trim().toLowerCase() || '';
                const tipo = selectTipo?.value.toLowerCase() || '';
                const categoria = selectCategoria?.value.toLowerCase() || '';
                const competencia = selectCompetencia?.value || '';

                const resultados = iniciativasVisibles.filter(ini => {
                    const coincideTipo = tipo === '' || ini.tipo.toLowerCase() === tipo;
                    const coincideCategoria = categoria === '' || ini.categoria.toLowerCase() === categoria;

                    // La competencia debe estar en la lista de la iniciativa
                    const coincideCompetencia = competencia === '' || (ini.competencias || []).includes(competencia);

                    // la búsqueda de texto usa el título, el resumen y las etiquetas
                    const textoBusqueda = `${ini.titulo} ${ini.resumen} ${(ini.etiquetas || []).join(' ')}`.toLowerCase();
                    const coincideTexto = texto === '' || textoBusqueda.includes(texto);

                    return coincideTexto && coincideTipo && coincideCategoria && coincideCompetencia;
                });

                if (tituloResultados) tituloResultados.textContent = textoResultados(resultados.length);
                renderizarCatalogo(resultados, contenedorCatalogo, usuario);
            };

            // Los filtros se aplican apenas cambia cualquier control.
            // El evento 'input' se dispara al escribir en la búsqueda y al elegir una opción en las listas, una sola escucha en el form
            formFiltros.addEventListener('input', aplicarFiltros);
            formFiltros.addEventListener('submit', aplicarFiltros);

            // Limpiar filtros: reset() devuelve los cuatro controles a su valor inicial y se vuelve a filtrar para mostrar todas las iniciativas
            document.getElementById('btn-limpiar-filtros').addEventListener('click', () => {
                formFiltros.reset();
                aplicarFiltros();
            });
        }

        // Inicializar Página de Detalle
        if (contenedorDetalle) {
            const iniciativa = idActual ? obtenerIniciativaPorId(idActual) : undefined;

            if (!iniciativa) {
                mostrarError(contenedorDetalle, "Iniciativa no encontrada o fue eliminada.");
            } else if (!puedeVerIniciativa(iniciativa, usuario)) {
                mostrarAviso(contenedorDetalle, "Esta iniciativa es privada: solo su propietario y los miembros de su equipo pueden consultarla.");
            } else {
                // si ya pidió unirse, en vez del botón se muestra que su solicitud está pendiente
                const solicitudPendiente = usuario ? buscarSolicitudPendiente(iniciativa.id, usuario.id) : null;
                renderizarDetalle(iniciativa, contenedorDetalle, usuario, solicitudPendiente);
            }
        }

        // Inicializar Página de Edición y Eliminación
        if (formEditar) {
            configurarEdicion(formEditar, idActual, usuario, catalogoCompetencias);
        }

    } catch (error) {
        const mensaje = "Ocurrió un error al cargar los datos. Verifica que estás usando Live Server.";
        if (contenedorCatalogo) mostrarError(contenedorCatalogo, mensaje);
        if (contenedorDetalle) mostrarError(contenedorDetalle, mensaje);
        if (formEditar) mostrarError(document.getElementById('mensaje-edicion'), mensaje);
    }
});

// "1 iniciativa encontrada" / "3 iniciativas encontradas"
function textoResultados(cantidad) {
    return cantidad === 1 ? '1 iniciativa encontrada' : `${cantidad} iniciativas encontradas`;
}

// ----- Modificación y eliminación -----

// catalogo: las competencias de datos/competencias.json
function configurarEdicion(formEditar, idActual, usuario, catalogo) {
    const mensajeEdicion = document.getElementById('mensaje-edicion');
    const tarjetaEdicion = document.getElementById('tarjeta-edicion');
    const iniciativa = idActual ? obtenerIniciativaPorId(idActual) : undefined;

    if (!iniciativa) {
        mostrarError(mensajeEdicion, "La iniciativa no existe o fue eliminada.");
        return;
    }
    if (!usuario) {
        mostrarAviso(mensajeEdicion, `Para modificar o eliminar una iniciativa debes ${enlaceIniciarSesion(`modificacion-y-eliminacion.html?id=${iniciativa.id}`)}.`);
        return;
    }
    if (!esPropietario(iniciativa, usuario)) {
        mostrarAviso(mensajeEdicion, "Solo el propietario de la iniciativa puede modificarla o eliminarla.");
        return;
    }

    const tituloH1 = document.getElementById('titulo-editar');
    if (tituloH1) tituloH1.textContent = `Editar: ${iniciativa.titulo}`;

    // El identificador, el propietario y la fecha de creación no se modifican
    const fechaModificacion = iniciativa.fecha_modificacion || iniciativa.fecha;
    document.getElementById('datos-iniciativa').textContent =
        `Propietario: ${iniciativa.propietario} · Creada el ${formatearFecha(iniciativa.fecha)} · Última modificación: ${formatearFecha(fechaModificacion)}`;

    // Llenar el formulario con los datos actuales
    const campos = formEditar.elements;
    campos.titulo.value = iniciativa.titulo;
    campos.tipo.value = iniciativa.tipo;
    campos.categoria.value = iniciativa.categoria;
    campos.resumen.value = iniciativa.resumen;
    campos.descripcion.value = iniciativa.descripcion || '';
    campos.problema.value = iniciativa.problema || '';
    campos.beneficiarios.value = iniciativa.beneficiarios || '';
    // Las etiquetas guardadas aparecen como chips
    activarEtiquetas(document.getElementById('bloque-etiquetas'), iniciativa.etiquetas || []);
    campos.participantes.value = iniciativa.limite_miembros || '';
    campos.visibilidad.value = iniciativa.nivel_visibilidad;

    // Competencias: listas con el catálogo
    const contenedorCompetencias = document.getElementById('contenedor-competencias');
    const competencias = iniciativa.competencias || [];
    const primeraCompetencia = document.getElementById('competencia-1');
    llenarSelectCompetencias(primeraCompetencia, catalogo);
    seleccionarCompetencia(primeraCompetencia, competencias[0] || '');
    competencias.slice(1).forEach((competencia, indice) => {
        contenedorCompetencias.appendChild(crearFilaCompetencia(indice + 2, catalogo, competencia));
    });
    activarCompetenciasDinamicas(contenedorCompetencias, document.getElementById('btn-agregar-competencia'), catalogo);
    const nombresCatalogo = catalogo.map(competencia => competencia.nombre);

    // La foto actual va en el campo oculto, activarCampoImagen la muestra en vista previa
    campos.imagen.value = iniciativa.imagen || '';
    activarCampoImagen(document.getElementById('bloque-imagen'), imagenPredeterminadaIniciativa(), 800);

    // Contadores de caracteres: arrancan con el largo de los textos guardados
    activarContadores(formEditar);

    // la cantidad estimada no puede ser menor que los miembros ya aceptados
    const miembrosAceptados = (iniciativa.miembros_actuales || []).length;
    document.getElementById('ayuda-participantes').textContent =
        `Entre 1 y 20 personas. El equipo tiene ${miembrosAceptados} ${miembrosAceptados === 1 ? 'miembro' : 'miembros'} (incluido el propietario), así que no puedes indicar menos.`;

    mensajeEdicion.innerHTML = '';
    tarjetaEdicion.hidden = false;

    // Cancelar y Volver: si hay cambios sin guardar se pide confirmación antes de salir
    // Se guarda una "foto" de los datos recién cargados para compararla al momento de salir
    const datosIniciales = JSON.stringify(leerFormularioIniciativa(formEditar));
    const salirDeLaEdicion = (destino) => {
        const hayCambios = JSON.stringify(leerFormularioIniciativa(formEditar)) !== datosIniciales;
        if (!hayCambios) {
            window.location.href = destino;
            return;
        }
        pedirConfirmacion({
            titulo: 'Descartar cambios',
            mensaje: 'Hiciste cambios que todavía no guardaste. Si sales ahora, se perderán.',
            textoConfirmar: 'Descartar cambios',
            textoCancelar: 'Seguir editando',
            alConfirmar: () => { window.location.href = destino; }
        });
    };

    // Cancelar vuelve al detalle de la iniciativa que se estaba editando
    document.getElementById('btn-cancelar-edicion').addEventListener('click', () => {
        salirDeLaEdicion(`detalle-de-iniciativa.html?id=${iniciativa.id}`);
    });
    // Volver es un enlace, se detiene la navegación para revisar si hay cambios
    document.getElementById('btn-volver-edicion').addEventListener('click', (e) => {
        e.preventDefault();
        salirDeLaEdicion(e.currentTarget.getAttribute('href'));
    });

    limpiarErroresAlEscribir(formEditar);

    formEditar.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!validarFormularioIniciativa(formEditar, nombresCatalogo, miembrosAceptados)) return;

        const datosActualizados = {
            ...leerFormularioIniciativa(formEditar),
            fecha_modificacion: fechaDeHoy()
        };

        try {
            actualizarIniciativaLocal(idActual, datosActualizados);
        } catch (error) {
            mostrarError(document.getElementById('mensaje-formulario'), mensajeErrorAlGuardar(error));
            return;
        }

        // toast despues de redirigir
        notificarAlLlegar("¡Cambios guardados con éxito!");
        window.location.href = `detalle-de-iniciativa.html?id=${idActual}`;
    });

    // antes de confirmar enseña el título y la acción que se realizará
    document.getElementById('modal-eliminar-titulo').textContent = iniciativa.titulo;
    document.getElementById('btn-eliminar-confirmado').addEventListener('click', () => {
        eliminarIniciativaLocal(idActual);
        notificarAlLlegar(`La iniciativa "${iniciativa.titulo}" fue eliminada.`);
        window.location.href = 'catalogo-de-iniciativas.html';
    });
}

// ----- Inicio de sesión y registro de usuario -----

// Página a la que se vuelve después de entrar
function paginaDeRegreso(paginaPorDefecto) {
    const volver = new URLSearchParams(window.location.search).get('volver');
    if (volver && /^[a-z0-9-]+\.html(\?id=\d+)?$/.test(volver)) {
        return volver;
    }
    return paginaPorDefecto;
}

function configurarLogin(formLogin, usuario) {
    const mensaje = document.getElementById('mensaje-login');
    const boton = formLogin.querySelector('button[type="submit"]');

    // El enlace para crear cuenta conserva la página de regreso (?volver=...)
    const enlaceRegistro = document.getElementById('enlace-registro');
    enlaceRegistro.href = `registro-de-usuario.html${window.location.search}`;

    if (usuario) {
        formLogin.hidden = true;
        enlaceRegistro.closest('p').hidden = true;
        mostrarAviso(mensaje, `Ya iniciaste sesión como <strong>${escaparHTML(usuario.nombre)}</strong>. <a href="perfil-de-usuario.html" class="alert-link">Ir a mi perfil</a>`);
        return;
    }

    limpiarErroresAlEscribir(formLogin);

    formLogin.addEventListener('submit', async (e) => {
        e.preventDefault();
        mensaje.innerHTML = '';
        if (!validarFormularioLogin(formLogin)) return;

        boton.disabled = true;
        boton.textContent = 'Ingresando...';

        try {
            const usuarioEncontrado = await iniciarSesion(formLogin.elements.correo.value, formLogin.elements.contrasena.value);

            if (!usuarioEncontrado) {
                mostrarError(mensaje, 'Correo o contraseña incorrectos.');
                formLogin.elements.contrasena.value = '';
                formLogin.elements.contrasena.focus();
                return;
            }

            window.location.href = paginaDeRegreso('../index.html');
        } catch (error) {
            mostrarError(mensaje, 'No se pudieron cargar los usuarios. Verifica que estás usando Live Server.');
        } finally {
            boton.disabled = false;
            boton.textContent = 'Iniciar sesión';
        }
    });
}

function configurarRegistroUsuario(formRegistro, usuario) {
    const mensaje = document.getElementById('mensaje-registro');
    const boton = formRegistro.querySelector('button[type="submit"]');

    const enlaceLogin = document.getElementById('enlace-login');
    enlaceLogin.href = `iniciar-sesion.html${window.location.search}`;

    if (usuario) {
        formRegistro.hidden = true;
        enlaceLogin.closest('p').hidden = true;
        mostrarAviso(mensaje, `Ya iniciaste sesión como <strong>${escaparHTML(usuario.nombre)}</strong>. Cierra la sesión si quieres crear otra cuenta.`);
        return;
    }

    // Foto de perfil opcional con vista previa (se muestra a 150 px, se guarda a 300 px)
    activarCampoImagen(document.getElementById('bloque-foto'), avatarPredeterminado(), 300);
    limpiarErroresAlEscribir(formRegistro);

    formRegistro.addEventListener('submit', async (e) => {
        e.preventDefault();
        mensaje.innerHTML = '';
        if (!validarFormularioRegistroUsuario(formRegistro)) return;

        const campos = formRegistro.elements;
        boton.disabled = true;
        boton.textContent = 'Creando cuenta...';

        try {
            const nuevoUsuario = await registrarUsuario({
                nombre: campos.nombre.value.trim(),
                primer_apellido: campos.primer_apellido.value.trim(),
                segundo_apellido: campos.segundo_apellido.value.trim(),
                correo: campos.correo.value.trim().toLowerCase(),
                contrasena: campos.contrasena.value,
                tipo_miembro: campos.tipo_miembro.value,
                carrera: campos.carrera.value.trim(),
                foto: campos.foto.value // foto ya reducida, o '' si no eligió una
            });

            // el correo ya pertenece a otra cuenta
            if (!nuevoUsuario) {
                mostrarErrorCampo(campos.correo, 'Ya existe una cuenta con este correo.');
                campos.correo.focus();
                return;
            }

            notificarAlLlegar(`¡Tu cuenta fue creada, ${nuevoUsuario.nombre}! Ya iniciaste sesión.`);
            window.location.href = paginaDeRegreso('perfil-de-usuario.html');
        } catch (error) {
            mostrarError(mensaje, esErrorDeEspacio(error)
                ? mensajeErrorAlGuardar(error)
                : 'No se pudo crear la cuenta porque no se cargaron los usuarios. Verifica que estás usando Live Server.');
        } finally {
            boton.disabled = false;
            boton.textContent = 'Crear cuenta';
        }
    });
}