import axios from "axios";
import * as path from "path";
import * as dotenv from "dotenv";

// 🧩 Load .env from two folders up
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

// 🧠 Interfaces
interface Profesion {
    _id?: string;
    nombre: string;
}

interface Usuario {
    id: string;
    name: string;
    profesion?: string;
    estadoCivil?: string;
    sueldo?: number;
}

// 🌐 Configuración general
const API_BASE = "http://localhost:3000/api";

// 🔑 Token desde .env
const AUTH_TOKEN = process.env["API_TOKEN"];
if (!AUTH_TOKEN) {
    console.error("❌ No se encontró API_TOKEN en el archivo .env (dos carpetas arriba).");
    process.exit(1);
}

// ⚙️ Axios instance
const api = axios.create({
    baseURL: API_BASE,
    headers: {
        Authorization: `Bearer ${AUTH_TOKEN}`,
        "Content-Type": "application/json",
    },
});

// 🎲 Helpers
function randomFrom<T>(arr: readonly T[]): T {
    if (arr.length === 0) throw new Error("El array está vacío, no se puede seleccionar un elemento aleatorio.");
    const index = Math.floor(Math.random() * arr.length);
    return arr[index] as T;
}

function randomSueldo(): number {
    return Math.floor(Math.random() * 3800000) + 200000;
}

// 🚀 Main
async function updateUsuarios() {
    try {
        console.log("🔄 Obteniendo profesiones...");
        const profesionesRes = await api.get<{ success?: boolean; data: Profesion[] }>("/profesiones");
        const profesiones = profesionesRes.data.data || profesionesRes.data;
        const profesionesNombres = profesiones.map((p) => p.nombre);
        console.log(`📚 Profesiones cargadas: ${profesionesNombres.length}\n`);

        console.log("👥 Obteniendo usuarios...");
        const usuariosRes = await api.get<{ success?: boolean; data: Usuario[] }>("/usuarios");
        const usuarios = usuariosRes.data.data || usuariosRes.data;
        console.log(`👤 Usuarios encontrados: ${usuarios.length}\n`);

        const estadosCiviles = ["Soltero", "Casado", "Divorciado", "Viudo"];

        for (const user of usuarios) {
            if (!user.id) {
                console.warn(`⚠️ Usuario sin ID válido: ${user.name}`);
                continue;
            }

            const payload = {
                sueldo: user.sueldo ?? randomSueldo(),
                estadoCivil: user.estadoCivil ?? randomFrom(estadosCiviles),
                profesion: user.profesion ?? randomFrom(profesionesNombres),
            };

            try {
                await api.put(`/usuarios/${user.id}`, payload);
                console.log(`✔️ ${user.name.padEnd(25)} → ${payload.profesion}, ${payload.estadoCivil}, $${payload.sueldo}`);
            } catch (innerErr: any) {
                console.warn(`⚠️ Error actualizando ${user.name}:`, innerErr.response?.data || innerErr.message);
            }
        }

        console.log("\n✅ Todos los usuarios fueron actualizados correctamente.");
    } catch (err: any) {
        console.error("❌ Error general:", err.response?.data || err.message);
    }
}

// 🏁 Run
updateUsuarios();
