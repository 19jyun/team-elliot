import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    // 디버깅 로그 (테스트 환경에서만)
    if (process.env.NODE_ENV === 'test') {
      console.log('=== Roles Guard Debug ===');
      console.log('Required roles:', requiredRoles);
      console.log('User object:', user);
      console.log('User role:', user?.role);
      console.log('Includes check:', requiredRoles.includes(user?.role));
    }

    return requiredRoles.includes(user?.role);
  }
}
