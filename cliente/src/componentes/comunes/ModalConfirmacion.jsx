// ModalConfirmacion.jsx
// Ventana para confirmar acciones importantes (eliminar, archivar, retirar a alguien, resolver una solicitud)
// React decide si se muestra con la prop abierto: no se usa el JavaScript de Bootstrap
// children permite agregar contenido, por ejemplo un campo de motivo

import { useEffect, useRef } from 'react';

function ModalConfirmacion({
    abierto,
    titulo,
    textoConfirmar = 'Confirmar',
    variante = 'danger',
    procesando = false,
    onConfirmar,
    onCancelar,
    children
}) {
    // useRef guarda una referencia al botón para poder darle el foco
    const botonCancelar = useRef(null);

    // Al abrirse, el foco va a "Cancelar", la opción segura queda a mano del teclado
    useEffect(() => {
        if (abierto && botonCancelar.current) {
            botonCancelar.current.focus();
        }
    }, [abierto]);

    // Mientras está abierto, la tecla Escape lo cierra
    useEffect(() => {
        if (!abierto) {
            return;
        }

        function alPresionarTecla(evento) {
            if (evento.key === 'Escape') {
                onCancelar();
            }
        }

        document.addEventListener('keydown', alPresionarTecla);

        // al cerrarse el modal se quita la escucha del teclado
        return () => document.removeEventListener('keydown', alPresionarTecla);
    }, [abierto, onCancelar]);

    if (!abierto) {
        return null;
    }

    return (
        <div className="modal modal-abierto" role="dialog" aria-modal="true" aria-labelledby="titulo-modal">
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content border-0 shadow">
                    <div className="modal-header">
                        <h2 id="titulo-modal" className="modal-title h5">{titulo}</h2>
                        <button type="button" className="btn-close" aria-label="Cerrar" onClick={onCancelar}></button>
                    </div>

                    <div className="modal-body">{children}</div>

                    <div className="modal-footer">
                        <button ref={botonCancelar} type="button" className="btn btn-outline-primary" onClick={onCancelar} disabled={procesando}>
                            Cancelar
                        </button>
                        <button type="button" className={`btn btn-${variante}`} onClick={onConfirmar} disabled={procesando}>
                            {procesando ? 'Procesando...' : textoConfirmar}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ModalConfirmacion;
