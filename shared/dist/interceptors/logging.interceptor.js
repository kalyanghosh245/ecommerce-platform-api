"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggingInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
const audit_log_entity_1 = require("../entities/audit-log.entity");
let LoggingInterceptor = class LoggingInterceptor {
    intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        const start = Date.now();
        const userId = request.user?.id;
        const action = this.mapMethodToAction(request.method);
        return next.handle().pipe((0, operators_1.tap)({
            next: () => {
                this.logAudit(request, action, userId, Date.now() - start, null);
            },
            error: (error) => {
                this.logAudit(request, action, userId, Date.now() - start, error);
            },
        }));
    }
    mapMethodToAction(method) {
        switch (method) {
            case 'POST': return audit_log_entity_1.AuditAction.CREATE;
            case 'PUT':
            case 'PATCH': return audit_log_entity_1.AuditAction.UPDATE;
            case 'DELETE': return audit_log_entity_1.AuditAction.DELETE;
            default: return audit_log_entity_1.AuditAction.VIEW;
        }
    }
    logAudit(request, action, userId, duration, error) {
        console.log(JSON.stringify({
            timestamp: new Date().toISOString(),
            action,
            userId,
            path: request.url,
            method: request.method,
            ip: request.ip,
            userAgent: request.headers['user-agent'],
            duration,
            error: error ? error.message : undefined,
        }));
    }
};
exports.LoggingInterceptor = LoggingInterceptor;
exports.LoggingInterceptor = LoggingInterceptor = __decorate([
    (0, common_1.Injectable)()
], LoggingInterceptor);
//# sourceMappingURL=logging.interceptor.js.map