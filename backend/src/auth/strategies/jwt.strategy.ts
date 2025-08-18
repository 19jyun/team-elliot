import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    const { sub, userId, role } = payload;

    // 디버깅 로그 (테스트 환경에서만)
    if (process.env.NODE_ENV === 'test') {
      console.log('=== JWT Strategy Debug ===');
      console.log('Payload:', payload);
      console.log('Sub:', sub);
      console.log('UserId:', userId);
      console.log('Role:', role);
      console.log('Returning user object:', { id: sub, userId, role });
    }

    return { id: sub, userId, role };
  }
}
