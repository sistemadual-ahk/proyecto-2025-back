"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saludarNombre = exports.saludoInicial = void 0;
const saludo_service_1 = require("../services/saludo.service");
const base_controller_1 = require("./base.controller");
const saludoInicial = (_req, res) => {
    return (0, base_controller_1.enviarRespuesta)(res, 200, "¡Hola desde la API con TypeScript y Express!");
};
exports.saludoInicial = saludoInicial;
const saludarNombre = (req, res) => {
    const { nombre } = req.body;
    if (!nombre) {
        return (0, base_controller_1.enviarError)(res, 400, "Falta el campo 'nombre'");
    }
    const mensaje = (0, saludo_service_1.obtenerMensajeSaludo)(nombre);
    return (0, base_controller_1.enviarRespuesta)(res, 200, mensaje);
};
exports.saludarNombre = saludarNombre;
