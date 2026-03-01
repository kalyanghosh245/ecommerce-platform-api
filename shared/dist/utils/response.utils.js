"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessException = exports.errorResponse = exports.successResponse = void 0;
const common_1 = require("@nestjs/common");
const successResponse = (data, path, requestId) => ({
    success: true,
    data,
    meta: {
        timestamp: new Date().toISOString(),
        requestId,
        path,
    },
});
exports.successResponse = successResponse;
const errorResponse = (code, message, path, requestId, details) => ({
    success: false,
    error: {
        code,
        message,
        details,
    },
    meta: {
        timestamp: new Date().toISOString(),
        requestId,
        path,
    },
});
exports.errorResponse = errorResponse;
class BusinessException extends Error {
    constructor(code, message, status = common_1.HttpStatus.BAD_REQUEST) {
        super(message);
        this.code = code;
        this.status = status;
        this.name = 'BusinessException';
    }
}
exports.BusinessException = BusinessException;
//# sourceMappingURL=response.utils.js.map