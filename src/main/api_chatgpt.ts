// src/main/api_chatgpt.ts
import mongoose from 'mongoose';
import OpenAI from 'openai';
import * as fs from 'fs';
import * as path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import dotenv from 'dotenv'

dotenv.config();

const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;

const client = new OpenAI({ apiKey: process.env['OPENAI_API_KEY'] });

// Modelo de MongoDB
const operacionSchema = new mongoose.Schema({
  monto: Number,
  fecha: String,
  categoria: String,
  descripcion: String,
  telefono: String,
});
export const OperacionModel = mongoose.model('Operacion', operacionSchema, 'operaciones');

// Función para extraer JSON de la respuesta
function extraerJSONDeRespuesta(texto: string): string | null {
  const match = texto.match(/```json\n([\s\S]*)\n```/);
  if (match && match[1]) return match[1].trim();

  try {
    JSON.parse(texto);
    return texto;
  } catch {
    return null;
  }
}

// Conversión de audios
export function parsearAudios(audio_path: string): Promise<string> {
  return new Promise((resolve, reject) => {
    ffmpeg.setFfmpegPath(ffmpegPath);
    if (!fs.existsSync(audio_path)) return reject(`Error: No existe el archivo ${audio_path}`);

    const output_path = audio_path.replace(path.extname(audio_path), '.mp3');
    ffmpeg(audio_path)
      .toFormat('mp3')
      .on('end', () => resolve(output_path))
      .on('error', (err) => reject(err))
      .save(output_path);
  });
}

// Obtener fecha de hoy
export function obtenerDiaDeHoy() {
  const hoy = new Date();
  const dia = hoy.getDate().toString().padStart(2, '0');
  const mes = (hoy.getMonth() + 1).toString().padStart(2, '0');
  const anio = hoy.getFullYear();
  return `${dia}-${mes}-${anio}`;
}

// Procesar entrada con OpenAI
export async function procesarEntrada(tipoEntrada: 'texto' | 'imagen' | 'audio', datos: string) {
  const promptBase = `
TENER EN CUENTA QUE EL DIA DE HOY ES ${obtenerDiaDeHoy()}
Analiza la siguiente información de un gasto y extrae los siguientes campos: total, fecha, descripcion y categoria.
Responde ÚNICAMENTE con un JSON válido: {"monto": NUMERO, "fecha": "DD-MM-YYYY", "categoria": "TIPO_CATEGORIA", "descripcion": "texto"}.
Si no puedes encontrar algún campo, usa null.
  `;

  let resultadoAPI: any;

  try {
    if (tipoEntrada === 'texto') {
      resultadoAPI = await client.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: `${promptBase}\n\nInformación: ${datos}` }],
      });
    } else if (tipoEntrada === 'imagen') {
      const imagenBase64 = fs.readFileSync(path.resolve(datos), 'base64');
      resultadoAPI = await client.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'user', content: promptBase },
          { role: 'user', content: `data:image/jpeg;base64,${imagenBase64}` },
        ],
      });
    } else if (tipoEntrada === 'audio') {
      const mp3_path = await parsearAudios(path.resolve(datos));
      const transcripcion = await client.audio.transcriptions.create({
        model: 'whisper-1',
        file: fs.createReadStream(mp3_path),
      });
      fs.unlinkSync(mp3_path);
      resultadoAPI = await client.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: `${promptBase}\n\nInformación: ${transcripcion.text}` }],
      });
    }

    const respuestaDeOpenAI = resultadoAPI.choices?.[0]?.message?.content || '';
    const jsonLimpio = extraerJSONDeRespuesta(respuestaDeOpenAI);

    if (jsonLimpio) return JSON.parse(jsonLimpio);
    return null;
  } catch (error) {
    console.error('❌ Error al procesar entrada:', error);
    return null;
  }
}

// Guardar y borrar datos
export async function guardarDatos(operacion: any) {
  try {
    const nuevoGasto = new OperacionModel(operacion);
    await nuevoGasto.save();
    console.log('✅ Datos guardados en MongoDB');
  } catch (error) {
    console.error('❌ Error al guardar datos:', error);
  }
}

export async function borrarDatos(operacion: any) {
  try {
    await OperacionModel.deleteOne({
      monto: operacion.monto,
      fecha: operacion.fecha,
      descripcion: operacion.descripcion,
    });
    console.log('🗑️ Datos eliminados');
  } catch (error) {
    console.error('❌ Error al borrar datos:', error);
  }
}
