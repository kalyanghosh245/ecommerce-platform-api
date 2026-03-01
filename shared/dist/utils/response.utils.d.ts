import { HttpStatus } from '@nestjs/common';
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
        details?: any;
    };
    meta?: {
        timestamp: string;
        requestId: string;
        path: string;
    };
}
export declare const successResponse: <T>(data: T, path: string, requestId: string) => ApiResponse<T>;
export declare const errorResponse: (code: string, message: string, path: string, requestId: string, details?: any) => ApiResponse<null>;
export declare class BusinessException extends Error {
    readonly code: string;
    readonly status: HttpStatus;
    constructor(code: string, message: string, status?: HttpStatus);
}
