"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const saludo_controller_1 = require("@controllers/saludo.controller");
const error_middleware_1 = require("@middlewares/error.middleware");
const router = express_1.default.Router();
router.get("/", (0, error_middleware_1.asyncHandler)(saludo_controller_1.saludoController.obtenerSaludoGenerico));
router.post("/saludar", (0, error_middleware_1.asyncHandler)(saludo_controller_1.saludoController.saludarNombre));
router.post("/validar", (0, error_middleware_1.asyncHandler)(saludo_controller_1.saludoController.validarNombre));
exports.default = router;
//# sourceMappingURL=saludo.routes.js.map