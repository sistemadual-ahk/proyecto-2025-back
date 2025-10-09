import TelegramBot from 'node-telegram-bot-api';
import { procesarEntrada, guardarDatos, borrarDatos } from './api_chatgpt';
import axios from 'axios';
import fs from 'fs';

const token = process.env['TELEGRAM_BOT_TOKEN']!;
if (!token) throw new Error('TELEGRAM_BOT_TOKEN no está definido');

async function startBot() {
  const bot = new TelegramBot(token, { polling: true });
  const userSessions: Record<number, any> = {};

  async function downloadFile(url: string, path: string) {
    const response = await axios.get(url, { responseType: 'stream' });
    return new Promise<void>((resolve, reject) => {
      const writer = fs.createWriteStream(path);
      response.data.pipe(writer);
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
  }

  function datosCompletos(datos: any): boolean {
    return datos.monto && datos.fecha && datos.categoria && datos.descripcion;
  }

  function camposFaltantes(datos: any): string[] {
    const campos = ['monto', 'fecha', 'categoria', 'descripcion'];
    return campos.filter(c => !datos[c]);
  }

  function mostrarMenuEdicion(bot: TelegramBot, chatId: number, datos: any) {
    const mensaje = `✏️ Estos son los datos actuales:\n\n` +
      `💰 Monto: ${datos.monto ?? '❌ Sin dato'}\n` +
      `📅 Fecha: ${datos.fecha ?? '❌ Sin dato'}\n` +
      `📂 Categoría: ${datos.categoria ?? '❌ Sin dato'}\n` +
      `📝 Descripción: ${datos.descripcion ?? '❌ Sin dato'}\n\n` +
      `¿Qué campo querés editar?`;

    bot.sendMessage(chatId, mensaje, {
      reply_markup: {
        inline_keyboard: [
          [
            { text: '💰 Monto', callback_data: 'editar_monto' },
            { text: '📅 Fecha', callback_data: 'editar_fecha' },
          ],
          [
            { text: '📂 Categoría', callback_data: 'editar_categoria' },
            { text: '📝 Descripción', callback_data: 'editar_descripcion' },
          ],
          [
            { text: '✅ Confirmar', callback_data: 'confirmar' },
            { text: '❌ Cancelar', callback_data: 'cancelar' },
          ],
        ],
      },
    });
  }

 // Dentro de startBot()

bot.on('message', async (msg) => {
  const chatId = msg.chat?.id;
  if (!chatId) return;

  // --- Ignorar procesar entrada si está en modo edición
  if (userSessions[chatId]?.modoEdicion) {
    return;
  }

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

    if (!userSessions[chatId]) {
      // --- Inicializar sesión con modoEdicion false
      userSessions[chatId] = { modoEdicion: false };
    }

    // Actualizar solo campos válidos sin borrar otros datos ni el flag
    for (const [clave, valor] of Object.entries(datosProcesados || {})) {
      if (valor !== null && valor !== undefined && valor !== '') {
        userSessions[chatId][clave] = valor;
      }
    }

    const datos = userSessions[chatId];

    await bot.sendMessage(chatId,
      `📋 Datos detectados:\n` +
      `💰 Monto: ${datos.monto ?? '❌ Sin dato'}\n` +
      `📅 Fecha: ${datos.fecha ?? '❌ Sin dato'}\n` +
      `📂 Categoría: ${datos.categoria ?? '❌ Sin dato'}\n` +
      `📝 Descripción: ${datos.descripcion ?? '❌ Sin dato'}\n\n` +
      `¿Deseás confirmarlos?`,
      {
        reply_markup: {
          inline_keyboard: [
            [
              { text: '✅ Confirmar', callback_data: 'confirmar' },
              { text: '✏️ Editar', callback_data: 'editar' },
              { text: '❌ Cancelar', callback_data: 'cancelar' },
            ],
          ],
        },
      }
    );
  } catch (e) {
    console.error(e);
    bot.sendMessage(chatId, '❌ Error al procesar el mensaje.');
  }
});

bot.on('callback_query', async (query) => {
  const chatId = query.message!.chat.id;
  if (!chatId) return;

  const data = query.data;
  if (!data) return;

  const sessionData = userSessions[chatId];
  if (!sessionData) {
    bot.sendMessage(chatId, '❌ No se encontró una sesión activa para esta operación.');
    return;
  }

  if (data === 'confirmar') {
    if (!datosCompletos(sessionData)) {
      const faltantes = camposFaltantes(sessionData);
      await bot.sendMessage(chatId,
        `⚠️ No podés confirmar. Faltan los siguientes datos obligatorios:\n` +
        faltantes.map(f => `- ${f}`).join('\n')
      );
      mostrarMenuEdicion(bot, chatId, sessionData);
      return;
    }

    await guardarDatos(sessionData);
    bot.sendMessage(chatId, '✅ Datos confirmados.');
    delete userSessions[chatId];

  } else if (data === 'editar') {
    // --- Activar modo edición
    userSessions[chatId].modoEdicion = true;
    mostrarMenuEdicion(bot, chatId, sessionData);

  } else if (data === 'cancelar') {
    await borrarDatos(sessionData);
    bot.sendMessage(chatId, '❌ Operación cancelada.');
    delete userSessions[chatId];

  } else if (data.startsWith('editar_')) {
    const campo = data.replace('editar_', '');
    bot.sendMessage(chatId, `✏️ Ingresá el nuevo valor para *${campo}*:`, {
      parse_mode: 'Markdown',
    });

    bot.once('message', async (msg) => {
      const nuevoValor = msg.text;
      if (!nuevoValor) {
        bot.sendMessage(chatId, '⚠️ No se recibió texto válido.');
        return;
      }

      userSessions[chatId][campo] = nuevoValor;
      // --- Salir de modo edición cuando se actualiza un campo
      userSessions[chatId].modoEdicion = false;

      bot.sendMessage(chatId, `✅ ${campo} actualizado.`);
      mostrarMenuEdicion(bot, chatId, userSessions[chatId]);
    });
  }

  bot.answerCallbackQuery(query.id);
});

}

startBot().catch(console.error);
