import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // 디버깅 로그 (테스트 환경에서만)
    if (process.env.NODE_ENV === 'test') {
      console.log('=== JWT Auth Guard Debug ===');
      console.log('Context handler:', context.getHandler().name);
      console.log('Context class:', context.getClass().name);
      console.log('Calling super.canActivate');
    }

    return super.canActivate(context);
  }
}
