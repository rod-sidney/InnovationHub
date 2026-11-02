// Propósito: validación propia de los formularios
// Los errores se muestran con las clases de Bootstrap is-invalid e invalid-feedback

export const TIPOS_INICIATIVA = ['Idea', 'Necesidad', 'Reto'];
export const NIVELES_VISIBILIDAD = ['Pública', 'Institucional', 'Restringida', 'Privada'];
export const TIPOS_MIEMBRO = ['Estudiante', 'Docente', 'Administrativo'];
export const DISPONIBILIDADES = ['Menos de 5 horas semanales', '5 a 10 horas semanales', 'Más de 10 horas semanales'];

const PATRON_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PATRON_NOMBRE = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' -]+$/;

const TIPOS_IMAGEN = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MEGAS_MAXIMOS_IMAGEN = 10;

// ----- Mostrar y limpiar errores -----
export function mostrarErrorCampo(campo, mensaje) {
    campo.classList.add('is-invalid');
    campo.setAttribute('aria-invalid', 'true');

    let error = document.getElementById(`error-${campo.id}`);
    if (!error) {
        error = document.createElement('div');
        error.id = `error-${campo.id}`;
        error.className = 'invalid-feedback';

        // En las filas de competencias y en las casillas el mensaje va al final del contenedor
        const contenedor = campo.closest('.input-group, .form-check');
        if (contenedor) {
            contenedor.appendChild(error);
        } else {
            campo.insertAdjacentElement('afterend', error);
        }

        const descritoPor = campo.getAttribute('aria-describedby');
        campo.setAttribute('aria-describedby', descritoPor ? `${descritoPor} ${error.id}` : error.id);
    }
    error.textContent = mensaje;
}

export function limpiarErrorCampo(campo) {
    campo.classList.remove('is-invalid');
    campo.removeAttribute('aria-invalid');
    const error = document.getElementById(`error-${campo.id}`);
    if (error) error.textContent = '';
}

// Solo una escucha en el formulario limpia el error del campo que se está corrigiendo
export function limpiarErroresAlEscribir(form) {
    form.addEventListener('input', (e) => {
        if (e.target.classList.contains('is-invalid')) {
            limpiarErrorCampo(e.target);
        }
    });
}

// Si hay errores, mueve el foco al primer campo inválido
function resultadoFinal(form, resultados) {
    const esValido = resultados.every(resultado => resultado === true);
    if (!esValido) {
        form.querySelector('.is-invalid')?.focus();
    }
    return esValido;
}

// ----- Reglas reutilizables -----

function primeraMayuscula(texto) {
    return texto.charAt(0).toUpperCase() + texto.slice(1);
}

// nombre: 'el título', 'la descripción', etc.
function validarTexto(campo, nombre, minimo, maximo, obligatorio = true) {
    const valor = campo.value.trim();

    if (valor === '') {
        if (obligatorio) {
            mostrarErrorCampo(campo, `Escribe ${nombre}.`);
            return false;
        }
    } else if (valor.length < minimo) {
        mostrarErrorCampo(campo, `${primeraMayuscula(nombre)} debe tener al menos ${minimo} caracteres (llevas ${valor.length}).`);
        return false;
    } else if (valor.length > maximo) {
        mostrarErrorCampo(campo, `${primeraMayuscula(nombre)} no puede superar los ${maximo} caracteres (llevas ${valor.length}).`);
        return false;
    }

    limpiarErrorCampo(campo);
    return true;
}

function validarSeleccion(campo, mensaje, opcionesValidas) {
    if (campo.value === '') {
        mostrarErrorCampo(campo, mensaje);
        return false;
    }
    if (!opcionesValidas.includes(campo.value)) {
        mostrarErrorCampo(campo, 'La opción elegida no es válida. Selecciona una de la lista.');
        return false;
    }
    limpiarErrorCampo(campo);
    return true;
}

