import { Controller, Post, Body, UseGuards, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { PrincipalSignupDto } from './dto/principal-signup.dto';
import { LoginDto } from './dto/login.dto';
import { CheckUserIdDto } from './dto/check-userid.dto';
import { CheckPhoneDto } from './dto/check-phone.dto';
import { WithdrawalReasonDto } from './dto/withdrawal-reason.dto';
import { AuthResponseEntity } from './entities/auth-response.entity';
import { CheckUserIdResponseEntity } from './entities/check-userid-response.entity';
import { CheckPhoneResponseEntity } from './entities/check-phone-response.entity';
import { PrincipalSignupResponseEntity } from './entities/principal-signup-response.entity';
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
  @ApiOperation({ summary: '회원가입 (Student, Teacher)' })
  @ApiBody({ type: SignupDto })
  @ApiCreatedResponse({
    description: '회원가입 성공',
    type: AuthResponseEntity,
  })
  async signup(@Body() signupDto: SignupDto) {
    return this.authService.signup(signupDto);
  }

  @Post('signup/principal')
  @ApiOperation({
    summary: 'Principal 회원가입 (학원 정보 포함)',
    description: '원장 회원가입 시 학원 정보를 함께 입력받아 처리합니다.',
  })
  @ApiBody({ type: PrincipalSignupDto })
  @ApiCreatedResponse({
    description: 'Principal 회원가입 성공',
    type: PrincipalSignupResponseEntity,
  })
  async signupPrincipal(@Body() signupDto: PrincipalSignupDto) {
    return this.authService.signupPrincipal(signupDto);
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
  @Post('withdrawal/student')
  @ApiOperation({ summary: '학생 회원 탈퇴' })
  @ApiBody({ type: WithdrawalReasonDto })
  @ApiOkResponse({
    description: '탈퇴 성공',
    schema: { example: { message: '회원 탈퇴가 완료되었습니다.' } },
  })
  async withdrawalStudent(
    @GetUser() user: AuthenticatedUser,
    @Body() body: WithdrawalReasonDto,
  ): Promise<{ message: string }> {
    await this.authService.withdrawalStudent(parseInt(user.id), body.reason);
    return { message: '회원 탈퇴가 완료되었습니다.' };
  }

  @UseGuards(JwtAuthGuard)
  @Post('withdrawal/teacher')
  @ApiOperation({ summary: '강사 회원 탈퇴' })
  @ApiBody({ type: WithdrawalReasonDto })
  @ApiOkResponse({
    description: '탈퇴 성공',
    schema: { example: { message: '회원 탈퇴가 완료되었습니다.' } },
  })
  async withdrawalTeacher(
    @GetUser() user: AuthenticatedUser,
    @Body() body: WithdrawalReasonDto,
  ): Promise<{ message: string }> {
    await this.authService.withdrawalTeacher(parseInt(user.id), body.reason);
    return { message: '회원 탈퇴가 완료되었습니다.' };
  }

  @UseGuards(JwtAuthGuard)
  @Post('withdrawal/principal')
  @ApiOperation({ summary: '원장 회원 탈퇴' })
  @ApiBody({ type: WithdrawalReasonDto })
  @ApiOkResponse({
    description: '탈퇴 성공',
    schema: { example: { message: '회원 탈퇴가 완료되었습니다.' } },
  })
  async withdrawalPrincipal(
    @GetUser() user: AuthenticatedUser,
    @Body() body: WithdrawalReasonDto,
  ): Promise<{ message: string }> {
    await this.authService.withdrawalPrincipal(parseInt(user.id), body.reason);
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

  @Post('check-phone')
  @ApiOperation({ summary: '전화번호 중복 체크' })
  @ApiBody({ type: CheckPhoneDto })
  @ApiOkResponse({
    description: '중복 여부 반환',
    type: CheckPhoneResponseEntity,
  })
  async checkPhone(
    @Body() body: CheckPhoneDto,
  ): Promise<{ available: boolean }> {
    return this.authService.checkPhoneNumber(body.phoneNumber);
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
