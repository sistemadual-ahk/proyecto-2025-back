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
exports.connectDB = exports.MongoDBClient = void 0;
var mongoose_1 = require("mongoose");
var dotenv = require("dotenv");
dotenv.config();
var MongoDBClient = /** @class */ (function () {
    function MongoDBClient() {
    }
    MongoDBClient.connect = function () {
        return __awaiter(this, void 0, void 0, function () {
            var MONGO_URI, MONGO_DB_NAME, MONGO_DB_PARAMS, connectionString, conn, error_1, errorMessage;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        MONGO_URI = process.env['MONGODB_URI'];
                        MONGO_DB_NAME = process.env['MONGODB_DB_NAME'];
                        MONGO_DB_PARAMS = process.env['MONGODB_PARAMS'];
                        if (!MONGO_URI) {
                            console.log("⚠️  MONGODB_URI no configurada. El servidor funcionará sin base de datos.");
                            return [2 /*return*/];
                        }
                        connectionString = MONGO_DB_NAME
                            ? "".concat(MONGO_URI, "/").concat(MONGO_DB_NAME, "?").concat(MONGO_DB_PARAMS)
                            : MONGO_URI;
                        return [4 /*yield*/, mongoose_1.default.connect(connectionString)];
                    case 1:
                        conn = _a.sent();
                        console.log("\u2705 MongoDB conectado: ".concat(conn.connection.host));
                        console.log("\uD83D\uDCCA Base de datos: ".concat(conn.connection.name));
                        console.log("\uD83D\uDD17 URI de conexi\u00F3n: ".concat(connectionString));
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        errorMessage = error_1 instanceof Error ? error_1.message : 'Error desconocido';
                        console.error("\u274C Error al conectar a MongoDB: ".concat(errorMessage));
                        process.exit(1);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    MongoDBClient.disconnect = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_2, errorMessage;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, mongoose_1.default.disconnect()];
                    case 1:
                        _a.sent();
                        console.log("✅ Desconectado de MongoDB");
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _a.sent();
                        errorMessage = error_2 instanceof Error ? error_2.message : 'Error desconocido';
                        console.error("\u274C Error al desconectar de MongoDB: ".concat(errorMessage));
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    MongoDBClient.getConnectionStatus = function () {
        return mongoose_1.default.connection.readyState === 1 ? 'connected' : 'disconnected';
    };
    return MongoDBClient;
}());
exports.MongoDBClient = MongoDBClient;
// Mantener la función connectDB para compatibilidad
var connectDB = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, MongoDBClient.connect()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
exports.connectDB = connectDB;