// Devuelve el mensaje de error de la foto elegida, o '' si es válida.
// Se usa en los formularios y también en el perfil (donde la foto se cambia sin formulario)
export function revisarImagen(archivo) {
    if (!TIPOS_IMAGEN.includes(archivo.type)) {
        return 'La foto debe ser una imagen JPG, PNG, WEBP o GIF.';
    }

    const megas = archivo.size / (1024 * 1024);
    if (megas > MEGAS_MAXIMOS_IMAGEN) {
        return `La foto no puede pesar más de ${MEGAS_MAXIMOS_IMAGEN} MB (pesa ${megas.toFixed(1)} MB).`;
    }
    return '';
}

// La foto es opcional, solo se revisa si se eligió un archivo
export function validarImagen(campo) {
    const archivo = campo.files[0];
    const mensaje = archivo ? revisarImagen(archivo) : '';

    if (mensaje !== '') {
        mostrarErrorCampo(campo, mensaje);
        return false;
    }
    limpiarErrorCampo(campo);
    return true;
}

function validarCorreo(campo) {
    const valor = campo.value.trim();

    if (valor === '') {
        mostrarErrorCampo(campo, 'Escribe tu correo electrónico.');
        return false;
    }
    if (!PATRON_CORREO.test(valor)) {
        mostrarErrorCampo(campo, 'El correo no tiene un formato válido (ejemplo: nombre@ucenfotec.ac.cr).');
        return false;
    }
    limpiarErrorCampo(campo);
    return true;
}

// ----- Formulario de iniciativa (registro y edición) -----

// "IoT, UX , ,Python" -> ["IoT", "UX", "Python"]
export function separarEtiquetas(texto) {
    return texto.split(',').map(etiqueta => etiqueta.trim()).filter(etiqueta => etiqueta !== '');
}

const MAXIMO_ETIQUETAS = 8;
const LARGO_MAXIMO_ETIQUETA = 30;

// Revisa una etiqueta antes de agregarla como chip (validación inmediata)
// Devuelve el mensaje de error, o '' si se puede agregar
export function revisarEtiqueta(texto, etiquetasActuales) {
    if (etiquetasActuales.length >= MAXIMO_ETIQUETAS) {
        return `Puedes agregar como máximo ${MAXIMO_ETIQUETAS} etiquetas.`;
    }
    if (texto.length > LARGO_MAXIMO_ETIQUETA) {
        return `Cada etiqueta puede tener como máximo ${LARGO_MAXIMO_ETIQUETA} caracteres. Revisa "${texto}".`;
    }
    if (etiquetasActuales.some(etiqueta => etiqueta.toLowerCase() === texto.toLowerCase())) {
        return `La etiqueta "${texto}" ya está agregada.`;
    }
    return '';
}

// Al enviar, si quedó texto escrito sin agregar se avisa, y se revisa la lista guardada en el campo oculto
function validarEtiquetas(campoTexto, campoOculto) {
    if (campoTexto.value.trim() !== '') {
        mostrarErrorCampo(campoTexto, 'Presiona Enter para agregar la etiqueta que escribiste, o borra el texto.');
        return false;
    }

    const etiquetas = separarEtiquetas(campoOculto.value);
    if (etiquetas.length > MAXIMO_ETIQUETAS || etiquetas.some(etiqueta => etiqueta.length > LARGO_MAXIMO_ETIQUETA)) {
        mostrarErrorCampo(campoTexto, `Puedes tener como máximo ${MAXIMO_ETIQUETAS} etiquetas de ${LARGO_MAXIMO_ETIQUETA} caracteres.`);
        return false;
    }

    limpiarErrorCampo(campoTexto);
    return true;
}

