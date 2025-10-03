import TelegramBot from 'node-telegram-bot-api';
import { procesarEntrada } from './api_chatgpt';
import axios from 'axios';
import fs from 'fs';

const token = process.env['TELEGRAM_BOT_TOKEN'];
if (!token) {
  throw new Error('TELEGRAM_BOT_TOKEN is not defined in environment variables.');
}
const bot = new TelegramBot(token, { polling: true });

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;

  try {
    if (msg.text) {
      await procesarEntrada('texto', msg.text);
      bot.sendMessage(chatId, 'Texto procesado y guardado!');
    } else if (msg.voice) {
      const fileId = msg.voice.file_id;
      const fileLink = await bot.getFileLink(fileId);
      const localPath = './src/main/messages/audio.ogg';

      // descargá el archivo
      await downloadFile(fileLink, localPath);
      
      await procesarEntrada('audio', localPath);
      bot.sendMessage(chatId, 'Audio procesado y guardado!');
      fs.unlinkSync(localPath);
    } else if (msg.photo && msg.photo.length > 0) {
      const fileId = msg.photo[msg.photo.length - 1]?.file_id; // mejor resolución
      if (!fileId) {
        bot.sendMessage(chatId, 'No se pudo obtener el archivo de la foto.');
        return;
      }
      const fileLink = await bot.getFileLink(fileId);
      const localPath = './src/main/messages/photo.jpg';

      await downloadFile(fileLink, localPath);

      await procesarEntrada('imagen', localPath);
      bot.sendMessage(chatId, 'Imagen procesada y guardada!');
      fs.unlinkSync(localPath);
    } else {
      bot.sendMessage(chatId, 'Solo puedo procesar texto, audio y fotos por ahora.');
    }
  } catch (e) {
    console.error(e);
    bot.sendMessage(chatId, 'Error al procesar el mensaje.');
  }
});

async function downloadFile(url: string, path: string) {
  const response = await axios.get(url, { responseType: 'stream' });
  return new Promise<void>((resolve, reject) => {
    const writer = fs.createWriteStream(path);
    response.data.pipe(writer);
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}
