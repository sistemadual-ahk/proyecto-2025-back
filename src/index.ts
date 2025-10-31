import { connectDB } from "./config/db";
import app from "./main/app";
import type { AddressInfo } from "net";

const PORT = Number(process.env['PORT'] || 3000);
const HOST = process.env['HOST'] || '0.0.0.0';

connectDB().then(() => {
  const server = app.listen(PORT, HOST, () => {
    const address = server.address();
    if (typeof address === 'string') {
      console.log(`Servidor escuchando en ${address}`);
      return;
    }
    const info = address as AddressInfo | null;
    if (info) {
      console.log(`Servidor escuchando en http://${info.address}:${info.port}`);
    } else {
      console.log(`Servidor corriendo. Puerto: ${PORT}`);
    }
  });
});