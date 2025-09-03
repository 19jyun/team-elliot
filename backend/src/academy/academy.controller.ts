import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiBearerAuth,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';
import { AcademyService } from './academy.service';
import { CreateAcademyDto, JoinAcademyDto, LeaveAcademyDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';

@ApiTags('Academy')
@Controller('academy')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class AcademyController {
  constructor(private readonly academyService: AcademyService) {}

  // 원장용 API
  @Post()
  @Roles('PRINCIPAL')
  @ApiOperation({
    summary: '학원 생성',
    description:
      '원장 권한으로 새로운 학원을 생성합니다. 학원 코드는 고유해야 하며, 중복 시 오류가 발생합니다.',
    operationId: 'createAcademy',
  })
  @ApiBody({
    type: CreateAcademyDto,
    description: '학원 생성 정보',
    examples: {
      basic: {
        summary: '기본 학원 정보',
        value: {
          name: '발레 아카데미',
          code: 'BALLET_ACADEMY_001',
          phoneNumber: '02-1234-5678',
          address: '서울시 강남구 테헤란로 123',
          description:
            '전문적인 발레 교육을 제공하는 학원입니다. 기초부터 고급까지 체계적인 커리큘럼으로 수업을 진행합니다.',
        },
      },
      dance: {
        summary: '댄스 학원',
        value: {
          name: '댄스 스튜디오',
          code: 'DANCE_STUDIO_001',
          phoneNumber: '02-2345-6789',
          address: '서울시 서초구 서초대로 456',
          description:
            '다양한 장르의 댄스를 가르치는 학원입니다. 발레, 현대무용, 재즈댄스 등 다양한 수업을 제공합니다.',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: '학원이 성공적으로 생성되었습니다.',
    schema: {
      example: {
        id: 1,
        name: '발레 아카데미',
        code: 'BALLET_ACADEMY_001',
        phoneNumber: '02-1234-5678',
        address: '서울시 강남구 테헤란로 123',
        description: '전문적인 발레 교육을 제공하는 학원입니다.',
        createdAt: '2024-01-15T10:30:00.000Z',
        updatedAt: '2024-01-15T10:30:00.000Z',
      },
    },
  })
  @ApiBadRequestResponse({
    description: '잘못된 입력값 (학원명 길이, 전화번호 형식, 주소 길이 등)',
    schema: {
      example: {
        statusCode: 400,
        message: [
          '학원명은 2자 이상이어야 합니다.',
          '올바른 전화번호 형식이 아닙니다.',
        ],
        error: 'Bad Request',
      },
    },
  })
  @ApiConflictResponse({
    description: '이미 존재하는 학원 코드',
    schema: {
      example: {
        statusCode: 409,
        message: '이미 존재하는 학원 코드입니다.',
        code: 'ACADEMY_CODE_ALREADY_EXISTS',
        details: { code: 'BALLET_ACADEMY_001' },
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
  @ApiForbiddenResponse({
    description: '원장 권한이 부족함',
    schema: {
      example: {
        statusCode: 403,
        message: 'Forbidden resource',
      },
    },
  })
  @ApiInternalServerErrorResponse({
    description: '서버 내부 오류',
    schema: {
      example: {
        statusCode: 500,
        message: 'Internal server error',
      },
    },
  })
  async createAcademy(@Body() dto: CreateAcademyDto) {
    return this.academyService.createAcademy(dto);
  }

  @Delete(':id')
  @Roles('PRINCIPAL')
  @ApiOperation({
    summary: '학원 삭제',
    description:
      '원장 권한으로 학원을 삭제합니다. 소속된 강사나 학생이 있는 경우 삭제할 수 없습니다.',
    operationId: 'deleteAcademy',
  })
  @ApiParam({
    name: 'id',
    description: '삭제할 학원의 고유 ID',
    example: 1,
    type: 'integer',
  })
  @ApiResponse({
    status: 200,
    description: '학원이 성공적으로 삭제되었습니다.',
    schema: {
      example: {
        message: '학원이 성공적으로 삭제되었습니다.',
      },
    },
  })
  @ApiNotFoundResponse({
    description: '학원을 찾을 수 없음',
    schema: {
      example: {
        statusCode: 404,
        message: '학원을 찾을 수 없습니다.',
        code: 'ACADEMY_NOT_FOUND',
        details: { academyId: 1 },
      },
    },
  })
  @ApiBadRequestResponse({
    description: '소속된 강사나 학생이 있어 삭제할 수 없음',
    schema: {
      example: {
        statusCode: 400,
        message: '소속된 선생님이 있어 삭제할 수 없습니다.',
        code: 'ACADEMY_HAS_TEACHERS',
        details: { teacherCount: 3 },
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
  @ApiForbiddenResponse({
    description: '원장 권한이 부족함',
    schema: {
      example: {
        statusCode: 403,
        message: 'Forbidden resource',
      },
    },
  })
  async deleteAcademy(@Param('id', ParseIntPipe) id: number) {
    return this.academyService.deleteAcademy(id);
  }

  // 공통 API
  @Get()
  @ApiOperation({
    summary: '학원 목록 조회',
    description:
      '모든 학원의 목록을 조회합니다. 인증된 사용자라면 누구나 접근 가능합니다.',
    operationId: 'getAcademies',
  })
  @ApiResponse({
    status: 200,
    description: '학원 목록을 반환합니다.',
    schema: {
      example: [
        {
          id: 1,
          name: '발레 아카데미',
          code: 'BALLET_ACADEMY_001',
          phoneNumber: '02-1234-5678',
          address: '서울시 강남구 테헤란로 123',
          description: '전문적인 발레 교육을 제공하는 학원입니다.',
          createdAt: '2024-01-15T10:30:00.000Z',
          updatedAt: '2024-01-15T10:30:00.000Z',
        },
      ],
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
  async getAcademies() {
    return this.academyService.getAcademies();
  }

  @Get(':id')
  @ApiOperation({
    summary: '학원 상세 조회',
    description: '특정 학원의 상세 정보를 조회합니다.',
    operationId: 'getAcademyById',
  })
  @ApiParam({
    name: 'id',
    description: '조회할 학원의 고유 ID',
    example: 1,
    type: 'integer',
  })
  @ApiResponse({
    status: 200,
    description: '학원 상세 정보를 반환합니다.',
    schema: {
      example: {
        id: 1,
        name: '발레 아카데미',
        code: 'BALLET_ACADEMY_001',
        phoneNumber: '02-1234-5678',
        address: '서울시 강남구 테헤란로 123',
        description: '전문적인 발레 교육을 제공하는 학원입니다.',
        createdAt: '2024-01-15T10:30:00.000Z',
        updatedAt: '2024-01-15T10:30:00.000Z',
      },
    },
  })
  @ApiNotFoundResponse({
    description: '학원을 찾을 수 없음',
    schema: {
      example: {
        statusCode: 404,
        message: '학원을 찾을 수 없습니다.',
        code: 'ACADEMY_NOT_FOUND',
        details: { academyId: 1 },
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
  async getAcademyById(@Param('id', ParseIntPipe) id: number) {
    return this.academyService.getAcademyById(id);
  }

  // 학생용 API
  @Post('join')
  @Roles('STUDENT')
  @ApiOperation({
    summary: '학원 가입',
    description:
      '학생이 학원 코드를 사용하여 학원에 가입합니다. 이미 가입된 학원인 경우 오류가 발생합니다.',
    operationId: 'joinAcademy',
  })
  @ApiBody({
    type: JoinAcademyDto,
    description: '학원 가입 정보',
    examples: {
      basic: {
        summary: '학원 가입',
        value: { code: 'BALLET_ACADEMY_001' },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: '학원 가입이 완료되었습니다.',
    schema: {
      example: {
        message: '학원 가입이 완료되었습니다.',
      },
    },
  })
  @ApiBadRequestResponse({
    description: '잘못된 학원 코드',
    schema: {
      example: {
        statusCode: 400,
        message: '올바른 학원 코드 형식이 아닙니다.',
        code: 'INVALID_ACADEMY_CODE',
      },
    },
  })
  @ApiNotFoundResponse({
    description: '학원 코드를 찾을 수 없음',
    schema: {
      example: {
        statusCode: 404,
        message: '해당 코드의 학원을 찾을 수 없습니다.',
        code: 'ACADEMY_CODE_NOT_FOUND',
        details: { code: 'INVALID_CODE' },
      },
    },
  })
  @ApiConflictResponse({
    description: '이미 가입된 학원',
    schema: {
      example: {
        statusCode: 409,
        message: '이미 가입된 학원입니다.',
        code: 'STUDENT_ALREADY_JOINED',
        details: { academyId: 1, academyName: '발레 아카데미' },
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
  @ApiForbiddenResponse({
    description: '학생 권한이 부족함',
    schema: {
      example: {
        statusCode: 403,
        message: 'Forbidden resource',
      },
    },
  })
  async joinAcademy(@GetUser() user: any, @Body() dto: JoinAcademyDto) {
    return this.academyService.joinAcademy(user.id, dto);
  }

  @Post('leave')
  @Roles('STUDENT')
  @ApiOperation({
    summary: '학원 탈퇴',
    description:
      '학생이 가입된 학원에서 탈퇴합니다. 가입되지 않은 학원인 경우 오류가 발생합니다.',
    operationId: 'leaveAcademy',
  })
  @ApiBody({
    type: LeaveAcademyDto,
    description: '학원 탈퇴 정보',
    examples: {
      basic: {
        summary: '학원 탈퇴',
        value: { academyId: 1 },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '학원 탈퇴가 완료되었습니다.',
    schema: {
      example: {
        message: '학원 탈퇴가 완료되었습니다.',
      },
    },
  })
  @ApiBadRequestResponse({
    description: '가입되지 않은 학원',
    schema: {
      example: {
        statusCode: 400,
        message: '가입되지 않은 학원입니다.',
        code: 'STUDENT_NOT_JOINED',
        details: { academyId: 1 },
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
  @ApiForbiddenResponse({
    description: '학생 권한이 부족함',
    schema: {
      example: {
        statusCode: 403,
        message: 'Forbidden resource',
      },
    },
  })
  async leaveAcademy(@GetUser() user: any, @Body() dto: LeaveAcademyDto) {
    return this.academyService.leaveAcademy(user.id, dto);
  }

  @Get('my/list')
  @Roles('STUDENT')
  @ApiOperation({
    summary: '내가 가입한 학원 목록',
    description: '학생이 가입한 모든 학원의 목록을 조회합니다.',
    operationId: 'getMyAcademies',
  })
  @ApiResponse({
    status: 200,
    description: '가입한 학원 목록을 반환합니다.',
    schema: {
      example: [
        {
          id: 1,
          name: '발레 아카데미',
          code: 'BALLET_ACADEMY_001',
          phoneNumber: '02-1234-5678',
          address: '서울시 강남구 테헤란로 123',
          description: '전문적인 발레 교육을 제공하는 학원입니다.',
          createdAt: '2024-01-15T10:30:00.000Z',
          updatedAt: '2024-01-15T10:30:00.000Z',
        },
      ],
    },
  })
  @ApiNotFoundResponse({
    description: '학생을 찾을 수 없음',
    schema: {
      example: {
        statusCode: 404,
        message: '학생을 찾을 수 없습니다.',
        code: 'STUDENT_NOT_FOUND',
        details: { userId: 1 },
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
  @ApiForbiddenResponse({
    description: '학생 권한이 부족함',
    schema: {
      example: {
        statusCode: 403,
        message: 'Forbidden resource',
      },
    },
  })
  async getMyAcademies(@GetUser() user: any) {
    return this.academyService.getMyAcademies(user.id);
  }
}
