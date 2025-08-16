"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var routes_1 = require("@routes/routes");
var error_middleware_1 = require("@middlewares/error.middleware");
var app = (0, express_1.default)();
app.set("trust proxy", true);
app.use(express_1.default.json());
// Middleware de log
app.use(function (req, _res, next) {
    console.log("M\u00E9todo: ".concat(req.method, " - URL: ").concat(req.url));
    next();
});
routes_1.routes.forEach(function (route) { return app.use(route.path, route.handler); });
app.use(error_middleware_1.errorHandler);
exports.default = app;
