"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const saludo_controller_1 = require("../controllers/saludo.controller");
const router = express_1.default.Router();
router.get("/", saludo_controller_1.saludoInicial);
router.post("/saludar", saludo_controller_1.saludarNombre);
exports.default = router;
