// src/main/bot.ts
import TelegramBot from 'node-telegram-bot-api';
import { procesarEntrada, guardarDatos, borrarDatos } from './api_chatgpt';
import axios from 'axios';
import fs from 'fs';

const token = process.env['TELEGRAM_BOT_TOKEN']!;
if (!token) throw new Error('TELEGRAM_BOT_TOKEN no está definido');

async function startBot() {
  // Conexión única a la base de datos

  const bot = new TelegramBot(token, { polling: true });
  const userSessions: Record<number, any> = {};

  // Función para descargar archivos
  async function downloadFile(url: string, path: string) {
    const response = await axios.get(url, { responseType: 'stream' });
    return new Promise<void>((resolve, reject) => {
      const writer = fs.createWriteStream(path);
      response.data.pipe(writer);
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
  }

  // Manejo de mensajes
  bot.on('message', async (msg) => {
    const chatId = msg.chat?.id;
    if (!chatId) return;

    try {
      let tipo: 'texto' | 'audio' | 'imagen';
      let contenido: string;

      if (msg.text) {
        tipo = 'texto';
        contenido = msg.text;
      } else if (msg.voice) {
        tipo = 'audio';
        const fileId = msg.voice.file_id;
        const fileLink = await bot.getFileLink(fileId);
        const localPath = './src/main/messages/audio.ogg';
        await downloadFile(fileLink, localPath);
        contenido = localPath;
      } else if (msg.photo?.length) {
        tipo = 'imagen';
        const fileId = msg.photo[msg.photo.length - 1]!.file_id;
        const fileLink = await bot.getFileLink(fileId);
        const localPath = './src/main/messages/photo.jpg';
        await downloadFile(fileLink, localPath);
        contenido = localPath;
      } else {
        bot.sendMessage(chatId, 'Solo puedo procesar texto, audio y fotos.');
        return;
      }

      const datosProcesados = await procesarEntrada(tipo, contenido);
      userSessions[chatId] = datosProcesados;

      await bot.sendMessage(chatId, `📋 Datos detectados:\n Monto: ${datosProcesados.monto}\nFecha: ${datosProcesados.fecha}\nCategoria: ${datosProcesados.categoria}\nDescripción: ${datosProcesados.descripcion}"\n¿Deseás confirmarlos?`, {
        reply_markup: {
          inline_keyboard: [
            [
              { text: '✅ Confirmar', callback_data: 'confirmar' },
              { text: '✏️ Editar', callback_data: 'editar' },
              { text: '❌ Cancelar', callback_data: 'cancelar' },
            ],
          ],
        },
      });

    } catch (e) {
      console.error(e);
      bot.sendMessage(chatId, '❌ Error al procesar el mensaje.');
    }
  });

  // Manejo de botones
  bot.on('callback_query', async (query) => {
    const chatId = query.message!.chat.id;
    if (!chatId) return;

    const data = query.data;
    if (!data) return; 

    const sessionData = userSessions[chatId];
    if (!sessionData) {
        // Enviar un mensaje de error o simplemente terminar si no hay sesión
        bot.sendMessage(chatId, '❌ No se encontró una sesión activa para esta operación.');
        return;
    }

    if (data === 'confirmar') {
      await guardarDatos(userSessions[chatId]);
      bot.sendMessage(chatId, '✅ Datos confirmados.');
      delete userSessions[chatId];
    } else if (data === 'editar') {
      bot.sendMessage(chatId, '✏️ Ingresá los nuevos datos:');
      bot.once('message', async (msg) => {
        userSessions[chatId] = msg.text;
        await guardarDatos(userSessions[chatId]);
        bot.sendMessage(chatId, '✅ Datos actualizados.');
        delete userSessions[chatId];
      });
    } else if (data === 'cancelar') {
      await borrarDatos(userSessions[chatId]);
      bot.sendMessage(chatId, '❌ Operación cancelada.');
      delete userSessions[chatId];
    }

    bot.answerCallbackQuery(query.id);
  });
}

// Ejecutar bot
startBot().catch(console.error);
