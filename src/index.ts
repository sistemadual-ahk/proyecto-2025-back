import 'module-alias/register';
import { MongoDBClient } from '@config/db';
import { procesarEntrada } from './main/api_chatgpt'; // Cambia la ruta a donde tengas la función

async function startApp() {
    console.log("Iniciando conexión a la base de datos...");
    await MongoDBClient.connect();
    
    console.log("Conexión a la base de datos establecida. Ejecutando test de la API...");
    // Llama a la función que inicia el procesamiento
    await procesarEntrada('audio', 'PTT-20250801-WA0022.opus');
    console.log("Test de la API finalizado.");
}

startApp();