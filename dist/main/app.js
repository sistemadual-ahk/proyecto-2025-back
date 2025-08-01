"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const saludo_routes_1 = __importDefault(require("./routes/saludo.routes"));
const app = (0, express_1.default)();
app.set("trust proxy", true);
app.use(express_1.default.json());
app.use((req, res, next) => {
    console.log(`Método: ${req.method} - URL: ${req.url}`);
    next();
});
const routes = [
    { path: "/api/saludos", handler: saludo_routes_1.default },
];
routes.forEach(route => app.use(route.path, route.handler));
exports.default = app;
