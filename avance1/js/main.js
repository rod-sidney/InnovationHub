// Propósito: Lógica principal de la aplicación 
document.addEventListener('DOMContentLoaded', () => {
    inicializarAplicacion();
});

//Función principal que se encarga de cargar datos y funcionalidades segun la página
async function inicializarAplicacion() {
    await cargarDatosIniciales();

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
}

// Simula una base de datos utilizando localStorage
async function cargarDatosIniciales() {
    // Determinar la ruta base 
    const esSubcarpeta = window.location.pathname.includes('/paginas/');
    const rutaBase = esSubcarpeta ? '../' : './';

    // Cargar Iniciativas si no existen 
    if (!localStorage.getItem('iniciativas')) {
        try {
            const response = await fetch(rutaBase + 'iniciativas_2.json');
            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('iniciativas', JSON.stringify(data));
            } else {
                console.error("Error al leer el archivo JSON de iniciativas.");
            }
        } catch (error) {
            console.error("Error de red al cargar iniciativas:", error);
        }
    }

    // Cargar Categorías si no existen 
    if (!localStorage.getItem('categorias')) {
        try {
            const response = await fetch(rutaBase + 'categorias_2.json');
            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('categorias', JSON.stringify(data));
            } else {
                console.error("Error al leer el archivo JSON de categorías.");
            }
        } catch (error) {
            console.error("Error de red al cargar categorías:", error);
        }
    }
}

//Inyecta las iniciativas en el HTML de la página de inicio
function renderizarIniciativasInicio() {
    const contenedor = document.getElementById('contenedor-iniciativas-recientes');
    const iniciativasStr = localStorage.getItem('iniciativas');

    if (!iniciativasStr) return;

    let iniciativas = JSON.parse(iniciativasStr);

    // Ordenar de la más nueva a la más antigua por id
    iniciativas.sort((a, b) => b.id - a.id);

    // Tomar solo las primeras 3 para el index
    const iniciativasRecientes = iniciativas.slice(0, 3);

    contenedor.innerHTML = '';

    iniciativasRecientes.forEach(ini => {
        const imagenUrl = `https://picsum.photos/id/${10 + ini.id}/300/200`;

        //html
        const cardHTML = `
            <div class="col-12 col-md-6 col-lg-4">
                <article class="card h-100 card-iniciativa shadow-sm">
                    <img src="${imagenUrl}" class="card-img-top" alt="Vista previa de ${ini.titulo}">
                    <div class="card-header bg-secondary fw-bold text-dark border-0 text-capitalize">
                        ${ini.tipo} · ${ini.categoria}
                    </div>
                    <div class="card-body">
                        <h3 class="card-title h5">${ini.titulo}</h3>
                        <p class="card-text">${ini.resumen}</p>
                    </div>
                    <div class="card-footer bg-white border-0">
                        <small class="text-muted d-block mb-3">Por <strong>${ini.propietario || 'Usuario Anónimo'}</strong> · <time datetime="${ini.fecha}">${formatearFecha(ini.fecha)}</time></small>
                        <a href="paginas/detalle-de-iniciativa.html?id=${ini.id}" class="btn btn-outline-primary w-100">Ver iniciativa</a>
                    </div>
                </article>
            </div>
        `;
        contenedor.innerHTML += cardHTML;
    });
}

