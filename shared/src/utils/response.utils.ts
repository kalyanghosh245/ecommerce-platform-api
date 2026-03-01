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

export const successResponse = <T>(
  data: T,
  path: string,
  requestId: string
): ApiResponse<T> => ({
  success: true,
  data,
  meta: {
    timestamp: new Date().toISOString(),
    requestId,
    path,
  },
});

export const errorResponse = (
  code: string,
  message: string,
  path: string,
  requestId: string,
  details?: any
): ApiResponse<null> => ({
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

export class BusinessException extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: HttpStatus = HttpStatus.BAD_REQUEST
  ) {
    super(message);
    this.name = 'BusinessException';
  }
}