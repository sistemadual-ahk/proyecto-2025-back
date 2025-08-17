"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = exports.MongoDBClient = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
class MongoDBClient {
    static async connect() {
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
            const conn = await mongoose_1.default.connect(connectionString);
            console.log(`✅ MongoDB conectado: ${conn.connection.host}`);
            console.log(`📊 Base de datos: ${conn.connection.name}`);
            console.log(`🔗 URI de conexión: ${connectionString}`);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            console.error(`❌ Error al conectar a MongoDB: ${errorMessage}`);
            process.exit(1);
        }
    }
    static async disconnect() {
        try {
            await mongoose_1.default.disconnect();
            console.log("✅ Desconectado de MongoDB");
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            console.error(`❌ Error al desconectar de MongoDB: ${errorMessage}`);
        }
    }
    static getConnectionStatus() {
        return mongoose_1.default.connection.readyState === 1 ? 'connected' : 'disconnected';
    }
}
exports.MongoDBClient = MongoDBClient;
// Mantener la función connectDB para compatibilidad
const connectDB = async () => {
    await MongoDBClient.connect();
};
exports.connectDB = connectDB;
//# sourceMappingURL=db.js.map