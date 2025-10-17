import TelegramBot from 'node-telegram-bot-api';
import { procesarEntrada, guardarDatos, borrarDatos } from './api_chatgpt';
import axios from 'axios';
import fs from 'fs';

interface UserSession {
    modoEdicion: boolean;
    estado?: 'esperando_monto' | 'esperando_fecha' | 'esperando_general' | 'menu_principal';
    campo?: 'monto' | 'fecha' | 'categoria' | 'descripcion';
    monto?: number | string;
    fecha?: string;
    categoria?: string;
    descripcion?: string;
}

const token = process.env['TELEGRAM_BOT_TOKEN']!;
const userSessions: Record<number, UserSession> = {};
if (!token) throw new Error('TELEGRAM_BOT_TOKEN no está definido');

function chequearEnteroDesdeMensaje(textoRecibido: string): number | null {
    const valorLimpio = textoRecibido.trim();
    if (valorLimpio === '') return null;
    const numeroConvertido = Number(valorLimpio);

    if (
        !isNaN(numeroConvertido) &&
        isFinite(numeroConvertido) &&
        Number.isInteger(numeroConvertido)
    ) {
        if (String(numeroConvertido) === valorLimpio) {
            return numeroConvertido;
        }
    }
    return null;
}

function chequearFechaDesdeMensaje(textoRecibido: string): string | null {
    const valorLimpio = textoRecibido.trim();
    const regexFecha = /^(\d{2})-(\d{2})-(\d{4})$/;
    const match = valorLimpio.match(regexFecha);

    if (!match) {
        return null;
    }

    const dia = parseInt(match[1], 10);
    const mes = parseInt(match[2], 10);
    const anio = parseInt(match[3], 10);

    const fecha = new Date(anio, mes - 1, dia);

    if (
        fecha.getFullYear() === anio &&
        fecha.getMonth() === mes - 1 &&
        fecha.getDate() === dia
    ) {
        return valorLimpio; 
    }

    return null;
}


function datosCompletos(datos: any): boolean {
    return datos.monto && datos.fecha && datos.categoria && datos.descripcion;
}

function camposFaltantes(datos: any): string[] {
    const campos = ['monto', 'fecha', 'categoria', 'descripcion'];
    return campos.filter(c => !datos[c]);
}

async function startBot() {
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

    async function manejarValidacionMonto(chatId: number, nuevoValor: string, session: UserSession) {
        const campo = session.campo as string;
        const montoNumerico = chequearEnteroDesdeMensaje(nuevoValor);

        if (montoNumerico === null) {
            await bot.sendMessage(chatId, '⚠️ El monto debe ser un *número entero válido*. Intenta de nuevo.', {
                parse_mode: 'Markdown'
            });
            await bot.sendMessage(chatId, `✏️ Ingresá el nuevo valor para *${campo}*:`, {
                parse_mode: 'Markdown',
                reply_markup: { force_reply: true },
            });
            return; 
        }

        session.monto = montoNumerico; 
        session.estado = undefined; 
        session.campo = undefined;
        
        await bot.sendMessage(chatId, `✅ ${campo} actualizado. Nuevo valor: ${montoNumerico}`);
        mostrarMenuEdicion(bot, chatId, session);
    }
    
    async function manejarValidacionFecha(chatId: number, nuevoValor: string, session: UserSession) {
        const campo = session.campo as string;
        const fechaValida = chequearFechaDesdeMensaje(nuevoValor);

        if (fechaValida === null) {
            await bot.sendMessage(chatId, '⚠️ La fecha debe ser válida y tener el formato *DD-MM-AAAA* (ej: 25-12-2025). Intenta de nuevo.', {
                parse_mode: 'Markdown'
            });
            await bot.sendMessage(chatId, `✏️ Ingresá el nuevo valor para *${campo}*:`, {
                parse_mode: 'Markdown',
                reply_markup: { force_reply: true },
            });
            return; 
        }

        session.fecha = fechaValida; 
        session.estado = undefined; 
        session.campo = undefined;
        
        await bot.sendMessage(chatId, `✅ ${campo} actualizado. Nuevo valor: ${fechaValida}`);
        mostrarMenuEdicion(bot, chatId, session);
    }

    bot.on('message', async (msg) => {
        const chatId = msg.chat?.id;
        if (!chatId) return;

        const session = userSessions[chatId];
        const nuevoValor = msg.text || ''; 

        if (session?.estado === 'esperando_monto') {
            await manejarValidacionMonto(chatId, nuevoValor, session);
            return; 
        }
        
        
        if (session?.estado === 'esperando_fecha') {
            await manejarValidacionFecha(chatId, nuevoValor, session);
            return; 
        }
        
        if (session?.modoEdicion && session.estado === 'esperando_general') {
            const campo = session.campo as string;
            session[campo as keyof UserSession] = nuevoValor.trim();
            
            session.estado = undefined; 
            session.campo = undefined;

            await bot.sendMessage(chatId, `✅ ${campo} actualizado. Nuevo valor: ${nuevoValor.trim()}`);
            mostrarMenuEdicion(bot, chatId, session);
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
                userSessions[chatId] = { modoEdicion: false };
            }

            const currentSession = userSessions[chatId]; 

            for (const [clave, valor] of Object.entries(datosProcesados || {})) {
                if (valor !== null && valor !== undefined && valor !== '') {
                    currentSession[clave as keyof UserSession] = valor;
                }
            }

            const datos = currentSession;

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
            sessionData.modoEdicion = false;
            sessionData.estado = undefined;
            sessionData.campo = undefined;
            await guardarDatos(sessionData);
            bot.sendMessage(chatId, '✅ Datos confirmados.');
            delete userSessions[chatId];

        } else if (data === 'editar') {
            sessionData.modoEdicion = true;
            mostrarMenuEdicion(bot, chatId, sessionData);

        } else if (data === 'cancelar') {
            sessionData.modoEdicion = false;
            sessionData.estado = undefined;
            sessionData.campo = undefined;
            await borrarDatos(sessionData);
            bot.sendMessage(chatId, '❌ Operación cancelada.');
            delete userSessions[chatId];

        } else if (data.startsWith('editar_')) {
            const campo = data.replace('editar_', '') as keyof UserSession;

            sessionData.modoEdicion = true;
            sessionData.campo = campo;

            if (campo === 'monto') {
                sessionData.estado = 'esperando_monto';
            } else if (campo === 'fecha') {
                sessionData.estado = 'esperando_fecha';
            } else {
                sessionData.estado = 'esperando_general';
            }
            
            await bot.sendMessage(chatId, `✏️ Ingresá el nuevo valor para *${campo}*:`, {
                parse_mode: 'Markdown',
                reply_markup: { force_reply: true },
            });
        }

        bot.answerCallbackQuery(query.id);
    });
}

startBot().catch(console.error);