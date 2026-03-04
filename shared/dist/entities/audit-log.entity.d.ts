import { BaseEntity } from './base.entity';
export declare enum AuditAction {
    CREATE = "create",
    UPDATE = "update",
    DELETE = "delete",
    LOGIN = "login",
    LOGOUT = "logout",
    VIEW = "view",
    EXPORT = "export",
    PAYMENT = "payment"
}
export declare class AuditLog extends BaseEntity {
    logId: string;
    userId: string | null;
    action: AuditAction;
    entityType: string;
    entityId: string | null;
    oldValues: string | null;
    newValues: string | null;
    ipAddress: string;
    userAgent: string | null;
    sessionId: string | null;
    reason: string | null;
}
