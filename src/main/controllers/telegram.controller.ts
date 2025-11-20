import TelegramBot from 'node-telegram-bot-api';
import axios from 'axios';
import fs from 'fs';
import { BaseController } from '@controllers/base.controller';
import { OpenAIService } from '@services/external/openai.service';
import { Operacion } from '@models/entities/operacion';
import { CategoriaService } from '@services/categoria.service';
import { TipoOperacion } from '@models/entities/tipoOperacion';
import { BilleteraService } from '@services/billetera.service';
import { UsuarioService } from '@services/usuario.service';
import { CategoriaDto } from '../dtos/categoriaDto';
import { billeteraDto } from '../dtos/billeteraDto';

interface UserSession {
  modoEdicion: boolean;
  estado?: 'esperando_monto' | 'esperando_fecha' | 'esperando_descripcion' | 'esperando_categoria' | 'esperando_billetera' | 'menu_principal';
  campo?: 'monto' | 'fecha' | 'categoria' | 'descripcion' | 'billetera';
  monto?: number | string;
  fecha?: string;
  categoria?: string;
  billeteraDefault?: string;
  billetera?: string;
  descripcion?: string;
  telefono?: string;
  originalMessageId?: number;
}

const token = process.env['TELEGRAM_BOT_TOKEN']!;
const userSessions: Record<number, UserSession> = {};
if (!token) throw new Error('TELEGRAM_BOT_TOKEN no está definido');

export class TelegramController extends BaseController {
  constructor(
    private openaiService: OpenAIService,
    private categoriaService: CategoriaService,
    private billeteraService: BilleteraService,
    private usuarioService: UsuarioService
  ) {
    super();
  }

  private getDatosMensaje(datos: UserSession, titulo: string, incluirBotones: boolean = false): { text: string; reply_markup?: any } {
    const text =
      `${titulo}\n\n` +
      `💰 Monto: ${datos.monto ?? '❌ Sin dato'}\n` +
      `💳 Billetera: ${datos.billetera ?? '❌ Sin dato'}\n` +
      `📅 Fecha: ${datos.fecha ?? '❌ Sin dato'}\n` +
      `📂 Categoría: ${datos.categoria ?? '❌ Sin dato'}\n` +
      `📝 Descripción: ${datos.descripcion ?? '❌ Sin dato'}\n\n`;

    let reply_markup = undefined;
    if (incluirBotones) {
      reply_markup = {
        inline_keyboard: [
          [
            { text: '✅ Confirmar', callback_data: 'confirmar' },
            { text: '✏️ Editar', callback_data: 'editar' },
            { text: '❌ Cancelar', callback_data: 'cancelar_op' },
          ],
        ],
      };
    }
    return { text, reply_markup };
  }

  private chequearMontoDesdeMensaje(textoRecibido: string): number | null {
    const valorLimpio = textoRecibido.trim().replace(',', '.');
    const numeroConvertido = parseFloat(valorLimpio);
    if (!isNaN(numeroConvertido) && isFinite(numeroConvertido) && numeroConvertido > 0) {
      return parseFloat(numeroConvertido.toFixed(2));
    }
    return null;
  }

  private chequearFechaDesdeMensaje(textoRecibido: string): string | null {
    const valorLimpio = textoRecibido.trim();
    const regexFecha = /^(\d{2})[-./](\d{2})[-./](\d{4})$/;
    const match = valorLimpio.match(regexFecha);
    if (!match) return null;

    const dia = parseInt(match[1]!, 10);
    const mes = parseInt(match[2]!, 10);
    const anio = parseInt(match[3]!, 10);
    const fecha = new Date(anio, mes - 1, dia);

    if (fecha.getFullYear() === anio && fecha.getMonth() === mes - 1 && fecha.getDate() === dia) {
      return `${match[1]}-${match[2]}-${match[3]}`;
    }
    return null;
  }

  private datosCompletos(datos: UserSession): boolean {
    return !!(datos.monto && datos.fecha && datos.categoria && datos.descripcion);
  }

  private camposFaltantes(datos: UserSession): string[] {
    const campos = ['monto', 'fecha', 'categoria', 'descripcion'];
    return campos.filter(c => !datos[c as keyof UserSession]);
  }

  private async convertirUserSessionAOperacionData(session: UserSession): Promise<Partial<Operacion> | null> {
    if (!session.monto || !session.fecha || !session.categoria || !session.descripcion) return null;

    const monto = typeof session.monto === 'string' ? parseFloat(session.monto) : session.monto;
    if (isNaN(monto)) return null;

    const categoria = await this.categoriaService.findByName(session.categoria);
    if (!categoria) return null;

    const partes = session.fecha.split('-');
    if (partes.length !== 3) return null;
    const dia = parseInt(partes[0]!, 10);
    const mes = parseInt(partes[1]!, 10);
    const anio = parseInt(partes[2]!, 10);
    if (isNaN(dia) || isNaN(mes) || isNaN(anio)) return null;
    const fecha = new Date(anio, mes - 1, dia);

    return {
      monto,
      fecha,
      categoria: categoria,
      descripcion: session.descripcion,
      tipo: TipoOperacion.EGRESO,
    };
  }

