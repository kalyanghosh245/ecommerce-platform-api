import { UserRole } from '../entities/user.entity';
export declare class CreateUserDto {
    userId: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role?: UserRole;
    preferences?: {
        marketingEmails?: boolean;
        smsNotifications?: boolean;
        language?: string;
        currency?: string;
    };
}
export declare class UpdateUserDto {
    firstName?: string;
    lastName?: string;
    phone?: string;
    isEmailVerified?: boolean;
    isActive?: boolean;
    preferences?: {
        marketingEmails?: boolean;
        smsNotifications?: boolean;
        language?: string;
        currency?: string;
    };
}
export declare class UserResponseDto {
    userId: string;
    email: string;
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
    };
    createdAt: Date;
    updatedAt: Date;
}
export declare class UserLoginDto {
    email: string;
    password: string;
}
export declare class ChangePasswordDto {
    currentPassword: string;
    newPassword: string;
}
export declare class UserFilterDto {
    role?: UserRole;
    isActive?: boolean;
    isEmailVerified?: boolean;
}