// No se permite indicar menos integrantes que los miembros ya aceptados
function validarParticipantes(campo, miembrosAceptados) {
    // input type="number"
    if (campo.validity.badInput) {
        mostrarErrorCampo(campo, 'Escribe solo números.');
        return false;
    }

    const texto = campo.value.trim();
    if (texto === '') {
        limpiarErrorCampo(campo);
        return true;
    }

    const cantidad = Number(texto);
    if (!Number.isInteger(cantidad) || cantidad < 1 || cantidad > 20) {
        mostrarErrorCampo(campo, 'La cantidad estimada debe ser un número entero entre 1 y 20.');
        return false;
    }
    if (cantidad < miembrosAceptados) {
        mostrarErrorCampo(campo, `El equipo ya tiene ${miembrosAceptados} miembros aceptados, así que la cantidad no puede ser menor.`);
        return false;
    }

    limpiarErrorCampo(campo);
    return true;
}

const MENSAJE_COMPETENCIA_REPETIDA = 'Esta competencia ya está en la lista.';

// competenciasDelCatalogo: los nombres válidos (competencias.json)
function validarCompetencias(form, competenciasDelCatalogo) {
    const campos = Array.from(form.querySelectorAll('select[name="competencias[]"]'));
    const yaElegidas = [];
    let esValido = true;

    campos.forEach((campo, indice) => {
        const valor = campo.value;

        if (valor === '') {
            mostrarErrorCampo(campo, indice === 0
                ? 'Selecciona al menos una competencia requerida.'
                : 'Selecciona una competencia o elimina este campo.');
            esValido = false;
        } else if (!competenciasDelCatalogo.includes(valor)) {
            mostrarErrorCampo(campo, 'Esta competencia no está en el catálogo. Elige una de la lista.');
            esValido = false;
        } else if (yaElegidas.includes(valor)) {
            mostrarErrorCampo(campo, MENSAJE_COMPETENCIA_REPETIDA);
            esValido = false;
        } else {
            limpiarErrorCampo(campo);
        }

        yaElegidas.push(valor);
    });

    return esValido;
}

// Validación cada vez que se elige o se quita una competencia
// marca las repetidas y quita el aviso a las que dejaron de estar repetidas
export function revisarCompetenciasRepetidas(contenedor) {
    const yaElegidas = [];

    contenedor.querySelectorAll('select[name="competencias[]"]').forEach(campo => {
        const error = document.getElementById(`error-${campo.id}`);

        if (campo.value !== '' && yaElegidas.includes(campo.value)) {
            mostrarErrorCampo(campo, MENSAJE_COMPETENCIA_REPETIDA);
        } else if (error && error.textContent === MENSAJE_COMPETENCIA_REPETIDA) {
            limpiarErrorCampo(campo);
        }

        yaElegidas.push(campo.value);
    });
}

// competenciasDelCatalogo: nombres válidos de competencias
// miembrosAceptados: tamaño actual del equipo, al registrar solo está el propietario
export function validarFormularioIniciativa(form, competenciasDelCatalogo, miembrosAceptados = 1) {
    const campos = form.elements;
    const categoriasValidas = Array.from(campos.categoria.options)
        .map(opcion => opcion.value)
        .filter(valor => valor !== '');

    // Se validan todos los campos para mostrar todos los errores juntos
    const resultados = [
        validarTexto(campos.titulo, 'el título', 0, 100),
        validarSeleccion(campos.tipo, 'Selecciona el tipo de iniciativa.', TIPOS_INICIATIVA),
        validarSeleccion(campos.categoria, 'Selecciona una categoría.', categoriasValidas),
        validarImagen(campos['archivo-imagen']),
        validarTexto(campos.resumen, 'el resumen', 0, 300),
        validarTexto(campos.descripcion, 'la descripción', 0, 3000),
        validarTexto(campos.problema, 'el problema identificado', 0, 1000, false),
        validarTexto(campos.beneficiarios, 'el campo de beneficiarios', 0, 150, false),
        validarEtiquetas(campos['nueva-etiqueta'], campos.etiquetas),
        validarParticipantes(campos.participantes, miembrosAceptados),
        validarSeleccion(campos.visibilidad, 'Selecciona el nivel de visibilidad.', NIVELES_VISIBILIDAD),
        validarCompetencias(form, competenciasDelCatalogo)
    ];

    return resultadoFinal(form, resultados);
}

