import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { CheckUserIdDto } from './dto/check-userid.dto';
import { WithdrawalReasonDto } from './dto/withdrawal-reason.dto';
import { AuthResponseEntity } from './entities/auth-response.entity';
import { CheckUserIdResponseEntity } from './entities/check-userid-response.entity';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GetUser } from './decorators/get-user.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiBearerAuth,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiConflictResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({
    summary: '로그인',
    description:
      '사용자 ID와 비밀번호를 사용하여 로그인합니다. 성공 시 JWT 토큰을 반환합니다.',
    operationId: 'login',
  })
  @ApiBody({
    type: LoginDto,
    description: '로그인 정보',
    examples: {
      studentLogin: {
        summary: '학생 로그인',
        value: {
          userId: 'student123',
          password: 'password123',
        },
      },
      teacherLogin: {
        summary: '강사 로그인',
        value: {
          userId: 'teacher456',
          password: 'password456',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '로그인 성공',
    type: AuthResponseEntity,
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: 1,
          userId: 'student123',
          role: 'STUDENT',
          email: 'student@example.com',
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: '잘못된 입력값',
    schema: {
      example: {
        statusCode: 400,
        message: '사용자 ID와 비밀번호는 필수입니다.',
        error: 'Bad Request',
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: '인증 실패',
    schema: {
      example: {
        statusCode: 401,
        message: '잘못된 사용자 ID 또는 비밀번호입니다.',
        error: 'Unauthorized',
      },
    },
  })
  @ApiInternalServerErrorResponse({
    description: '서버 내부 오류',
    schema: {
      example: {
        statusCode: 500,
        message: '로그인 처리 중 오류가 발생했습니다.',
        error: 'Internal Server Error',
      },
    },
  })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.userId, loginDto.password);
  }

  @Post('signup')
  @ApiOperation({
    summary: '회원가입',
    description:
      '새로운 사용자를 등록합니다. 사용자 ID 중복 검사가 자동으로 수행됩니다.',
    operationId: 'signup',
  })
  @ApiBody({
    type: SignupDto,
    description: '회원가입 정보',
    examples: {
      studentSignup: {
        summary: '학생 회원가입',
        value: {
          userId: 'newstudent',
          password: 'password123',
          email: 'newstudent@example.com',
          role: 'STUDENT',
          name: '김학생',
          phoneNumber: '010-1234-5678',
        },
      },
      teacherSignup: {
        summary: '강사 회원가입',
        value: {
          userId: 'newteacher',
          password: 'password456',
          email: 'newteacher@example.com',
          role: 'TEACHER',
          name: '김강사',
          phoneNumber: '010-9876-5432',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: '회원가입 성공',
    type: AuthResponseEntity,
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: 1,
          userId: 'newstudent',
          role: 'STUDENT',
          email: 'newstudent@example.com',
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: '잘못된 입력값',
    schema: {
      example: {
        statusCode: 400,
        message: '사용자 ID는 4-20자의 영문, 숫자만 사용 가능합니다.',
        error: 'Bad Request',
      },
    },
  })
  @ApiConflictResponse({
    description: '이미 존재하는 사용자 ID',
    schema: {
      example: {
        statusCode: 409,
        message: '이미 사용 중인 사용자 ID입니다.',
        error: 'Conflict',
      },
    },
  })
  @ApiInternalServerErrorResponse({
    description: '서버 내부 오류',
    schema: {
      example: {
        statusCode: 500,
        message: '회원가입 처리 중 오류가 발생했습니다.',
        error: 'Internal Server Error',
      },
    },
  })
  async signup(@Body() signupDto: SignupDto) {
    return this.authService.signup(signupDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @ApiOperation({
    summary: '로그아웃',
    description:
      '현재 로그인된 사용자를 로그아웃 처리합니다. JWT 토큰이 필요합니다.',
    operationId: 'logout',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({
    status: 200,
    description: '로그아웃 성공',
    schema: {
      example: {
        message: '로그아웃되었습니다',
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: '인증 토큰이 없거나 만료됨',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
      },
    },
  })
  async logout() {
    return { message: '로그아웃되었습니다' };
  }

  @UseGuards(JwtAuthGuard)
  @Post('withdrawal')
  @ApiOperation({
    summary: '회원 탈퇴',
    description:
      '현재 로그인된 사용자의 계정을 삭제합니다. JWT 토큰이 필요하며, 탈퇴 사유를 기록합니다.',
    operationId: 'withdrawal',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiBody({
    type: WithdrawalReasonDto,
    description: '탈퇴 사유',
    examples: {
      personalReason: {
        summary: '개인적 사유',
        value: {
          reason: '개인적인 사정으로 인한 탈퇴',
        },
      },
      serviceDissatisfaction: {
        summary: '서비스 불만족',
        value: {
          reason: '서비스 품질에 대한 불만족',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '탈퇴 성공',
    schema: {
      example: {
        message: '회원 탈퇴가 완료되었습니다.',
      },
    },
  })
  @ApiBadRequestResponse({
    description: '잘못된 입력값',
    schema: {
      example: {
        statusCode: 400,
        message: '탈퇴 사유는 필수입니다.',
        error: 'Bad Request',
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: '인증 토큰이 없거나 만료됨',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
      },
    },
  })
  @ApiInternalServerErrorResponse({
    description: '서버 내부 오류',
    schema: {
      example: {
        statusCode: 500,
        message: '회원 탈퇴 처리 중 오류가 발생했습니다.',
        error: 'Internal Server Error',
      },
    },
  })
  async withdrawal(
    @GetUser() user: any,
    @Body() body: WithdrawalReasonDto,
  ): Promise<{ message: string }> {
    await this.authService.withdrawal(user.id, body.reason);
    return { message: '회원 탈퇴가 완료되었습니다.' };
  }

  @Post('check-userid')
  @ApiOperation({
    summary: '아이디 중복 체크',
    description: '회원가입 전 사용자 ID의 중복 여부를 확인합니다.',
    operationId: 'checkUserId',
  })
  @ApiBody({
    type: CheckUserIdDto,
    description: '중복 확인할 사용자 ID',
    examples: {
      checkUserId: {
        summary: '사용자 ID 중복 확인',
        value: {
          userId: 'newuser123',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '중복 여부 반환',
    type: CheckUserIdResponseEntity,
    schema: {
      example: {
        available: true,
        message: '사용 가능한 사용자 ID입니다.',
      },
    },
  })
  @ApiBadRequestResponse({
    description: '잘못된 입력값',
    schema: {
      example: {
        statusCode: 400,
        message: '사용자 ID는 4-20자의 영문, 숫자만 사용 가능합니다.',
        error: 'Bad Request',
      },
    },
  })
  @ApiInternalServerErrorResponse({
    description: '서버 내부 오류',
    schema: {
      example: {
        statusCode: 500,
        message: '중복 확인 처리 중 오류가 발생했습니다.',
        error: 'Internal Server Error',
      },
    },
  })
  async checkUserId(
    @Body() body: CheckUserIdDto,
  ): Promise<{ available: boolean }> {
    return this.authService.checkUserId(body.userId);
  }
}
