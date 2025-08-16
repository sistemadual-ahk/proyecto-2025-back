"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var openai_1 = require("openai");
var path = require("path");
var fs = require("fs");
var fluent_ffmpeg_1 = require("fluent-ffmpeg");
var db_1 = require("../config/db");
var mongoose_1 = require("mongoose");
var client = new openai_1.default({
    apiKey: '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',
});
function extraerJSONDeRespuesta(texto) {
    var match = texto.match(/```json\n([\s\S]*)\n```/);
    if (match && match[1]) {
        return match[1].trim();
    }
    try {
        JSON.parse(texto);
        return texto;
    }
    catch (e) {
        return null;
    }
}
function parsearAudios(audio_path) {
    return new Promise(function (resolve, reject) {
        var ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
        fluent_ffmpeg_1.default.setFfmpegPath(ffmpegPath);
        if (!fs.existsSync(audio_path)) {
            reject("Error: El archivo de entrada \"".concat(audio_path, "\" no se encuentra."));
            return;
        }
        console.log("Convirtiendo \"".concat(audio_path, "\" a mp3..."));
        var output_path = audio_path.replace(path.extname(audio_path), '.mp3');
        (0, fluent_ffmpeg_1.default)(audio_path)
            .toFormat('mp3')
            .on('end', function () {
            console.log('Conversión finalizada.');
            resolve(output_path);
        })
            .on('error', function (err) {
            console.error('Error durante la conversión:', err);
            reject(err);
        })
            .save(output_path);
    });
}
var operacionSchema = new mongoose_1.default.Schema({
    total: Number,
    fecha: Date,
    categoria: String,
    descripcion: String,
    telefono: String,
});
var OperacionModel = mongoose_1.default.model('Operacion', operacionSchema);
function saveToDatabase(operacion) {
    return __awaiter(this, void 0, void 0, function () {
        var nuevoGasto, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.MongoDBClient.connect()];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    nuevoGasto = new OperacionModel(operacion);
                    return [4 /*yield*/, nuevoGasto.save()];
                case 3:
                    _a.sent();
                    console.log('✅ Gasto guardado en MongoDB.');
                    return [3 /*break*/, 5];
                case 4:
                    error_1 = _a.sent();
                    console.error('❌ Error al guardar el gasto en la base de datos:', error_1);
                    throw error_1;
                case 5: return [2 /*return*/];
            }
        });
    });
}
function procesarEntrada(tipoEntrada, datos) {
    return __awaiter(this, void 0, void 0, function () {
        var resultadoAPI, promptBase, imagenBase64, mp3_path, transcripcion, error_2, respuestaDeOpenAI, jsonLimpio, datosDeGasto, e_1, error_3;
        var _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    promptBase = "\n    Analiza la siguiente informaci\u00F3n de un gasto y extrae los siguientes campos: total, fecha, descripcion (basate en el mensaje) y categoria(Comida y Bebida, Compras, Vivienda, Transporte, Vehiculos, Vida y Entretenimiento, Comunicaciones/PC, Gastos Financieros, Inversiones, Ingreso, Otros).\n    Responde \u00DANICAMENTE con un objeto JSON v\u00E1lido, sin ning\u00FAn texto adicional, saludos o explicaciones. Si no especifica fecha, pone la fecha actual. Ademas quiero que analices para que categoria es el gasto, ponelo donde mas consideres o sino en Otros.\n    El formato del JSON debe ser: {\"total\": NUMERO, \"fecha\": \"DD-MM-YYYY\", \"categoria\": \"TIPO_CATEGORIA\"}.\n    Si no puedes encontrar alg\u00FAn campo, usa un valor null.\n  ";
                    _d.label = 1;
                case 1:
                    _d.trys.push([1, 20, , 21]);
                    if (!(tipoEntrada === 'texto')) return [3 /*break*/, 3];
                    console.log('Procesando mensaje de texto...');
                    return [4 /*yield*/, client.chat.completions.create({
                            model: 'gpt-4o',
                            messages: [{
                                    role: 'user',
                                    content: "".concat(promptBase, "\n\nInformaci\u00F3n: ").concat(datos),
                                }],
                        })];
                case 2:
                    resultadoAPI = _d.sent();
                    return [3 /*break*/, 13];
                case 3:
                    if (!(tipoEntrada === 'imagen')) return [3 /*break*/, 5];
                    console.log('Procesando imagen de ticket...');
                    imagenBase64 = fs.readFileSync(datos, 'base64');
                    return [4 /*yield*/, client.chat.completions.create({
                            model: 'gpt-4o',
                            messages: [{
                                    role: 'user',
                                    content: [
                                        { type: 'text', text: promptBase },
                                        { type: 'image_url', image_url: { url: "data:image/jpeg;base64,".concat(imagenBase64) } },
                                    ],
                                }],
                        })];
                case 4:
                    resultadoAPI = _d.sent();
                    return [3 /*break*/, 13];
                case 5:
                    if (!(tipoEntrada === 'audio')) return [3 /*break*/, 12];
                    _d.label = 6;
                case 6:
                    _d.trys.push([6, 10, , 11]);
                    console.log('Procesando audio de gasto...');
                    return [4 /*yield*/, parsearAudios(datos)];
                case 7:
                    mp3_path = _d.sent();
                    return [4 /*yield*/, client.audio.transcriptions.create({
                            model: 'whisper-1',
                            file: fs.createReadStream(mp3_path),
                        })];
                case 8:
                    transcripcion = _d.sent();
                    console.log('Transcripción del audio:', transcripcion.text);
                    return [4 /*yield*/, client.chat.completions.create({
                            model: 'gpt-4o',
                            messages: [{
                                    role: 'user',
                                    content: "".concat(promptBase, "\n\nInformaci\u00F3n: ").concat(transcripcion.text),
                                }],
                        })];
                case 9:
                    resultadoAPI = _d.sent();
                    fs.unlinkSync(mp3_path);
                    return [3 /*break*/, 11];
                case 10:
                    error_2 = _d.sent();
                    console.error('Error al procesar el audio:', error_2);
                    return [2 /*return*/];
                case 11: return [3 /*break*/, 13];
                case 12:
                    console.log('Tipo de entrada no soportado.');
                    return [2 /*return*/];
                case 13:
                    respuestaDeOpenAI = ((_c = (_b = (_a = resultadoAPI.choices) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.message) === null || _c === void 0 ? void 0 : _c.content) || '';
                    console.log('Respuesta cruda de OpenAI:', respuestaDeOpenAI);
                    jsonLimpio = extraerJSONDeRespuesta(respuestaDeOpenAI);
                    if (!jsonLimpio) return [3 /*break*/, 18];
                    _d.label = 14;
                case 14:
                    _d.trys.push([14, 16, , 17]);
                    datosDeGasto = JSON.parse(jsonLimpio);
                    console.log('Gasto procesado y listo para guardar:', datosDeGasto);
                    return [4 /*yield*/, saveToDatabase(datosDeGasto)];
                case 15:
                    _d.sent();
                    return [3 /*break*/, 17];
                case 16:
                    e_1 = _d.sent();
                    console.error('Error al parsear el JSON limpio:', e_1);
                    return [3 /*break*/, 17];
                case 17: return [3 /*break*/, 19];
                case 18:
                    console.error('No se pudo extraer un JSON válido de la respuesta. La respuesta fue:', respuestaDeOpenAI);
                    _d.label = 19;
                case 19: return [3 /*break*/, 21];
                case 20:
                    error_3 = _d.sent();
                    console.error('Ocurrió un error en el procesamiento:', error_3);
                    return [3 /*break*/, 21];
                case 21: return [2 /*return*/];
            }
        });
    });
}
//procesarEntrada('texto', 'Compré comida por $25 en el restaurante La Esquina el 1 de agosto.');
//procesarEntrada('imagen', 'images/ticket.webp');
procesarEntrada('audio', 'audio/PTT-20250801-WA0022.opus');
