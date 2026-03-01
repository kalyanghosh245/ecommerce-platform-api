import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditAction } from '../entities/audit-log.entity';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const start = Date.now();
    const userId = request.user?.id;
    const action = this.mapMethodToAction(request.method);
    
    return next.handle().pipe(
      tap({
        next: () => {
          this.logAudit(request, action, userId, Date.now() - start, null);
        },
        error: (error) => {
          this.logAudit(request, action, userId, Date.now() - start, error);
        },
      }),
    );
  }

  private mapMethodToAction(method: string): AuditAction {
    switch (method) {
      case 'POST': return AuditAction.CREATE;
      case 'PUT':
      case 'PATCH': return AuditAction.UPDATE;
      case 'DELETE': return AuditAction.DELETE;
      default: return AuditAction.VIEW;
    }
  }

  private logAudit(
    request: any,
    action: AuditAction,
    userId: string | undefined,
    duration: number,
    error: any
  ) {
    // In production, send to audit service or database
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
}