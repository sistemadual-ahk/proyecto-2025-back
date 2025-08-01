"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.enviarError = exports.enviarRespuesta = void 0;
const enviarRespuesta = (res, statusCode, data) => {
    return res.status(statusCode).json({ data });
};
exports.enviarRespuesta = enviarRespuesta;
const enviarError = (res, statusCode, error) => {
    return res.status(statusCode).json({ error });
};
exports.enviarError = enviarError;
