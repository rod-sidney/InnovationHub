import { cargarDatos, iniciativasLocales, eliminarIniciativaLocal, obtenerIniciativaPorId, actualizarIniciativaLocal } from './api.js';
import { renderizarCatalogo, mostrarCarga, mostrarError, renderizarDetalle } from './ui.js';
import { inicializarFormulario } from './validations.js';

document.addEventListener('DOMContentLoaded', async () => {
    // Referencias al DOM del Catálogo
    const contenedorCatalogo = document.getElementById('catalogo-contenedor');
    const selectTipo = document.getElementById('filtro-tipo');
    const selectCategoria = document.getElementById('filtro-categoria');
    const inputCompetencia = document.getElementById('filtro-competencia');
    const formFiltros = document.getElementById('form-filtros');
    const tituloResultados = document.getElementById('titulo-resultados');

    // Referencias al DOM del Detalle
    const contenedorDetalle = document.getElementById('detalle-contenedor');

    // Referencias al DOM de Edición/Eliminación
    const formEditar = document.getElementById('form-editar-iniciativa');
    const btnEliminarConfirmado = document.getElementById('btn-eliminar-confirmado');

    // Obtener el ID de la URL si estamos en detalle o edición
    const urlParams = new URLSearchParams(window.location.search);
    const idActual = urlParams.get('id');

    try {
        await cargarDatos();

        //Inicializar Catálogo y Filtrado
        if (contenedorCatalogo) {
            renderizarCatalogo(iniciativasLocales, contenedorCatalogo);
            if (tituloResultados) tituloResultados.textContent = `${iniciativasLocales.length} iniciativas encontradas`;

            const aplicarFiltros = (e) => {
                if (e) e.preventDefault();
                const tipo = selectTipo?.value.toLowerCase() || '';
                const categoria = selectCategoria?.value.toLowerCase() || '';
                const competencia = inputCompetencia?.value.toLowerCase() || '';

                const resultados = iniciativasLocales.filter(ini => {
                    const coincideTipo = tipo === '' || ini.tipo.toLowerCase() === tipo;
                    const coincideCategoria = categoria === '' || ini.categoria.toLowerCase() === categoria;

                    // Buscar en título, resumen y array de competencias
                    const textoBusqueda = `${ini.titulo} ${ini.resumen} ${(ini.competencias || []).join(' ')}`.toLowerCase();
                    const coincideCompetencia = competencia === '' || textoBusqueda.includes(competencia);

                    return coincideTipo && coincideCategoria && coincideCompetencia;
                });

                if (tituloResultados) tituloResultados.textContent = `${resultados.length} iniciativas encontradas`;
                renderizarCatalogo(resultados, contenedorCatalogo);
            };

            selectTipo?.addEventListener('change', aplicarFiltros);
            selectCategoria?.addEventListener('change', aplicarFiltros);
            inputCompetencia?.addEventListener('input', aplicarFiltros);
            formFiltros?.addEventListener('submit', aplicarFiltros);
        }

        //Inicializar Página de Detalle
        if (contenedorDetalle && idActual) {
            const iniciativa = obtenerIniciativaPorId(idActual);
            if (iniciativa) {
                renderizarDetalle(iniciativa, contenedorDetalle);
            } else {
                mostrarError(contenedorDetalle, "Iniciativa no encontrada o fue eliminada.");
            }
        }

        //Inicializar Página de Edición y Eliminación
        if (formEditar && idActual) {
            const iniciativa = obtenerIniciativaPorId(idActual);
            if (iniciativa) {
                // Pre-llenar datos
                document.getElementById('titulo').value = iniciativa.titulo;
                document.getElementById('tipo').value = iniciativa.tipo.toLowerCase();
                document.getElementById('categoria').value = iniciativa.categoria.toLowerCase();
                document.getElementById('resumen').value = iniciativa.resumen;
                document.getElementById('descripcion').value = iniciativa.descripcion || iniciativa.resumen;

                const tituloH1 = document.getElementById('titulo-editar');
                if (tituloH1) tituloH1.textContent = `Editar: ${iniciativa.titulo}`;

                // Evento Guardar
                formEditar.addEventListener('submit', (e) => {
                    e.preventDefault();
                    const datosActualizados = {
                        titulo: document.getElementById('titulo').value,
                        tipo: document.getElementById('tipo').options[document.getElementById('tipo').selectedIndex].text,
                        categoria: document.getElementById('categoria').options[document.getElementById('categoria').selectedIndex].text,
                        resumen: document.getElementById('resumen').value,
                        descripcion: document.getElementById('descripcion').value
                    };
                    actualizarIniciativaLocal(idActual, datosActualizados);
                    alert("¡Cambios guardados con éxito!");
                    window.location.href = `detalle-de-iniciativa.html?id=${idActual}`;
                });

                // Evento Eliminar
                if (btnEliminarConfirmado) {
                    btnEliminarConfirmado.addEventListener('click', () => {
                        eliminarIniciativaLocal(idActual);
                        window.location.href = 'catalogo-de-iniciativas.html';
                    });
                }
            } else {
                formEditar.innerHTML = `<div class="alert alert-danger">La iniciativa no existe.</div>`;
            }
        }

    } catch (error) {
        if (contenedorCatalogo) mostrarError(contenedorCatalogo, "Ocurrió un error al cargar los datos. Verifica que estás usando Live Server.");
    }

    // Inicializar formularios externos
    inicializarFormulario();
});