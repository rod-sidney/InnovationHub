// db.js
// Conexión con MongoDB usando Mongoose
// La cadena de conexión viene de una variable de entorno, no se escribe en el código ni se muestra en consola

import mongoose from 'mongoose';
import { config } from './env.js';

export async function conectarBaseDeDatos() {
    // Si MongoDB no responde en 5 segundos, promesa falla
    await mongoose.connect(config.mongodbUri, { serverSelectionTimeoutMS: 5000 });
    console.log('Conectado a MongoDB');
}

// La usa el script de datos de prueba para terminar sin dejar la conexión abierta
export async function desconectarBaseDeDatos() {
    await mongoose.disconnect();
}