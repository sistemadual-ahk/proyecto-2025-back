"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saludoController = exports.SaludoController = void 0;
const saludo_service_1 = require("@services/saludo.service");
const base_controller_1 = require("./base.controller");
const error_middleware_1 = require("@middlewares/error.middleware");
class SaludoController extends base_controller_1.BaseController {
    obtenerSaludoGenerico = (_req, res) => {
        const mensaje = saludo_service_1.saludoService.obtenerSaludoGenerico();
        return this.sendSuccess(res, 200, mensaje, "Saludo obtenido exitosamente");
    };
    saludarNombre = (req, res) => {
        const { nombre } = req.body;
        if (!saludo_service_1.saludoService.validarNombre(nombre)) {
            throw new error_middleware_1.ValidationError("Error de validación", ["El campo 'nombre' es requerido y no puede estar vacío"]);
        }
        const mensaje = saludo_service_1.saludoService.obtenerMensajeSaludo(nombre);
        return this.sendSuccess(res, 200, mensaje, "Saludo personalizado generado exitosamente");
    };
    validarNombre = (req, res) => {
        const { nombre } = req.body;
        const esValido = saludo_service_1.saludoService.validarNombre(nombre);
        return this.sendSuccess(res, 200, {
            nombre,
            esValido
        }, esValido ? "Nombre válido" : "Nombre inválido");
    };
}
exports.SaludoController = SaludoController;
exports.saludoController = new SaludoController();
//# sourceMappingURL=saludo.controller.js.map