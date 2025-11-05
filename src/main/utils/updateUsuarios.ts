import axios from "axios";

// 🧠 Interfaces para tipar tus datos
interface Profesion {
    _id?: string;
    nombre: string;
}

interface Usuario {
    _id: string;
    nombre: string;
    profesion?: string;
    estadoCivil?: string;
    sueldo?: number;
}

// 🌐 Base URL de tu API
const API_BASE = "http://localhost:3000/api";

// 🎲 Funciones auxiliares
function randomFrom<T>(arr: T[]): T {
    if (arr.length === 0) {
        throw new Error("El array está vacío, no se puede elegir un elemento aleatorio.");
    }

    const index = Math.floor(Math.random() * arr.length);
    return arr[index] as T;
}

const randomSueldo = () => Math.floor(Math.random() * 300000) + 200000;

async function updateUsuarios() {
    try {
        // 1️⃣ Obtener todas las profesiones desde tu API
        const profesionesRes = await axios.get<{ success?: boolean; data: Profesion[] }>(`${API_BASE}/profesiones`);
        const profesiones = profesionesRes.data.data || profesionesRes.data;
        const profesionesNombres = profesiones.map((p) => p.nombre);

        console.log(`📚 Profesiones cargadas: ${profesionesNombres.length}`);

        // 2️⃣ Obtener todos los usuarios
        const usuariosRes = await axios.get<{ success?: boolean; data: Usuario[] }>(`${API_BASE}/usuarios`);
        const usuarios = usuariosRes.data.data || usuariosRes.data;

        console.log(`👥 Usuarios encontrados: ${usuarios.length}\n`);

        // 3️⃣ Estados civiles posibles
        const estadosCiviles = ["Soltero", "Casado", "Divorciado", "Viudo", "Unión Libre"];

        // 4️⃣ Iterar y actualizar usuarios
        for (const user of usuarios) {
            // Saltar si ya tiene datos completos
            if (user.profesion && user.estadoCivil && user.sueldo) {
                console.log(`⏭️ ${user.nombre} ya tiene datos, se omite.`);
                continue;
            }

            const payload = {
                sueldo: user.sueldo || randomSueldo(),
                estadoCivil: user.estadoCivil || randomFrom(estadosCiviles),
                profesion: user.profesion || randomFrom(profesionesNombres),
            };

            await axios.put(`${API_BASE}/usuarios/${user._id}`, payload);
            console.log(`✔️ ${user.nombre} actualizado con ${payload.profesion}, ${payload.estadoCivil}, ${payload.sueldo}`);
        }

        console.log("\n✅ Actualización completa.");
    } catch (err: any) {
        console.error("❌ Error:", err.response?.data || err.message);
    }
}

// 🚀 Ejecutar
updateUsuarios();
