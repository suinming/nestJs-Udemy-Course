import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { map } from 'rxjs';

export class CustomInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, handler: CallHandler) {
    return handler.handle().pipe(
      map((data) => {
        const res = {
          ...data,
          createdAt: data.created_at,
        };
        delete res.updated_at;
        delete res.created_at;
        return res;
      }),
    );
  }
}
