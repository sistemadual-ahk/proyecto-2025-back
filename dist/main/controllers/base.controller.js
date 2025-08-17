"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseController = void 0;
class BaseController {
    sendSuccess(res, statusCode = 200, data = null, message) {
        const response = {
            success: true,
            data,
            timestamp: new Date().toISOString()
        };
        if (message) {
            response.message = message;
        }
        return res.status(statusCode).json(response);
    }
}
exports.BaseController = BaseController;
//# sourceMappingURL=base.controller.js.map