import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export const connectDB = async (): Promise<void> => {
  try {
    const MONGO_URI = process.env['MONGODB_URI'];
    
    if (!MONGO_URI) {
      console.log("⚠️  MONGODB_URI no configurada. El servidor funcionará sin base de datos.");
      return;
    }
    
    await mongoose.connect(MONGO_URI);
    console.log("✅ Conectado a MongoDB Atlas");
  } catch (error) {
    console.error("❌ Error al conectar a MongoDB:", error);
    console.log("⚠️  El servidor funcionará sin base de datos.");
  }
};
