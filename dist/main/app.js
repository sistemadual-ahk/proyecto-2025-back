"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const routes_1 = require("@routes/routes");
const error_middleware_1 = require("@middlewares/error.middleware");
const cors = require('cors');
const app = (0, express_1.default)();
app.set("trust proxy", true);
app.use(express_1.default.json());
app.use(cors());
// Middleware de log
app.use((req, _res, next) => {
    console.log(`Método: ${req.method} - URL: ${req.url}`);
    next();
});
routes_1.routes.forEach(route => app.use(route.path, route.handler));
app.use(error_middleware_1.errorHandler);
exports.default = app;
//# sourceMappingURL=app.js.map