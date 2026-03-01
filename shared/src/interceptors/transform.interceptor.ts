import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { successResponse } from '../utils/response.utils';

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, any> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const requestId = request.headers['x-request-id'] || crypto.randomUUID();
    
    return next.handle().pipe(
      map((data) => successResponse(data, request.url, requestId)),
    );
  }
}