  async startBot() {
    const bot = new TelegramBot(token, { polling: true });

    async function downloadFile(url: string, path: string) {
      const response = await axios.get(url, { responseType: 'stream' });
      return new Promise<void>((resolve, reject) => {
        const writer = fs.createWriteStream(path);
        response.data.pipe(writer);
        writer.on('finish', resolve);
        writer.on('error', reject);
      });
    }

    const mostrarMenuEdicion = (bot: TelegramBot, chatId: number, datos: UserSession) => {
      const mensaje = this.getDatosMensaje(datos, '✏️ Estos son los datos actuales:').text + `\n¿Qué campo querés editar?`;
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
              { text: '💳 Billetera', callback_data: 'editar_billetera' },
            ],
            [
              { text: '✅ Confirmar Cambios', callback_data: 'confirmar_edicion' },
              { text: '❌ Cancelar Edición', callback_data: 'cancelar_edicion' },
            ],
          ],
        },
      });
    };

    const mostrarMenuCategorias = async (bot: TelegramBot, chatId: number) => {
      try {
        const categorias: CategoriaDto[] = await this.categoriaService.findAll();
        const botonesCategorias = categorias.map((categoria: CategoriaDto) => {
          return [{
            text: categoria.nombre,
            callback_data: `select_cat:${categoria.nombre}`,
          }];
        });
        // agrego botón cancelar para volver al menú de edición
        botonesCategorias.push([{ text: '❌ Cancelar', callback_data: 'cancelar_edicion' }]);
        await bot.sendMessage(chatId, "📂 Por favor, seleccioná la nueva categoría:", {
          reply_markup: { inline_keyboard: botonesCategorias },
        });
        userSessions[chatId]!.estado = 'esperando_categoria';
        userSessions[chatId]!.campo = 'categoria';
      } catch (e) {
        console.error("Error al obtener categorías:", e);
        await bot.sendMessage(chatId, "❌ Hubo un error al cargar las categorías.");
        mostrarMenuEdicion(bot, chatId, userSessions[chatId]!);
      }
    };

    const mostrarMenuBilleteras = async (bot: TelegramBot, chatId: number, usuarioId: string) => {
      try {
        const billeteras: billeteraDto[] = await this.billeteraService.findAllForUser(usuarioId);
        const botonesBilleteras = billeteras.map((billetera: billeteraDto) => {
          return [{
            text: `${billetera.nombre} ${billetera.balance}`,
            callback_data: `select_wall:${billetera.nombre}`,
          }];
        });
        botonesBilleteras.push([{ text: '❌ Cancelar', callback_data: 'cancelar_edicion' }]);
        await bot.sendMessage(chatId, '💳 Selecciona la billetera', {
          reply_markup: { inline_keyboard: botonesBilleteras },
        });
        userSessions[chatId]!.estado = 'esperando_billetera';
        userSessions[chatId]!.campo = 'billetera';
      } catch (e) {
        console.error('❌ Hubo un error al obtener billeteras', e);
        mostrarMenuEdicion(bot, chatId, userSessions[chatId]!);
      }
    };

    const manejarValidacionMonto = async (chatId: number, nuevoValor: string, session: UserSession) => {
      const montoNumerico = this.chequearMontoDesdeMensaje(nuevoValor);
      if (montoNumerico === null) {
        await bot.sendMessage(chatId, '⚠️ El monto debe ser un *número positivo* (entero o decimal). Intenta de nuevo. Formato: 12.34', {
          parse_mode: 'Markdown',
        });
        return;
      }
      session.monto = montoNumerico;
      session.estado = undefined;
      session.campo = undefined;
      session.modoEdicion = true;
      await bot.sendMessage(chatId, `✅ Monto actualizado. Nuevo valor: ${montoNumerico}`);
      mostrarMenuEdicion(bot, chatId, session);
    };

    const manejarValidacionFecha = async (chatId: number, nuevoValor: string, session: UserSession) => {
      const fechaValida = this.chequearFechaDesdeMensaje(nuevoValor);
      if (fechaValida === null) {
        await bot.sendMessage(chatId, '⚠️ La fecha debe ser válida y tener el formato *DD-MM-AAAA* (ej: 25-12-2025). Intenta de nuevo.', {
          parse_mode: 'Markdown',
        });
        return;
      }
      session.fecha = fechaValida;
      session.estado = undefined;
      session.campo = undefined;
      session.modoEdicion = true;
      await bot.sendMessage(chatId, `✅ Fecha actualizada. Nuevo valor: ${fechaValida}`);
      mostrarMenuEdicion(bot, chatId, session);
    };

    bot.on('message', async (msg) => {
      const chatId = msg.chat?.id;
      if (!chatId) return;
      const usuarioIdTelegram = msg.from?.id;
      const nuevoValor = msg.text || '';

      // Bienvenida si es la primera vez
      if (!userSessions[chatId]) {
        userSessions[chatId] = { modoEdicion: false };
        await bot.sendMessage(
          chatId,
          "👋 ¡Bienvenido/a al asistente financiero!\n\n" +
            "Podés enviarme un mensaje describiendo un gasto, por ejemplo:\n" +
            "👉 *\"Gaste 2500 en supermercado ayer\"*",
          { parse_mode: 'Markdown' }
        );
        return;
      }

      const session = userSessions[chatId];

      if (session.estado === 'esperando_monto') {
        await manejarValidacionMonto(chatId, nuevoValor, session);
        return;
      }
      if (session.estado === 'esperando_fecha') {
        await manejarValidacionFecha(chatId, nuevoValor, session);
        return;
      }
      if (session.modoEdicion && session.estado === 'esperando_descripcion' && session.campo === 'descripcion') {
        session.descripcion = nuevoValor.trim();
        session.estado = undefined;
        session.campo = undefined;
        await bot.sendMessage(chatId, `✅ Descripción actualizada. Nuevo valor: ${nuevoValor.trim()}`);
        mostrarMenuEdicion(bot, chatId, session);
        return;
      }
      if (session.estado === 'esperando_categoria' || session.estado === 'esperando_billetera') {
        // Espera respuesta por teclado, no texto
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

        const datosProcesados = await this.openaiService.procesarEntrada(tipo, contenido);

        if (datosProcesados) {
          if (!userSessions[chatId]) {
            userSessions[chatId] = { modoEdicion: false };
          }
          const currentSession = userSessions[chatId];

          if (!currentSession.billetera) {
            const billeteraDefault = await this.billeteraService.findDefault(String(userIdTelegram));
            if (billeteraDefault) {
                currentSession.billetera = billeteraDefault.nombre; // o el campo que uses como identificador
            }
          }


          if (datosProcesados.monto) currentSession.monto = datosProcesados.monto;
          if (datosProcesados.fecha) currentSession.fecha = datosProcesados.fecha;
          if (datosProcesados.categoria) currentSession.categoria = datosProcesados.categoria;
          if (datosProcesados.descripcion) currentSession.descripcion = datosProcesados.descripcion;
        }


        const datos = userSessions[chatId];
        const mensajeInicial = this.getDatosMensaje(datos, '📋 Datos detectados:', true);
        mensajeInicial.text += `¿Deseás confirmarlos?`;

        const sentMessage = await bot.sendMessage(chatId, mensajeInicial.text, {
          reply_markup: mensajeInicial.reply_markup,
        });

        userSessions[chatId]!.originalMessageId = sentMessage.message_id;
      } catch (e) {
        console.error(e);
        bot.sendMessage(chatId, '❌ Error al procesar el mensaje.');
      }
    });

    bot.on('callback_query', async (query) => {
      const chatId = query.message!.chat.id;
      const messageId = query.message!.message_id;
      const userIdTelegram = query.message?.from?.id;
      const user = await this.usuarioService.findByTelegramId(String(userIdTelegram));

      if (!chatId) return;
      const data = query.data;
      if (!data) return;

      const sessionData = userSessions[chatId];
      if (!sessionData) {
        bot.sendMessage(chatId, '❌ No se encontró una sesión activa para esta operación.');
        return;
      }

      const originalMessageId = sessionData.originalMessageId;

      if (data === 'confirmar') {
        if (!this.datosCompletos(sessionData)) {
          const faltantes = this.camposFaltantes(sessionData);
          await bot.sendMessage(
            chatId,
            `⚠️ No podés confirmar. Faltan los siguientes datos obligatorios:\n` +
              faltantes.map(f => `- ${f}`).join('\n')
          );
          bot.answerCallbackQuery(query.id);
          return;
        }

        const mensajeFinal = this.getDatosMensaje(sessionData, '✅ Datos confirmados y guardados:').text;
        await bot.editMessageText(mensajeFinal, {
          chat_id: chatId,
          message_id: messageId,
          reply_markup: { inline_keyboard: [] },
        }).catch(console.error);

        const operacionData = await this.convertirUserSessionAOperacionData(sessionData);
        if (!operacionData) {
          await bot.sendMessage(chatId, '❌ Error al convertir los datos. Por favor, intenta de nuevo.');
          return;
        }

        await this.openaiService.guardarDatos(operacionData);
        bot.sendMessage(chatId, '✅ ¡Operación guardada exitosamente!');
        delete userSessions[chatId];
      }
      else if (data === 'cancelar_op') {
        // Cancelación total de la operación
        await bot.editMessageText('❌ Operación cancelada y datos descartados.', {
          chat_id: chatId,
          message_id: messageId,
          reply_markup: { inline_keyboard: [] },
        }).catch(console.error);
        await bot.sendMessage(chatId, '❌ Operación cancelada y datos descartados.');
        delete userSessions[chatId];
      }
      else if (data === 'editar') {
        sessionData.modoEdicion = true;
        sessionData.originalMessageId = messageId;
        mostrarMenuEdicion(bot, chatId, sessionData);
      }
      else if (data === 'confirmar_edicion') {
        await bot.deleteMessage(chatId, messageId).catch(console.error);
        if (originalMessageId) {
          await bot.deleteMessage(chatId, originalMessageId).catch(console.error);
        }
        sessionData.modoEdicion = false;
        sessionData.estado = undefined;
        sessionData.campo = undefined;

        const mensajeActualizado = this.getDatosMensaje(sessionData, '📋 Datos actualizados. ¿Confirmar?', true);
        const sentMessage = await bot.sendMessage(chatId, mensajeActualizado.text, {
          reply_markup: mensajeActualizado.reply_markup,
        });
        sessionData.originalMessageId = sentMessage.message_id;
      }
      else if (data === 'cancelar_edicion') {
        // Cancelar solo la edición del campo actual
        await bot.deleteMessage(chatId, messageId).catch(console.error);
        const campo = sessionData.campo;
        await bot.sendMessage(chatId, `❌ Cambio de *${campo ?? 'campo'}* cancelado.`, { parse_mode: 'Markdown' });
        mostrarMenuEdicion(bot, chatId, sessionData);
      }
      else if (data.startsWith('editar_')) {
        const campo = data.replace('editar_', '') as 'monto' | 'fecha' | 'categoria' | 'descripcion' | 'billetera';
        await bot.deleteMessage(chatId, messageId).catch(console.error);

        if (campo === 'categoria') {
          mostrarMenuCategorias(bot, chatId);
        } else if (campo === 'billetera') {
          mostrarMenuBilleteras(bot, chatId, user!.authId);
        } else {
          sessionData.estado = `esperando_${campo}` as UserSession['estado'];
          sessionData.campo = campo;
          let prompt = '';
          if (campo === 'monto') {
            prompt = '✏️ Ingresá el nuevo *monto* (solo números, puedes usar decimales con punto o coma):';
          } else if (campo === 'fecha') {
            prompt = '✏️ Ingresá la nueva *fecha* en formato DD-MM-AAAA (ej: 25-12-2025):';
          } else if (campo === 'descripcion') {
            prompt = '✏️ Ingresá la nueva *descripción*:';
          }
          bot.sendMessage(chatId, prompt, {
            parse_mode: 'Markdown',
            reply_markup: {
              force_reply: true,
              inline_keyboard: [
                [{ text: '❌ Cancelar', callback_data: 'cancelar_edicion' }],
              ],
            },
          });
        }
      }
      else if (data.startsWith('select_cat:')) {
        const categoriaNombre = data.substring('select_cat:'.length);
        await bot.deleteMessage(chatId, messageId).catch(console.error);
        sessionData.categoria = categoriaNombre;
        sessionData.estado = undefined;
        sessionData.campo = undefined;
        sessionData.modoEdicion = true;
        await bot.sendMessage(chatId, `✅ Categoría actualizada. Nuevo valor: *${categoriaNombre}*`, { parse_mode: 'Markdown' });
        mostrarMenuEdicion(bot, chatId, sessionData);
      }
      else if (data.startsWith('select_wall:')) {
        const billeteraNombre = data.substring('select_wall:'.length);
        await bot.deleteMessage(chatId, messageId).catch(console.error);
        sessionData.billetera = billeteraNombre;
        sessionData.estado = undefined;
        sessionData.campo = undefined;
        sessionData.modoEdicion = true;
        await bot.sendMessage(chatId, `✅ Billetera actualizada: *${billeteraNombre}*`, { parse_mode: 'Markdown' });
        mostrarMenuEdicion(bot, chatId, sessionData);
      }

      bot.answerCallbackQuery(query.id);
    });
  }

  public async start() {
    try {
      await this.startBot();
    } catch (error) {
      console.error(error);
    }
  }
}
