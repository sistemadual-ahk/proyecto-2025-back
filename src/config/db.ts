import mongoose from "mongoose";
import * as dotenv from "dotenv";

dotenv.config();

export class MongoDBClient {
    static async connect(): Promise<void> {
        try {
            const MONGO_URI = process.env['MONGODB_URI'];
            const MONGO_DB_NAME = process.env['MONGODB_DB_NAME'];
            const MONGO_DB_PARAMS = process.env['MONGODB_PARAMS'];
            
            if (!MONGO_URI) {
                console.log("⚠️  MONGODB_URI no configurada. El servidor funcionará sin base de datos.");
                return;
            }
            
            const connectionString = MONGO_DB_NAME 
                ? `${MONGO_URI}/${MONGO_DB_NAME}?${MONGO_DB_PARAMS}`
                : MONGO_URI;
            
            const conn = await mongoose.connect(connectionString);
            console.log(`✅ MongoDB conectado: ${conn.connection.host}`);
            console.log(`📊 Base de datos: ${conn.connection.name}`);
            console.log(`🔗 URI de conexión: ${connectionString}`);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            console.error(`❌ Error al conectar a MongoDB: ${errorMessage}`);
            process.exit(1);
        }
    }

    static async disconnect(): Promise<void> {
        try {
            await mongoose.disconnect();
            console.log("✅ Desconectado de MongoDB");
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            console.error(`❌ Error al desconectar de MongoDB: ${errorMessage}`);
        }
    }

    static getConnectionStatus(): string {
        return mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    }
}

// Mantener la función connectDB para compatibilidad
export const connectDB = async (): Promise<void> => {
    await MongoDBClient.connect();
};