//Configura la interactividad y envío del formulario de registro de iniciativas
function configurarFormularioRegistro() {
    const formulario = document.getElementById('form-registro-iniciativa');
    const btnAgregarCompetencia = document.getElementById('btn-agregar-competencia');
    const contenedorCompetencias = document.getElementById('contenedor-competencias');
    let contadorCompetencias = 1;

    //añadir campos dinámicos de competencias
    btnAgregarCompetencia.addEventListener('click', () => {
        contadorCompetencias++;
        const nuevoDiv = document.createElement('div');
        nuevoDiv.className = 'input-group mb-2';
        nuevoDiv.innerHTML = `
            <input type="text" name="competencias[]" class="form-control" placeholder="Añade otra competencia" required>
            <button class="btn btn-outline-danger btn-eliminar-competencia" type="button" aria-label="Eliminar competencia">Eliminar</button>
        `;
        contenedorCompetencias.appendChild(nuevoDiv);
    });

    contenedorCompetencias.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-eliminar-competencia')) {
            e.target.parentElement.remove();
        }
    });

    //guardar formulario
    formulario.addEventListener('submit', (e) => {
        e.preventDefault();

        // Capturar datos from
        const formData = new FormData(formulario);

        // array competencias
        const inputsCompetencias = document.querySelectorAll('input[name="competencias[]"]');
        const competenciasArreglo = Array.from(inputsCompetencias).map(input => input.value).filter(val => val.trim() !== '');

        // BD
        let iniciativas = JSON.parse(localStorage.getItem('iniciativas')) || [];

        // Crear objeto nueva iniciativa
        const nuevaIniciativa = {
            id: iniciativas.length ? Math.max(...iniciativas.map(i => i.id)) + 1 : 1,
            titulo: formData.get('titulo'),
            tipo: formData.get('tipo'),
            categoria: formData.get('categoria'),
            propietario: "Carla Montero",
            resumen: formData.get('resumen'),
            descripcion: formData.get('descripcion'),
            fecha: new Date().toISOString().split('T')[0], // YYYY-MM-DD
            nivel_visibilidad: formData.get('visibilidad'),
            competencias: competenciasArreglo,
            miembros_actuales: ["Carla Montero"],
            limite_miembros: parseInt(formData.get('participantes')) || null,
            estado: "Abierta"
        };

        //guardar
        iniciativas.push(nuevaIniciativa);
        localStorage.setItem('iniciativas', JSON.stringify(iniciativas));

        alert('¡Iniciativa publicada con éxito! Será visible en la página principal.');

        //volver a catálogo o index
        window.location.href = '../index.html';
    });
}

//formulario de postulación a una iniciativa
function configurarFormularioSolicitud() {
    const formulario = document.getElementById('form-solicitud');

    const parametros = new URLSearchParams(window.location.search);
    const idIniciativa = parametros.get('id');

    const btnVolver = document.querySelector('a.btn-outline-primary[href="detalle-de-iniciativa.html"]');
    const btnCancelar = document.querySelector('a.btn-link[href="detalle-de-iniciativa.html"]');
    const textoIniciativaFormulario = document.querySelector('.card-header p strong');

    if (idIniciativa) {
        // Actualizar las rutas para que devuelvan a la página de detalle correcta
        const urlDestino = `detalle-de-iniciativa.html?id=${idIniciativa}`;
        if (btnVolver) btnVolver.href = urlDestino;
        if (btnCancelar) btnCancelar.href = urlDestino;

        // (Opcional) Cargar el título real de la iniciativa desde localStorage
        const iniciativasStr = localStorage.getItem('iniciativas');
        if (iniciativasStr && textoIniciativaFormulario) {
            const iniciativas = JSON.parse(iniciativasStr);
            const iniciativaActual = iniciativas.find(i => i.id == idIniciativa);
            if (iniciativaActual) {
                textoIniciativaFormulario.textContent = iniciativaActual.titulo;
            }
        }
    } else {
        // Fallback: Si alguien entra a la página sin un ID en la URL, los botones lo llevarán al catálogo
        if (btnVolver) btnVolver.href = "catalogo-de-iniciativas.html";
        if (btnCancelar) btnCancelar.href = "catalogo-de-iniciativas.html";
    }

    if (formulario) {
        formulario.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Tu solicitud ha sido enviada al creador de la iniciativa con éxito. Te notificaremos cuando haya una respuesta.');
            window.location.href = '../index.html';
        });
    }
}

//formatear fechas de YYYY-MM-DD a texto
function formatearFecha(fechaIso) {
    const opciones = { year: 'numeric', month: 'long', day: 'numeric' };
    const fecha = new Date(fechaIso + 'T00:00:00');
    return fecha.toLocaleDateString('es-ES', opciones);
}