"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saludoService = exports.SaludoService = void 0;
const error_middleware_1 = require("@middlewares/error.middleware");
class SaludoService {
    obtenerMensajeSaludo(nombre) {
        if (!nombre || nombre.trim().length === 0) {
            throw new error_middleware_1.ValidationError("El nombre es requerido");
        }
        const nombreFormateado = nombre.trim();
        return `Hola, ${nombreFormateado}!`;
    }
    obtenerSaludoGenerico() {
        return "¡Hola desde la API con TypeScript y Express!";
    }
    validarNombre(nombre) {
        return Boolean(nombre && nombre.trim().length > 0);
    }
}
exports.SaludoService = SaludoService;
exports.saludoService = new SaludoService();
//# sourceMappingURL=saludo.service.js.map