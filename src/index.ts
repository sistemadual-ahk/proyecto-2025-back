import { connectDB } from "./config/db";
import app from "./main/app";

const PORT = process.env['PORT'] || 3000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
  });
});