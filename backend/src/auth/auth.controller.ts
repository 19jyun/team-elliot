import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GetUser } from './decorators/get-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: { userId: string; password: string }) {
    return this.authService.login(loginDto.userId, loginDto.password);
  }

  @Post('signup')
  async signup(@Body() signupDto: SignupDto) {
    return this.authService.signup(signupDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout() {
    return { message: '로그아웃되었습니다' };
  }

  @UseGuards(JwtAuthGuard)
  @Post('withdrawal')
  async withdrawal(
    @GetUser() user: any,
    @Body() body: { reason: string },
  ): Promise<{ message: string }> {
    await this.authService.withdrawal(user.id, body.reason);
    return { message: '회원 탈퇴가 완료되었습니다.' };
  }

  @Post('check-userid')
  async checkUserId(
    @Body() body: { userId: string },
  ): Promise<{ available: boolean }> {
    return this.authService.checkUserId(body.userId);
  }
}
