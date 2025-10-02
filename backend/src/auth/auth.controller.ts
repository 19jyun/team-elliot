import { Controller, Post, Body, UseGuards, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { CheckUserIdDto } from './dto/check-userid.dto';
import { WithdrawalReasonDto } from './dto/withdrawal-reason.dto';
import { AuthResponseEntity } from './entities/auth-response.entity';
import { CheckUserIdResponseEntity } from './entities/check-userid-response.entity';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GetUser } from './decorators/get-user.decorator';
import { AuthenticatedUser } from './types/auth.types';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiOkResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: '로그인' })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({ description: '로그인 성공', type: AuthResponseEntity })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.userId, loginDto.password);
  }

  @Post('refresh')
  @ApiOperation({ summary: '토큰 갱신' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string', description: '사용자 ID' },
      },
      required: ['userId'],
    },
  })
  @ApiOkResponse({ description: '토큰 갱신 성공', type: AuthResponseEntity })
  async refreshToken(@Body() body: { userId: string }) {
    return this.authService.refreshToken(body.userId);
  }

  @Post('signup')
  @ApiOperation({ summary: '회원가입' })
  @ApiBody({ type: SignupDto })
  @ApiCreatedResponse({
    description: '회원가입 성공',
    type: AuthResponseEntity,
  })
  async signup(@Body() signupDto: SignupDto) {
    return this.authService.signup(signupDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @ApiOperation({ summary: '로그아웃' })
  @ApiOkResponse({
    description: '로그아웃 성공',
    schema: { example: { message: '로그아웃되었습니다' } },
  })
  async logout() {
    return { message: '로그아웃되었습니다' };
  }

  @UseGuards(JwtAuthGuard)
  @Post('withdrawal')
  @ApiOperation({ summary: '회원 탈퇴' })
  @ApiBody({ type: WithdrawalReasonDto })
  @ApiOkResponse({
    description: '탈퇴 성공',
    schema: { example: { message: '회원 탈퇴가 완료되었습니다.' } },
  })
  async withdrawal(
    @GetUser() user: AuthenticatedUser,
    @Body() body: WithdrawalReasonDto,
  ): Promise<{ message: string }> {
    await this.authService.withdrawal(parseInt(user.id), body.reason);
    return { message: '회원 탈퇴가 완료되었습니다.' };
  }

  @Post('check-userid')
  @ApiOperation({ summary: '아이디 중복 체크' })
  @ApiBody({ type: CheckUserIdDto })
  @ApiOkResponse({
    description: '중복 여부 반환',
    type: CheckUserIdResponseEntity,
  })
  async checkUserId(
    @Body() body: CheckUserIdDto,
  ): Promise<{ available: boolean }> {
    return this.authService.checkUserId(body.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('session')
  @ApiOperation({ summary: '현재 세션 정보 조회' })
  @ApiOkResponse({
    description: '세션 정보 조회 성공',
    schema: {
      example: {
        user: {
          id: 1,
          userId: 'testuser',
          name: '테스트 사용자',
          role: 'student',
        },
        expiresAt: 1704067200000,
      },
    },
  })
  async getSession(@GetUser() user: AuthenticatedUser) {
    return this.authService.getSession(user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('verify')
  @ApiOperation({ summary: '토큰 유효성 검증' })
  @ApiOkResponse({
    description: '토큰 검증 성공',
    schema: {
      example: {
        valid: true,
        user: {
          id: 1,
          userId: 'testuser',
          name: '테스트 사용자',
          role: 'student',
        },
      },
    },
  })
  async verifyToken(@GetUser() user: AuthenticatedUser) {
    return this.authService.verifyToken(user);
  }
}
