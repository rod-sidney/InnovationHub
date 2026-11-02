// Propósito: convertir la foto elegida en un <input type="file"> en un texto (data URL) más pequeño, para poder guardarla en localStorage

// Promesa se cumple cuando la imagen termina de cargar y falla si el archivo no es una imagen válida.
// Se usa el evento load porque decode() puede quedarse esperando si la pestaña no se está mostrando en pantalla
function esperarCarga(imagen) {
    return new Promise((resolve, reject) => {
        imagen.onload = resolve;
        imagen.onerror = () => reject(new Error("El archivo no es una imagen válida"));
    });
}

// Devuelve la imagen reducida para que su lado más largo mida max ladoMaximo px
export async function leerImagenReducida(archivo, ladoMaximo) {
    // Dirección temporal que permite usar el archivo como si fuera una imagen de la página
    const direccion = URL.createObjectURL(archivo);

    try {
        const imagen = new Image();
        const carga = esperarCarga(imagen); // escucha antes de cargar la imagen
        imagen.src = direccion;
        await carga;

        // Si la imagen ya es pequeña, la escala es 1
        const escala = Math.min(1, ladoMaximo / Math.max(imagen.naturalWidth, imagen.naturalHeight));

        // Se dibuja en un canvas del tamaño reducido
        const lienzo = document.createElement('canvas');
        lienzo.width = Math.round(imagen.naturalWidth * escala);
        lienzo.height = Math.round(imagen.naturalHeight * escala);

        const contexto = lienzo.getContext('2d');
        // Fondo blanco
        contexto.fillStyle = '#ffffff';
        contexto.fillRect(0, 0, lienzo.width, lienzo.height);
        contexto.drawImage(imagen, 0, 0, lienzo.width, lienzo.height);

        // JPEG con calidad 0.8, pesa menos
        return lienzo.toDataURL('image/jpeg', 0.8);
    } finally {
        URL.revokeObjectURL(direccion); // libera la memoria de la dirección temporal
    }
}
