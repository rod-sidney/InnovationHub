// CampoImagen.jsx
// Elegir una foto con vista previa
// La foto se reduce en el navegador (utils/imagenes.js) y el resultado (data URL) se entrega al formulario padre, es un campo controlado

import { useState } from 'react';

import { leerImagenReducida } from '../../utils/imagenes.js';

const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MEGAS_MAXIMOS = 10;

// redonda: foto de perfil
// si no, portada rectangular de una iniciativa
function CampoImagen({ id, etiqueta, valor, onCambiar, ladoMaximo, redonda = false, error }) {
    const [errorArchivo, setErrorArchivo] = useState('');
    const [procesando, setProcesando] = useState(false);

    async function elegirArchivo(evento) {
        const archivo = evento.target.files[0];
        evento.target.value = '';   // permite volver a elegir el mismo archivo después

        if (!archivo) {
            return;
        }

        if (!TIPOS_PERMITIDOS.includes(archivo.type)) {
            setErrorArchivo('Elige una imagen JPG, PNG, WEBP o GIF.');
            return;
        }

        if (archivo.size > MEGAS_MAXIMOS * 1024 * 1024) {
            setErrorArchivo(`La imagen no puede pesar más de ${MEGAS_MAXIMOS} MB.`);
            return;
        }

        setErrorArchivo('');
        setProcesando(true);
        try {
            const reducida = await leerImagenReducida(archivo, ladoMaximo);
            onCambiar(reducida);
        } catch {
            setErrorArchivo('No se pudo leer la imagen. Prueba con otro archivo.');
        } finally {
            setProcesando(false);
        }
    }

    const mensajeError = errorArchivo || error;
    const vistaPrevia = valor || (redonda ? '/img/avatar.svg' : '/img/iniciativa.svg');

    return (
        <div className="d-flex flex-column flex-sm-row align-items-sm-center gap-3 mb-4">
            {redonda ? (
                <img
                    src={vistaPrevia}
                    alt="Vista previa de la foto"
                    width="96"
                    height="96"
                    className="avatar border border-3 border-white shadow-sm flex-shrink-0"
                />
            ) : (
                <div className="ratio ratio-16x9 flex-shrink-0" style={{ maxWidth: '220px' }}>
                    <img src={vistaPrevia} alt="Vista previa de la imagen" className="rounded object-fit-cover" />
                </div>
            )}

            <div className="flex-grow-1">
                <label htmlFor={id} className="form-label fw-semibold">{etiqueta}</label>
                <input
                    id={id}
                    type="file"
                    className={`form-control ${mensajeError ? 'is-invalid' : ''}`}
                    accept={TIPOS_PERMITIDOS.join(', ')}
                    aria-describedby={`${id}-ayuda`}
                    onChange={elegirArchivo}
                />
                <div id={`${id}-ayuda`} className="form-text">
                    Opcional. JPG, PNG, WEBP o GIF de hasta {MEGAS_MAXIMOS} MB.
                    {procesando && ' Reduciendo la imagen...'}
                </div>
                {mensajeError && <div className="invalid-feedback d-block">{mensajeError}</div>}
                {valor && (
                    <button type="button" className="btn btn-link btn-sm px-0" onClick={() => onCambiar(null)}>
                        Quitar imagen
                    </button>
                )}
            </div>
        </div>
    );
}

export default CampoImagen;
