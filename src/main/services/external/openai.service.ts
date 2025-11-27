import OpenAI from 'openai';
import * as fs from 'fs';
import * as path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import dotenv from 'dotenv';
import { RepositorioDeOperaciones } from '@models/repositories';
import { Operacion } from '@models/entities/operacion';
import { CategoriaService } from '@services/categoria.service';
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;


dotenv.config();


interface ProcesarEntradaResponse {
  monto: number;
  fecha: string;
  categoria: string;
  descripcion: string;
}


export class OpenAIService {
  private client: OpenAI;
  private ffmpegPath: string;

  constructor(private operacionRepo: RepositorioDeOperaciones, private categoriaService: CategoriaService) {
    this.client = new OpenAI({ apiKey: process.env['OPENAI_API_KEY'] });
    this.ffmpegPath = ffmpegPath;
  }

  private extraerJSONDeRespuesta(texto: string): string | null {
    const match = texto.match(/```json\n([\s\S]*)\n```/);
    if (match && match[1]) return match[1].trim();

    try {
      JSON.parse(texto);
      return texto;
    } catch {
      return null;
    }
  }

  private parsearAudios(audio_path: string): Promise<string> {
    return new Promise((resolve, reject) => {
      ffmpeg.setFfmpegPath(this.ffmpegPath);
      if (!fs.existsSync(audio_path)) return reject(`Error: No existe el archivo ${audio_path}`);

      const output_path = audio_path.replace(path.extname(audio_path), '.mp3');
      ffmpeg(audio_path)
        .toFormat('mp3')
        .on('end', () => resolve(output_path))
        .on('error', (err) => reject(err))
        .save(output_path);
    });
  }

  private obtenerDiaDeHoy(): string {
    const hoy = new Date();
    const dia = hoy.getDate().toString().padStart(2, '0');
    const mes = (hoy.getMonth() + 1).toString().padStart(2, '0');
    const anio = hoy.getFullYear();
    return `${dia}-${mes}-${anio}`;
  }

  public async procesarEntrada(
    tipoEntrada: 'texto' | 'imagen' | 'audio',
    datos: string
  ): Promise<ProcesarEntradaResponse | null> {
    const categorias = await this.categoriaService.findAll();
    const categoriasString = categorias.map(c => c.nombre).join(', ');

    const promptBase = `
TENER EN CUENTA QUE EL DIA DE HOY ES ${this.obtenerDiaDeHoy()}
Analiza la siguiente información de un gasto y extrae los siguientes campos: total, fecha, descripcion y categoria.
Responde ÚNICAMENTE con un JSON válido: {"monto": NUMERO, "fecha": "DD-MM-YYYY", "categoria": "TIPO_CATEGORIA", "descripcion": "texto"}. NO DEJES NINGUN CAMPO EN NULL, si no te aclaran la fecha pone la de hoy. La categoria pone uno de estos valores que mas consideres segun el mensaje: ${categoriasString}.
  `;

    let resultadoAPI: OpenAI.Chat.Completions.ChatCompletion;

    try {
      if (tipoEntrada === 'texto') {
        resultadoAPI = await this.client.chat.completions.create({
          model: 'gpt-4o',
          messages: [{ role: 'user', content: `${promptBase}\n\nInformación: ${datos}` }],
        });
      } else if (tipoEntrada === 'imagen') {
        const imagenBase64 = fs.readFileSync(path.resolve(datos), 'base64');
        resultadoAPI = await this.client.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            { role: 'user', content: promptBase },
            { role: 'user', content: `data:image/jpeg;base64,${imagenBase64}` },
          ],
        });
      } else if (tipoEntrada === 'audio') {
        const mp3_path = await this.parsearAudios(path.resolve(datos));
        const transcripcion = await this.client.audio.transcriptions.create({
          model: 'whisper-1',
          file: fs.createReadStream(mp3_path),
        });
        fs.unlinkSync(mp3_path);
        resultadoAPI = await this.client.chat.completions.create({
          model: 'gpt-4o',
          messages: [{ role: 'user', content: `${promptBase}\n\nInformación: ${transcripcion.text}` }],
        });
      } else {
        return null;
      }

      const respuestaDeOpenAI = resultadoAPI.choices?.[0]?.message?.content || '';
      const jsonLimpio = this.extraerJSONDeRespuesta(respuestaDeOpenAI);

      if (jsonLimpio) {
        return JSON.parse(jsonLimpio) as ProcesarEntradaResponse;
      }
      return null;
    } catch (error) {
      console.error('❌ Error al procesar entrada:', error);
      return null;
    }
  }

  public async guardarDatos(operacion: Partial<Operacion>): Promise<void> {
    try {
      this.operacionRepo.save(operacion);
      console.log('✅ Datos guardados en MongoDB');
    } catch (error) {
      console.error('❌ Error al guardar datos:', error);
    }
  }

  public async borrarDatos(operacionId: string): Promise<void> { 
    try {
      const fueEliminado = await this.operacionRepo.deleteById(operacionId); 

      if (fueEliminado) {
        console.log(`🗑️ Datos eliminados con ID: ${operacionId}`);
      } else {
        console.warn(`⚠️ No se encontró la operación con ID: ${operacionId} para eliminar.`);
      }
    } catch (error) {
      console.error('❌ Error al borrar datos:', error);
    }
  }
}