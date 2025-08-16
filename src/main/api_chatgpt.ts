import OpenAI from 'openai';
import * as path from 'path';
import * as fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';
import { MongoDBClient } from '../config/db'; 
import mongoose from 'mongoose';

const projectRoot = path.resolve(__dirname, '..', '..');
const client = new OpenAI({
  apiKey: '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',
});

function extraerJSONDeRespuesta(texto: string): string | null {
  const match = texto.match(/```json\n([\s\S]*)\n```/);
  if (match && match[1]) {
    return match[1].trim();
  }

  try {
    JSON.parse(texto);
    return texto;
  } catch (e) {
    return null;
  }
}

function parsearAudios(audio_path: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
    ffmpeg.setFfmpegPath(ffmpegPath);

    if (!fs.existsSync(audio_path)) {
      reject(`Error: El archivo de entrada "${audio_path}" no se encuentra.`);
      return;
    }

    console.log(`Convirtiendo "${audio_path}" a mp3...`);
    const output_path = audio_path.replace(path.extname(audio_path), '.mp3');

    ffmpeg(audio_path)
      .toFormat('mp3')
      .on('end', () => {
        console.log('Conversión finalizada.');
        resolve(output_path);
      })
      .on('error', (err) => {
        console.error('Error durante la conversión:', err);
        reject(err);
      })
      .save(output_path);
  });
}

// Define la interfaz para el tipo de dato 'Operacion'
interface Operacion {
    total: number;
    fecha: Date;
    categoria: string;
    descripcion: string;
    telefono: string;
}


const operacionSchema = new mongoose.Schema({
  total: Number,
  fecha: Date,
  categoria: String,
  descripcion: String,
  telefono: String,
});

const OperacionModel = mongoose.model('Operacion', operacionSchema, 'operaciones');

async function saveToDatabase(operacion: Operacion): Promise<void> {
    await MongoDBClient.connect();
     try {
        const nuevoGasto = new OperacionModel(operacion);
        await nuevoGasto.save();
        console.log('✅ Gasto guardado en MongoDB.');
    } catch (error) {
        console.error('❌ Error al guardar el gasto en la base de datos:', error);
        throw error;
    }
}

export async function procesarEntrada(tipoEntrada: 'texto' | 'imagen' | 'audio', datos: string) {
  let resultadoAPI;

  const promptBase = `
    Analiza la siguiente información de un gasto y extrae los siguientes campos: total, fecha, descripcion (basate en el mensaje) y categoria(Comida y Bebida, Compras, Vivienda, Transporte, Vehiculos, Vida y Entretenimiento, Comunicaciones/PC, Gastos Financieros, Inversiones, Ingreso, Otros).
    Responde ÚNICAMENTE con un objeto JSON válido, sin ningún texto adicional, saludos o explicaciones. Si no especifica fecha, pone la fecha actual. Ademas quiero que analices para que categoria es el gasto, ponelo donde mas consideres o sino en Otros.
    El formato del JSON debe ser: {"total": NUMERO, "fecha": "DD-MM-YYYY", "categoria": "TIPO_CATEGORIA"}.
    Si no puedes encontrar algún campo, usa un valor null.
  `;

  try {
    if (tipoEntrada === 'texto') {
      console.log('Procesando mensaje de texto...');
      resultadoAPI = await client.chat.completions.create({
        model: 'gpt-4o',
        messages: [{
          role: 'user',
          content: `${promptBase}\n\nInformación: ${datos}`,
        }],
      });
    } else if (tipoEntrada === 'imagen') {
      console.log('Procesando imagen de ticket...');
      const imagenBase64 = fs.readFileSync(datos, 'base64');
      resultadoAPI = await client.chat.completions.create({
        model: 'gpt-4o',
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: promptBase },
            { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imagenBase64}` } },
          ],
        }],
      });
    }else if (tipoEntrada === 'audio') {
    try {
        console.log('Procesando audio de gasto...');
        const audioPath = path.join(projectRoot, 'src', datos);
        const mp3_path = await parsearAudios(audioPath);

        const transcripcion = await client.audio.transcriptions.create({
            model: 'whisper-1',
            file: fs.createReadStream(mp3_path), 
        });

        console.log('Transcripción del audio:', transcripcion.text);

        resultadoAPI = await client.chat.completions.create({
            model: 'gpt-4o',
            messages: [{
                role: 'user',
                content: `${promptBase}\n\nInformación: ${transcripcion.text}`,
            }],
        });
        
        fs.unlinkSync(mp3_path); 

    } catch (error) {
        console.error('Error al procesar el audio:', error);
        return; 
    }

} else {
    console.log('Tipo de entrada no soportado.');
    return;
}
   
    const respuestaDeOpenAI = resultadoAPI.choices?.[0]?.message?.content || '';

    console.log('Respuesta cruda de OpenAI:', respuestaDeOpenAI);

    const jsonLimpio = extraerJSONDeRespuesta(respuestaDeOpenAI);

    if (jsonLimpio) {
        try {
            const datosDeGasto = JSON.parse(jsonLimpio);
            console.log('Gasto procesado y listo para guardar:', datosDeGasto);
            await saveToDatabase(datosDeGasto);
            
        } catch (e) {
            console.error('Error al parsear el JSON limpio:', e);
        }
    } else {
        console.error('No se pudo extraer un JSON válido de la respuesta. La respuesta fue:', respuestaDeOpenAI);
    }

  } catch (error) {
    console.error('Ocurrió un error en el procesamiento:', error);
  }
}

//procesarEntrada('texto', 'Compré comida por $25 en el restaurante La Esquina el 1 de agosto.');
//procesarEntrada('imagen', 'images/ticket.webp');
//procesarEntrada('audio', 'audio/PTT-20250801-WA0022.opus');