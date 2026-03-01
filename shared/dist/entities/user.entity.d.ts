import { BaseEntity } from './base.entity';
import { Order } from './order.entity';
export declare enum UserRole {
    ADMIN = "admin",
    MANAGER = "manager",
    CUSTOMER = "customer",
    GUEST = "guest"
}
export declare class User extends BaseEntity {
    email: string;
    passwordHash: string | null;
    firstName: string;
    lastName: string;
    phone: string | null;
    role: UserRole;
    isEmailVerified: boolean;
    isActive: boolean;
    preferences: {
        marketingEmails: boolean;
        smsNotifications: boolean;
        language: string;
        currency: string;
        addresses: any;
    };
    consentMarketingAt: Date | null;
    consentIp: string | null;
    deletionRequestedAt: Date | null;
    orders: Order[];
}
