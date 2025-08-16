"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var db_1 = require("./config/db");
var app_1 = require("./main/app");
var PORT = process.env['PORT'] || 3000;
(0, db_1.connectDB)().then(function () {
    app_1.default.listen(PORT, function () {
        console.log("Servidor corriendo en puerto ".concat(PORT));
    });
});
