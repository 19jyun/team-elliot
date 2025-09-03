import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  NotFoundException,
} from '@nestjs/common';
import { ClassService } from './class.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateClassDto } from '../types/class.types';
import { UpdateClassStatusDto } from './dto/update-class-status.dto';
import { Role } from '@prisma/client';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Class')
@Controller('classes')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class ClassController {
  constructor(private readonly classService: ClassService) {}

  // 1. 구체적인 경로를 먼저 정의
  @Get('academy/draft')
  @Roles(Role.PRINCIPAL)
  @ApiOperation({
    summary: '학원의 DRAFT 상태 강의 목록 조회',
    description:
      '원장 권한으로 학원의 초안 상태(DRAFT) 강의 목록을 조회합니다.',
    operationId: 'getDraftClasses',
  })
  @ApiResponse({
    status: 200,
    description: 'DRAFT 상태 강의 목록 조회 성공',
    schema: {
      example: [
        {
          id: 1,
          className: '발레 기초반',
          description: '발레의 기본 동작을 배우는 클래스입니다.',
          maxStudents: 15,
          tuitionFee: 50000,
          dayOfWeek: 'MONDAY',
          level: 'BEGINNER',
          startTime: '18:00:00',
          endTime: '20:00:00',
          status: 'DRAFT',
          teacher: {
            id: 1,
            name: '김강사',
          },
        },
      ],
    },
  })
  @ApiNotFoundResponse({
    description: '소속된 학원이 없음',
    schema: {
      example: {
        statusCode: 404,
        message: '소속된 학원이 없습니다.',
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
  async getDraftClasses(@CurrentUser() user: any) {
    // 사용자의 학원 정보 조회
    const teacher = await this.classService['prisma'].teacher.findUnique({
      where: { id: user.id },
      select: { academyId: true },
    });

    if (!teacher?.academyId) {
      throw new NotFoundException('소속된 학원이 없습니다.');
    }

    return this.classService.getDraftClasses(teacher.academyId);
  }

  @Get('academy/active')
  @Roles(Role.PRINCIPAL)
  @ApiOperation({
    summary: '학원의 활성 강의 목록 조회',
    description: '원장 권한으로 학원의 활성 상태(OPEN) 강의 목록을 조회합니다.',
    operationId: 'getActiveClasses',
  })
  @ApiResponse({
    status: 200,
    description: '활성 강의 목록 조회 성공',
    schema: {
      example: [
        {
          id: 1,
          className: '발레 기초반',
          description: '발레의 기본 동작을 배우는 클래스입니다.',
          maxStudents: 15,
          tuitionFee: 50000,
          dayOfWeek: 'MONDAY',
          level: 'BEGINNER',
          startTime: '18:00:00',
          endTime: '20:00:00',
          status: 'OPEN',
          teacher: {
            id: 1,
            name: '김강사',
          },
        },
      ],
    },
  })
  @ApiNotFoundResponse({
    description: '소속된 학원이 없음',
    schema: {
      example: {
        statusCode: 404,
        message: '소속된 학원이 없습니다.',
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
  async getActiveClasses(@CurrentUser() user: any) {
    // 사용자의 학원 정보 조회
    const teacher = await this.classService['prisma'].teacher.findUnique({
      where: { id: user.id },
      select: { academyId: true },
    });

    if (!teacher?.academyId) {
      throw new NotFoundException('소속된 학원이 없습니다.');
    }

    return this.classService.getActiveClasses(teacher.academyId);
  }

  @Get('month/:month')
  @ApiOperation({
    summary: '특정 월의 클래스 목록 조회',
    description: '지정된 월에 진행되는 모든 클래스의 목록을 조회합니다.',
    operationId: 'getClassesByMonth',
  })
  @ApiParam({
    name: 'month',
    description: '조회할 월 (1-12)',
    example: 1,
    type: 'string',
  })
  @ApiQuery({
    name: 'year',
    description: '조회할 연도',
    example: 2024,
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: '해당 월의 클래스 목록을 반환합니다.',
    schema: {
      example: [
        {
          id: 1,
          className: '발레 기초반',
          dayOfWeek: 'MONDAY',
          startTime: '18:00:00',
          endTime: '20:00:00',
          level: 'BEGINNER',
        },
      ],
    },
  })
  @ApiBadRequestResponse({
    description: '잘못된 월 또는 연도 형식',
    schema: {
      example: {
        statusCode: 400,
        message: '유효하지 않은 월입니다.',
        code: 'INVALID_MONTH',
        details: { month: 13 },
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
  async getClassesByMonth(
    @Param('month') month: string,
    @Query('year') year: string,
  ) {
    return this.classService.getClassesByMonth(month, parseInt(year));
  }

  @Get('sessions/:month')
  @ApiOperation({
    summary: '해당 월에 세션이 있는 클래스들과 세션 정보 조회',
    description:
      '지정된 월에 세션이 진행되는 클래스들과 해당 세션 정보를 조회합니다. 학생인 경우 자신이 수강 신청한 클래스만 표시됩니다.',
    operationId: 'getClassesWithSessionsByMonth',
  })
  @ApiParam({
    name: 'month',
    description: '조회할 월 (1-12)',
    example: 1,
    type: 'string',
  })
  @ApiQuery({
    name: 'year',
    description: '조회할 연도',
    example: 2024,
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: '클래스와 세션 정보 조회 성공',
    schema: {
      example: [
        {
          id: 1,
          className: '발레 기초반',
          dayOfWeek: 'MONDAY',
          level: 'BEGINNER',
          sessions: [
            {
              id: 1,
              name: '1주차 - 기본 자세',
              date: '2024-01-15T18:00:00.000Z',
              startTime: '18:00:00',
              endTime: '20:00:00',
            },
          ],
        },
      ],
    },
  })
  @ApiBadRequestResponse({
    description: '잘못된 월 또는 연도 형식',
    schema: {
      example: {
        statusCode: 400,
        message: '유효하지 않은 월입니다.',
        code: 'INVALID_MONTH',
        details: { month: 13 },
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
  async getClassesWithSessionsByMonth(
    @Param('month') month: string,
    @Query('year') year: string,
    @CurrentUser() user: any,
  ) {
    return this.classService.getClassesWithSessionsByMonth(
      month,
      parseInt(year),
      user.role === 'STUDENT' ? user.id : undefined,
    );
  }

  // 2. 기본 CRUD 라우트
  @Get()
  @ApiOperation({
    summary: '모든 클래스 목록 조회',
    description:
      '필터링 옵션을 사용하여 클래스 목록을 조회합니다. 요일별, 강사별로 필터링할 수 있습니다.',
    operationId: 'getAllClasses',
  })
  @ApiQuery({
    name: 'dayOfWeek',
    description:
      '요일별 필터링 (MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY)',
    example: 'MONDAY',
    required: false,
  })
  @ApiQuery({
    name: 'teacherId',
    description: '강사별 필터링',
    example: 1,
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: '클래스 목록을 반환합니다.',
    schema: {
      example: [
        {
          id: 1,
          className: '발레 기초반',
          description: '발레의 기본 동작을 배우는 클래스입니다.',
          maxStudents: 15,
          tuitionFee: 50000,
          dayOfWeek: 'MONDAY',
          level: 'BEGINNER',
          startTime: '18:00:00',
          endTime: '20:00:00',
          status: 'OPEN',
          teacher: {
            id: 1,
            name: '김강사',
            photoUrl: '/uploads/teacher-photos/teacher001.jpg',
            introduction: '발레 전문 강사입니다.',
          },
          enrollments: [
            {
              id: 1,
              student: {
                id: 1,
                name: '김학생',
              },
            },
          ],
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
  async getAllClasses(
    @Query('dayOfWeek') dayOfWeek?: string,
    @Query('teacherId') teacherId?: string,
  ) {
    return this.classService.getAllClasses({
      dayOfWeek,
      teacherId: teacherId ? parseInt(teacherId) : undefined,
    });
  }

  @Post()
  @Roles(Role.PRINCIPAL)
  @ApiOperation({
    summary: '새로운 클래스 생성',
    description:
      '원장 권한으로 새로운 클래스를 생성합니다. 클래스 생성 시 자동으로 세션이 생성되며, 원장이 생성한 클래스는 자동으로 OPEN 상태가 됩니다.',
    operationId: 'createClass',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        className: {
          type: 'string',
          description: '클래스명',
          example: '발레 기초반',
        },
        description: {
          type: 'string',
          description: '클래스 설명',
          example: '발레의 기본 동작을 배우는 클래스입니다.',
        },
        maxStudents: {
          type: 'number',
          description: '최대 수강생 수',
          example: 15,
        },
        tuitionFee: {
          type: 'number',
          description: '수업료',
          example: 50000,
        },
        teacherId: {
          type: 'number',
          description: '담당 강사 ID',
          example: 1,
        },
        academyId: {
          type: 'number',
          description: '학원 ID',
          example: 1,
        },
        dayOfWeek: {
          type: 'string',
          description: '수업 요일',
          enum: [
            'MONDAY',
            'TUESDAY',
            'WEDNESDAY',
            'THURSDAY',
            'FRIDAY',
            'SATURDAY',
            'SUNDAY',
          ],
          example: 'MONDAY',
        },
        level: {
          type: 'string',
          description: '클래스 레벨',
          enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'],
          example: 'BEGINNER',
        },
        startTime: {
          type: 'string',
          description: '시작 시간 (HH:MM 형식)',
          example: '18:00',
        },
        endTime: {
          type: 'string',
          description: '종료 시간 (HH:MM 형식)',
          example: '20:00',
        },
        startDate: {
          type: 'string',
          description: '시작일 (ISO 8601 형식)',
          example: '2024-01-15T00:00:00.000Z',
        },
        endDate: {
          type: 'string',
          description: '종료일 (ISO 8601 형식)',
          example: '2024-04-15T23:59:59.999Z',
        },
      },
      required: [
        'className',
        'description',
        'maxStudents',
        'tuitionFee',
        'teacherId',
        'academyId',
        'dayOfWeek',
        'level',
        'startTime',
        'endTime',
        'startDate',
        'endDate',
      ],
    },
  })
  @ApiResponse({
    status: 201,
    description: '클래스가 성공적으로 생성되었습니다.',
    schema: {
      example: {
        id: 1,
        className: '발레 기초반',
        classCode: 'BALLET-MON-001',
        description: '발레의 기본 동작을 배우는 클래스입니다.',
        maxStudents: 15,
        tuitionFee: 50000,
        dayOfWeek: 'MONDAY',
        level: 'BEGINNER',
        startTime: '18:00:00',
        endTime: '20:00:00',
        startDate: '2024-01-15T00:00:00.000Z',
        endDate: '2024-04-15T23:59:59.999Z',
        status: 'OPEN',
        sessionCount: 12,
        message: '12개의 세션이 자동으로 생성되었습니다.',
      },
    },
  })
  @ApiBadRequestResponse({
    description: '잘못된 입력값 (요일, 레벨, 날짜 등)',
    schema: {
      example: {
        statusCode: 400,
        message: '유효하지 않은 요일입니다.',
        code: 'INVALID_DAY_OF_WEEK',
        details: {
          providedDay: 'INVALID_DAY',
          validDays: [
            'MONDAY',
            'TUESDAY',
            'WEDNESDAY',
            'THURSDAY',
            'FRIDAY',
            'SATURDAY',
            'SUNDAY',
          ],
        },
      },
    },
  })
  @ApiNotFoundResponse({
    description: '강사 또는 학원을 찾을 수 없음',
    schema: {
      example: {
        statusCode: 404,
        message: '선생님을 찾을 수 없습니다.',
        code: 'TEACHER_NOT_FOUND',
        details: { teacherId: 999 },
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
  async createClass(@Body() data: CreateClassDto, @CurrentUser() user: any) {
    // JWT sub (User.id)를 통해 Principal의 ID를 가져오기
    const principal = await this.classService.findPrincipalByUserId(
      user.userId,
    );

    // Principal의 ID를 사용하여 클래스 생성
    return this.classService.createClass(data, user.id);
  }

  // 3. 파라미터가 있는 라우트들
  @Get(':id/details')
  @ApiOperation({
    summary: '클래스 상세 정보 조회',
    description:
      '특정 클래스의 상세 정보를 조회합니다. 강사 정보, 수강 신청 현황, 세션 정보 등을 포함합니다.',
    operationId: 'getClassDetails',
  })
  @ApiParam({
    name: 'id',
    description: '조회할 클래스의 고유 ID',
    example: 1,
    type: 'integer',
  })
  @ApiResponse({
    status: 200,
    description: '클래스 상세 정보를 반환합니다.',
    schema: {
      example: {
        id: 1,
        className: '발레 기초반',
        description: '발레의 기본 동작을 배우는 클래스입니다.',
        maxStudents: 15,
        tuitionFee: 50000,
        dayOfWeek: 'MONDAY',
        level: 'BEGINNER',
        startTime: '18:00:00',
        endTime: '20:00:00',
        status: 'OPEN',
        teacher: {
          id: 1,
          name: '김강사',
        },
        enrollments: [
          {
            id: 1,
            studentId: 1,
            status: 'CONFIRMED',
          },
        ],
      },
    },
  })
  @ApiNotFoundResponse({
    description: '클래스를 찾을 수 없음',
    schema: {
      example: {
        statusCode: 404,
        message: '클래스를 찾을 수 없습니다.',
        code: 'CLASS_NOT_FOUND',
        details: { classId: 999 },
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
  async getClassDetails(@Param('id', ParseIntPipe) id: number) {
    return this.classService.getClassDetails(id);
  }

  @Put(':id')
  @Roles(Role.PRINCIPAL)
  @ApiOperation({
    summary: '클래스 정보 수정',
    description: '원장 권한으로 클래스의 기본 정보를 수정합니다.',
    operationId: 'updateClass',
  })
  @ApiParam({
    name: 'id',
    description: '수정할 클래스의 고유 ID',
    example: 1,
    type: 'integer',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        className: { type: 'string', example: '발레 기초반' },
        description: {
          type: 'string',
          example: '발레의 기본 동작을 배우는 클래스입니다.',
        },
        maxStudents: { type: 'number', example: 15 },
        tuitionFee: { type: 'number', example: 50000 },
        level: { type: 'string', example: 'BEGINNER' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '클래스 정보가 성공적으로 수정되었습니다.',
    schema: {
      example: {
        id: 1,
        className: '발레 기초반 (수정됨)',
        description: '발레의 기본 동작을 배우는 클래스입니다.',
        maxStudents: 20,
        tuitionFee: 60000,
        level: 'BEGINNER',
        updatedAt: '2024-01-15T10:30:00.000Z',
      },
    },
  })
  @ApiNotFoundResponse({
    description: '클래스를 찾을 수 없음',
    schema: {
      example: {
        statusCode: 404,
        message: '클래스를 찾을 수 없습니다.',
        code: 'CLASS_NOT_FOUND',
        details: { classId: 999 },
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
  async updateClass(@Param('id', ParseIntPipe) id: number, @Body() data: any) {
    return this.classService.updateClass(id, data);
  }

  @Put(':id/details')
  @Roles(Role.PRINCIPAL)
  @ApiOperation({
    summary: '클래스 상세 정보 수정',
    description:
      '원장 권한으로 클래스의 상세 정보(설명, 위치, 맵 이미지, 필요 준비물, 커리큘럼)를 수정합니다.',
    operationId: 'updateClassDetails',
  })
  @ApiParam({
    name: 'id',
    description: '수정할 클래스의 고유 ID',
    example: 1,
    type: 'integer',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        description: {
          type: 'string',
          example: '발레의 기본 동작을 배우는 클래스입니다.',
        },
        locationName: { type: 'string', example: '1층 대연습실' },
        mapImageUrl: { type: 'string', example: '/uploads/maps/studio1.jpg' },
        requiredItems: {
          type: 'array',
          items: { type: 'string' },
          example: ['발레 슈즈', '발레복', '양말'],
        },
        curriculum: {
          type: 'array',
          items: { type: 'string' },
          example: ['기본 자세', '플리에', '발레 스텝'],
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '클래스 상세 정보 수정 성공',
    schema: {
      example: {
        id: 1,
        description: '발레의 기본 동작을 배우는 클래스입니다.',
        locationName: '1층 대연습실',
        mapImageUrl: '/uploads/maps/studio1.jpg',
        requiredItems: ['발레 슈즈', '발레복', '양말'],
        curriculum: ['기본 자세', '플리에', '발레 스텝'],
        updatedAt: '2024-01-15T10:30:00.000Z',
      },
    },
  })
  @ApiNotFoundResponse({
    description: '클래스를 찾을 수 없음',
    schema: {
      example: {
        statusCode: 404,
        message: '클래스를 찾을 수 없습니다.',
        code: 'CLASS_NOT_FOUND',
        details: { classId: 999 },
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
  async updateClassDetails(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    data: {
      description?: string;
      locationName?: string;
      mapImageUrl?: string;
      requiredItems?: string[];
      curriculum?: string[];
    },
    @CurrentUser() user: any,
  ) {
    return this.classService.updateClassDetails(id, data, user.id);
  }

  @Delete(':id')
  @Roles(Role.PRINCIPAL)
  @ApiOperation({
    summary: '클래스 삭제',
    description:
      '원장 권한으로 클래스를 삭제합니다. 수강 신청이 있는 경우 삭제할 수 없습니다.',
    operationId: 'deleteClass',
  })
  @ApiParam({
    name: 'id',
    description: '삭제할 클래스의 고유 ID',
    example: 1,
    type: 'integer',
  })
  @ApiResponse({
    status: 200,
    description: '클래스가 성공적으로 삭제되었습니다.',
    schema: {
      example: {
        message: '클래스가 성공적으로 삭제되었습니다.',
      },
    },
  })
  @ApiBadRequestResponse({
    description: '수강 신청이 있어 삭제할 수 없음',
    schema: {
      example: {
        statusCode: 400,
        message: '수강 신청이 있는 클래스는 삭제할 수 없습니다.',
        code: 'CLASS_HAS_ENROLLMENTS',
        details: { enrollmentCount: 5 },
      },
    },
  })
  @ApiNotFoundResponse({
    description: '클래스를 찾을 수 없음',
    schema: {
      example: {
        statusCode: 404,
        message: '클래스를 찾을 수 없습니다.',
        code: 'CLASS_NOT_FOUND',
        details: { classId: 999 },
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
  async deleteClass(@Param('id', ParseIntPipe) id: number) {
    return this.classService.deleteClass(id);
  }

  @Put(':id/status')
  @Roles(Role.PRINCIPAL)
  @ApiOperation({
    summary: '강의 상태 변경 (승인/거절)',
    description:
      '원장 권한으로 강의의 상태를 변경합니다. DRAFT 상태의 강의를 OPEN 또는 CLOSED로 변경할 수 있습니다.',
    operationId: 'updateClassStatus',
  })
  @ApiParam({
    name: 'id',
    description: '상태를 변경할 클래스의 고유 ID',
    example: 1,
    type: 'integer',
  })
  @ApiBody({
    type: UpdateClassStatusDto,
    description: '상태 변경 정보',
    examples: {
      approve: {
        summary: '강의 승인',
        value: { status: 'OPEN', reason: '강의 승인 완료' },
      },
      reject: {
        summary: '강의 거절',
        value: { status: 'CLOSED', reason: '강의 내용 검토 필요' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '강의 상태 변경 성공',
    schema: {
      example: {
        id: 1,
        status: 'OPEN',
        updatedAt: '2024-01-15T10:30:00.000Z',
        message: '강의 상태가 OPEN으로 변경되었습니다.',
      },
    },
  })
  @ApiBadRequestResponse({
    description: '잘못된 상태 값',
    schema: {
      example: {
        statusCode: 400,
        message: '강의 상태는 DRAFT, OPEN, CLOSED 중 하나여야 합니다.',
        code: 'INVALID_STATUS',
      },
    },
  })
  @ApiNotFoundResponse({
    description: '클래스를 찾을 수 없음',
    schema: {
      example: {
        statusCode: 404,
        message: '클래스를 찾을 수 없습니다.',
        code: 'CLASS_NOT_FOUND',
        details: { classId: 999 },
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
  async updateClassStatus(
    @Param('id', ParseIntPipe) classId: number,
    @Body() updateStatusDto: UpdateClassStatusDto,
    @CurrentUser() user: any,
  ) {
    return this.classService.updateClassStatus(
      classId,
      user.id,
      updateStatusDto.status,
      updateStatusDto.reason,
    );
  }

  @Post(':id/enroll')
  @Roles(Role.STUDENT)
  @ApiOperation({
    summary: '클래스 수강 신청',
    description:
      '학생이 특정 클래스에 수강 신청을 합니다. 이미 신청한 클래스인 경우 오류가 발생합니다.',
    operationId: 'enrollClass',
  })
  @ApiParam({
    name: 'id',
    description: '수강 신청할 클래스의 고유 ID',
    example: 1,
    type: 'integer',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        studentId: {
          type: 'number',
          description: '수강 신청할 학생의 ID',
          example: 1,
        },
      },
      required: ['studentId'],
    },
  })
  @ApiResponse({
    status: 201,
    description: '수강 신청이 성공적으로 완료되었습니다.',
    schema: {
      example: {
        id: 1,
        studentId: 1,
        classId: 1,
        status: 'PENDING',
        createdAt: '2024-01-15T10:30:00.000Z',
      },
    },
  })
  @ApiConflictResponse({
    description: '이미 수강 신청한 클래스',
    schema: {
      example: {
        statusCode: 409,
        message: '이미 수강 신청한 클래스입니다.',
        code: 'STUDENT_ALREADY_ENROLLED',
        details: { classId: 1, studentId: 1 },
      },
    },
  })
  @ApiNotFoundResponse({
    description: '클래스 또는 학생을 찾을 수 없음',
    schema: {
      example: {
        statusCode: 404,
        message: '클래스를 찾을 수 없습니다.',
        code: 'CLASS_NOT_FOUND',
        details: { classId: 999 },
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
  async enrollClass(
    @Param('id', ParseIntPipe) classId: number,
    @Body('studentId', ParseIntPipe) studentId: number,
  ) {
    return this.classService.enrollStudent(classId, studentId);
  }

  @Delete(':id/enroll')
  @Roles(Role.STUDENT)
  @ApiOperation({
    summary: '클래스 수강 신청 취소',
    description: '학생이 특정 클래스의 수강 신청을 취소합니다.',
    operationId: 'unenrollClass',
  })
  @ApiParam({
    name: 'id',
    description: '수강 신청을 취소할 클래스의 고유 ID',
    example: 1,
    type: 'integer',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        studentId: {
          type: 'number',
          description: '수강 신청을 취소할 학생의 ID',
          example: 1,
        },
      },
      required: ['studentId'],
    },
  })
  @ApiResponse({
    status: 200,
    description: '수강 신청 취소가 성공적으로 완료되었습니다.',
    schema: {
      example: {
        message: '수강 신청이 취소되었습니다.',
      },
    },
  })
  @ApiNotFoundResponse({
    description: '수강 신청 내역을 찾을 수 없음',
    schema: {
      example: {
        statusCode: 404,
        message: '수강 신청 내역을 찾을 수 없습니다.',
        code: 'ENROLLMENT_NOT_FOUND',
        details: { classId: 1, studentId: 1 },
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
  async unenrollClass(
    @Param('id', ParseIntPipe) classId: number,
    @Body('studentId', ParseIntPipe) studentId: number,
  ) {
    return this.classService.unenrollStudent(classId, studentId);
  }

  @Post(':id/generate-sessions')
  @Roles(Role.PRINCIPAL)
  @ApiOperation({
    summary: '클래스 세션 자동 생성',
    description:
      '원장 권한으로 기존 클래스에 대한 세션을 자동으로 생성합니다. 클래스의 요일, 시간, 시작일, 종료일을 기반으로 세션이 생성됩니다.',
    operationId: 'generateSessionsForClass',
  })
  @ApiParam({
    name: 'id',
    description: '세션을 생성할 클래스의 고유 ID',
    example: 1,
    type: 'integer',
  })
  @ApiResponse({
    status: 201,
    description: '세션이 성공적으로 생성되었습니다.',
    schema: {
      example: {
        message: '12개의 세션이 성공적으로 생성되었습니다.',
        sessionCount: 12,
        sessions: [
          {
            id: 1,
            name: '1주차 - 기본 자세',
            date: '2024-01-15T18:00:00.000Z',
            startTime: '18:00:00',
            endTime: '20:00:00',
          },
        ],
      },
    },
  })
  @ApiNotFoundResponse({
    description: '클래스를 찾을 수 없음',
    schema: {
      example: {
        statusCode: 404,
        message: '클래스를 찾을 수 없습니다.',
        code: 'CLASS_NOT_FOUND',
        details: { classId: 999 },
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
  async generateSessionsForClass(@Param('id', ParseIntPipe) classId: number) {
    return this.classService.generateSessionsForExistingClass(classId);
  }

  @Post(':id/generate-sessions/period')
  @Roles(Role.PRINCIPAL)
  @ApiOperation({
    summary: '특정 기간의 클래스 세션 생성',
    description:
      '원장 권한으로 지정된 기간에 대한 클래스 세션을 생성합니다. 시작일과 종료일을 지정하여 세션을 생성할 수 있습니다.',
    operationId: 'generateSessionsForPeriod',
  })
  @ApiParam({
    name: 'id',
    description: '세션을 생성할 클래스의 고유 ID',
    example: 1,
    type: 'integer',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        startDate: {
          type: 'string',
          description: '시작일 (ISO 8601 형식)',
          example: '2024-01-15T00:00:00.000Z',
        },
        endDate: {
          type: 'string',
          description: '종료일 (ISO 8601 형식)',
          example: '2024-04-15T23:59:59.999Z',
        },
      },
      required: ['startDate', 'endDate'],
    },
  })
  @ApiResponse({
    status: 201,
    description: '지정된 기간의 세션이 성공적으로 생성되었습니다.',
    schema: {
      example: {
        message: '8개의 세션이 성공적으로 생성되었습니다.',
        sessionCount: 8,
        sessions: [
          {
            id: 1,
            name: '1주차 - 기본 자세',
            date: '2024-01-15T18:00:00.000Z',
            startTime: '18:00:00',
            endTime: '20:00:00',
          },
        ],
      },
    },
  })
  @ApiBadRequestResponse({
    description: '잘못된 날짜 형식 또는 시작일이 종료일보다 늦음',
    schema: {
      example: {
        statusCode: 400,
        message: '시작일은 종료일보다 이전이어야 합니다.',
        code: 'INVALID_DATE_RANGE',
        details: { startDate: '2024-04-15', endDate: '2024-01-15' },
      },
    },
  })
  @ApiNotFoundResponse({
    description: '클래스를 찾을 수 없음',
    schema: {
      example: {
        statusCode: 404,
        message: '클래스를 찾을 수 없습니다.',
        code: 'CLASS_NOT_FOUND',
        details: { classId: 999 },
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
  async generateSessionsForPeriod(
    @Param('id', ParseIntPipe) classId: number,
    @Body() data: { startDate: string; endDate: string },
  ) {
    return this.classService.generateSessionsForPeriod(
      classId,
      new Date(data.startDate),
      new Date(data.endDate),
    );
  }
}
