import 'module-alias/register';
import { MongoDBClient } from '@config/db';
import './main/conexionApis'

async function startApp() {
    console.log("Iniciando conexión a la base de datos...");
    await MongoDBClient.connect();
    
    console.log("Conectando APIs...")
    
}

startApp();