// ----- Formulario de solicitud de participación -----

// competenciasValidas: las competencias que requiere la iniciativa
export function validarFormularioSolicitud(form, competenciasValidas) {
    const campos = form.elements;

    const resultados = [
        validarTexto(campos.rol, 'el rol que deseas desempeñar', 0, 60),
        validarSeleccion(campos.competencia, 'Selecciona la competencia principal que aportas.', competenciasValidas),
        validarSeleccion(campos.disponibilidad, 'Selecciona tu disponibilidad de tiempo.', DISPONIBILIDADES),
        validarTexto(campos.mensaje, 'tu mensaje de presentación', 0, 500)
    ];

    return resultadoFinal(form, resultados);
}

// ----- Formularios de cuenta -----

export function validarFormularioLogin(form) {
    const campos = form.elements;
    let contrasenaValida = true;

    if (campos.contrasena.value === '') {
        mostrarErrorCampo(campos.contrasena, 'Escribe tu contraseña.');
        contrasenaValida = false;
    } else {
        limpiarErrorCampo(campos.contrasena);
    }

    return resultadoFinal(form, [validarCorreo(campos.correo), contrasenaValida]);
}

function validarNombre(campo, nombre, obligatorio) {
    if (!validarTexto(campo, nombre, 2, 40, obligatorio)) {
        return false;
    }

    const valor = campo.value.trim();
    if (valor !== '' && !PATRON_NOMBRE.test(valor)) {
        mostrarErrorCampo(campo, `${primeraMayuscula(nombre)} solo puede tener letras, espacios, apóstrofos o guiones.`);
        return false;
    }
    return true;
}

function validarContrasena(campo) {
    const valor = campo.value;

    if (valor === '') {
        mostrarErrorCampo(campo, 'Escribe una contraseña.');
        return false;
    }
    if (valor.length < 8) {
        mostrarErrorCampo(campo, `La contraseña debe tener al menos 8 caracteres (llevas ${valor.length}).`);
        return false;
    }
    if (!/[A-Za-z]/.test(valor) || !/[0-9]/.test(valor)) {
        mostrarErrorCampo(campo, 'La contraseña debe combinar letras y números.');
        return false;
    }
    limpiarErrorCampo(campo);
    return true;
}

function validarConfirmacion(campo, campoContrasena) {
    if (campo.value === '') {
        mostrarErrorCampo(campo, 'Vuelve a escribir la contraseña para confirmarla.');
        return false;
    }
    if (campo.value !== campoContrasena.value) {
        mostrarErrorCampo(campo, 'Las contraseñas no coinciden.');
        return false;
    }
    limpiarErrorCampo(campo);
    return true;
}

function validarTerminos(campo) {
    if (!campo.checked) {
        mostrarErrorCampo(campo, 'Debes aceptar los términos de uso para crear la cuenta.');
        return false;
    }
    limpiarErrorCampo(campo);
    return true;
}

// Que el correo no esté repetido
export function validarFormularioRegistroUsuario(form) {
    const campos = form.elements;

    const resultados = [
        validarImagen(campos['archivo-foto']),
        validarNombre(campos.nombre, 'tu nombre', true),
        validarNombre(campos.primer_apellido, 'tu primer apellido', true),
        validarNombre(campos.segundo_apellido, 'tu segundo apellido', false),
        validarCorreo(campos.correo),
        validarContrasena(campos.contrasena),
        validarConfirmacion(campos.confirmacion, campos.contrasena),
        validarSeleccion(campos.tipo_miembro, 'Selecciona el tipo de miembro.', TIPOS_MIEMBRO),
        validarTexto(campos.carrera, 'tu carrera o área profesional', 3, 80),
        validarTerminos(campos.terminos)
    ];

    return resultadoFinal(form, resultados);
}
