import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { TeacherService } from './teacher.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { teacherProfileConfig } from '../config/multer.config';
import { Role } from '@prisma/client';
import { JoinAcademyRequestDto } from '../academy/dto/join-academy-request.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiConsumes,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';

@ApiTags('Teacher')
@Controller('teachers')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class TeacherController {
  constructor(private readonly teacherService: TeacherService) {}

  @Post('me/request-join-academy')
  @Roles(Role.TEACHER)
  @ApiOperation({
    summary: '학원 가입 요청',
    description:
      '강사가 특정 학원에 가입을 요청합니다. 이미 학원에 소속되어 있거나 진행 중인 요청이 있는 경우 오류가 발생합니다.',
    operationId: 'requestJoinAcademy',
  })
  @ApiBody({
    type: JoinAcademyRequestDto,
    description: '학원 가입 요청 정보',
    examples: {
      basic: {
        summary: '기본 가입 요청',
        value: {
          code: 'BALLET_ACADEMY_001',
          message: '발레 전문 강사로서 학원에 합류하고 싶습니다.',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: '가입 요청이 성공적으로 생성되었습니다.',
    schema: {
      example: {
        id: 1,
        teacherId: 1,
        academyId: 1,
        message: '발레 전문 강사로서 학원에 합류하고 싶습니다.',
        status: 'PENDING',
        createdAt: '2024-01-15T10:30:00.000Z',
        teacher: {
          id: 1,
          name: '김강사',
        },
        academy: {
          id: 1,
          name: '발레 아카데미',
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: '잘못된 요청 (이미 학원에 소속됨, 진행 중인 요청 존재)',
    schema: {
      example: {
        statusCode: 400,
        message: '이미 학원에 소속되어 있습니다.',
        code: 'TEACHER_ALREADY_IN_ACADEMY',
        details: { academyId: 1 },
      },
    },
  })
  @ApiNotFoundResponse({
    description: '강사 또는 학원을 찾을 수 없음',
    schema: {
      example: {
        statusCode: 404,
        message: '해당 코드의 학원을 찾을 수 없습니다.',
        code: 'ACADEMY_CODE_NOT_FOUND',
        details: { code: 'INVALID_CODE' },
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
    description: '강사 권한이 부족함',
    schema: {
      example: {
        statusCode: 403,
        message: 'Forbidden resource',
      },
    },
  })
  async requestJoinAcademy(
    @GetUser() user: any,
    @Body() joinAcademyRequestDto: JoinAcademyRequestDto,
  ) {
    return this.teacherService.requestJoinAcademy(
      user.id,
      joinAcademyRequestDto,
    );
  }

  @Get('me')
  @Roles(Role.TEACHER)
  @ApiOperation({
    summary: '내 프로필 조회',
    description: '강사의 개인 프로필 정보를 조회합니다.',
    operationId: 'getMyProfile',
  })
  @ApiResponse({
    status: 200,
    description: '강사 프로필 정보를 반환합니다.',
    schema: {
      example: {
        id: 1,
        userId: 'teacher001',
        name: '김강사',
        phoneNumber: '010-1234-5678',
        introduction: '발레 전문 강사로서 10년간의 경험을 가지고 있습니다.',
        photoUrl: '/uploads/teacher-photos/teacher001.jpg',
        education: [
          '서울예술대학교 발레과 졸업',
          '러시아 발라쇼바 발레학교 수료',
        ],
        specialties: ['발레 기초', '발레 중급', '발레 고급'],
        certifications: ['발레 지도사 자격증', '현대무용 지도사 자격증'],
        yearsOfExperience: 10,
        availableTimes: ['월요일 18:00-20:00', '수요일 18:00-20:00'],
        academyId: 1,
        academy: {
          id: 1,
          name: '발레 아카데미',
        },
        createdAt: '2024-01-15T10:30:00.000Z',
        updatedAt: '2024-01-15T10:30:00.000Z',
      },
    },
  })
  @ApiNotFoundResponse({
    description: '강사를 찾을 수 없음',
    schema: {
      example: {
        statusCode: 404,
        message: '선생님을 찾을 수 없습니다.',
        code: 'TEACHER_NOT_FOUND',
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
    description: '강사 권한이 부족함',
    schema: {
      example: {
        statusCode: 403,
        message: 'Forbidden resource',
      },
    },
  })
  async getMyProfile(@GetUser() user: any) {
    return this.teacherService.getTeacherProfile(user.id);
  }

  @Put('me/profile')
  @Roles(Role.TEACHER)
  @ApiOperation({
    summary: '프로필 수정',
    description:
      '강사의 개인 프로필 정보를 수정합니다. 이름, 전화번호, 소개, 학력, 전문분야, 자격증, 경력년수 등을 수정할 수 있습니다.',
    operationId: 'updateMyProfile',
  })
  @ApiBody({
    type: UpdateProfileDto,
    description: '수정할 프로필 정보',
    examples: {
      basic: {
        summary: '기본 정보 수정',
        value: {
          name: '김강사',
          phoneNumber: '010-1234-5678',
          introduction: '발레 전문 강사로서 10년간의 경험을 가지고 있습니다.',
          education: ['서울예술대학교 발레과 졸업'],
          specialties: ['발레 기초', '발레 중급'],
          certifications: ['발레 지도사 자격증'],
          yearsOfExperience: 10,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '프로필이 성공적으로 수정되었습니다.',
    schema: {
      example: {
        id: 1,
        userId: 'teacher001',
        name: '김강사',
        phoneNumber: '010-1234-5678',
        introduction: '발레 전문 강사로서 10년간의 경험을 가지고 있습니다.',
        photoUrl: '/uploads/teacher-photos/teacher001.jpg',
        education: ['서울예술대학교 발레과 졸업'],
        specialties: ['발레 기초', '발레 중급'],
        certifications: ['발레 지도사 자격증'],
        yearsOfExperience: 10,
        availableTimes: ['월요일 18:00-20:00', '수요일 18:00-20:00'],
        academyId: 1,
        academy: {
          id: 1,
          name: '발레 아카데미',
        },
        createdAt: '2024-01-15T10:30:00.000Z',
        updatedAt: '2024-01-15T10:30:00.000Z',
      },
    },
  })
  @ApiBadRequestResponse({
    description: '잘못된 입력값 (이름 길이, 전화번호 형식 등)',
    schema: {
      example: {
        statusCode: 400,
        message: [
          '이름은 2자 이상이어야 합니다.',
          '올바른 전화번호 형식이 아닙니다.',
        ],
        error: 'Bad Request',
      },
    },
  })
  @ApiNotFoundResponse({
    description: '강사를 찾을 수 없음',
    schema: {
      example: {
        statusCode: 404,
        message: '선생님을 찾을 수 없습니다.',
        code: 'TEACHER_NOT_FOUND',
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
    description: '강사 권한이 부족함',
    schema: {
      example: {
        statusCode: 403,
        message: 'Forbidden resource',
      },
    },
  })
  async updateMyProfile(
    @GetUser() user: any,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.teacherService.updateProfile(user.id, updateProfileDto);
  }

  @Put('me/profile/photo')
  @Roles(Role.TEACHER)
  @UseInterceptors(FileInterceptor('photo', teacherProfileConfig))
  @ApiOperation({
    summary: '프로필 사진 수정',
    description:
      '강사의 프로필 사진을 업로드하여 수정합니다. JPG, PNG, GIF 형식의 이미지 파일을 지원합니다.',
    operationId: 'updateMyProfilePhoto',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        photo: {
          type: 'string',
          format: 'binary',
          description: '업로드할 프로필 사진 (JPG, PNG, GIF)',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '프로필 사진이 성공적으로 업로드되었습니다.',
    schema: {
      example: {
        id: 1,
        photoUrl: '/uploads/teacher-photos/teacher001_photo.jpg',
        message: '프로필 사진이 성공적으로 업로드되었습니다.',
      },
    },
  })
  @ApiBadRequestResponse({
    description: '잘못된 파일 형식 또는 크기',
    schema: {
      example: {
        statusCode: 400,
        message:
          '지원하지 않는 파일 형식입니다. JPG, PNG, GIF 형식만 지원합니다.',
        code: 'INVALID_FILE_FORMAT',
      },
    },
  })
  @ApiNotFoundResponse({
    description: '강사를 찾을 수 없음',
    schema: {
      example: {
        statusCode: 404,
        message: '선생님을 찾을 수 없습니다.',
        code: 'TEACHER_NOT_FOUND',
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
    description: '강사 권한이 부족함',
    schema: {
      example: {
        statusCode: 403,
        message: 'Forbidden resource',
      },
    },
  })
  async updateMyProfilePhoto(
    @GetUser() user: any,
    @UploadedFile() photo: Express.Multer.File,
  ) {
    return this.teacherService.updateProfilePhoto(user.id, photo);
  }

  @Get('me/data')
  @Roles(Role.TEACHER)
  @ApiOperation({
    summary: '강사 데이터 조회',
    description:
      '강사의 상세 데이터를 조회합니다. 프로필 정보와 함께 학원, 클래스 등의 연관 정보를 포함합니다.',
    operationId: 'getTeacherData',
  })
  @ApiResponse({
    status: 200,
    description: '강사 데이터를 반환합니다.',
    schema: {
      example: {
        id: 1,
        userId: 'teacher001',
        name: '김강사',
        phoneNumber: '010-1234-5678',
        introduction: '발레 전문 강사',
        photoUrl: '/uploads/teacher-photos/teacher001.jpg',
        education: ['서울예술대학교 발레과 졸업'],
        specialties: ['발레 기초', '발레 중급'],
        certifications: ['발레 지도사 자격증'],
        yearsOfExperience: 10,
        availableTimes: ['월요일 18:00-20:00'],
        academyId: 1,
        academy: {
          id: 1,
          name: '발레 아카데미',
          code: 'BALLET_ACADEMY_001',
        },
        createdAt: '2024-01-15T10:30:00.000Z',
        updatedAt: '2024-01-15T10:30:00.000Z',
      },
    },
  })
  @ApiNotFoundResponse({
    description: '강사를 찾을 수 없음',
    schema: {
      example: {
        statusCode: 404,
        message: '선생님을 찾을 수 없습니다.',
        code: 'TEACHER_NOT_FOUND',
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
    description: '강사 권한이 부족함',
    schema: {
      example: {
        statusCode: 403,
        message: 'Forbidden resource',
      },
    },
  })
  async getTeacherData(@GetUser() user: any) {
    return this.teacherService.getTeacherData(user.id);
  }

  @Get('me/classes')
  @Roles(Role.TEACHER)
  @ApiOperation({
    summary: '내 클래스 목록 조회',
    description: '강사가 담당하고 있는 모든 클래스의 목록을 조회합니다.',
    operationId: 'getMyClasses',
  })
  @ApiResponse({
    status: 200,
    description: '담당 클래스 목록을 반환합니다.',
    schema: {
      example: [
        {
          id: 1,
          name: '발레 기초반',
          description: '발레의 기본 동작을 배우는 클래스입니다.',
          maxStudents: 15,
          price: 50000,
          academyId: 1,
          teacherId: 1,
          createdAt: '2024-01-15T10:30:00.000Z',
          updatedAt: '2024-01-15T10:30:00.000Z',
        },
      ],
    },
  })
  @ApiNotFoundResponse({
    description: '강사를 찾을 수 없음',
    schema: {
      example: {
        statusCode: 404,
        message: '선생님을 찾을 수 없습니다.',
        code: 'TEACHER_NOT_FOUND',
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
    description: '강사 권한이 부족함',
    schema: {
      example: {
        statusCode: 403,
        message: 'Forbidden resource',
      },
    },
  })
  async getMyClasses(@GetUser() user: any) {
    return this.teacherService.getTeacherClasses(user.id);
  }

  @Get('me/classes-with-sessions')
  @Roles(Role.TEACHER)
  @ApiOperation({
    summary: '내 클래스와 세션 정보 조회',
    description:
      '강사가 담당하고 있는 클래스와 해당 클래스의 세션 정보를 함께 조회합니다.',
    operationId: 'getMyClassesWithSessions',
  })
  @ApiResponse({
    status: 200,
    description: '클래스와 세션 정보를 반환합니다.',
    schema: {
      example: [
        {
          id: 1,
          name: '발레 기초반',
          description: '발레의 기본 동작을 배우는 클래스입니다.',
          maxStudents: 15,
          price: 50000,
          academyId: 1,
          teacherId: 1,
          classSessions: [
            {
              id: 1,
              name: '1주차 - 기본 자세',
              description: '발레의 기본 자세를 배웁니다.',
              startTime: '2024-01-15T18:00:00.000Z',
              endTime: '2024-01-15T20:00:00.000Z',
              maxStudents: 15,
              price: 50000,
            },
          ],
          createdAt: '2024-01-15T10:30:00.000Z',
          updatedAt: '2024-01-15T10:30:00.000Z',
        },
      ],
    },
  })
  @ApiNotFoundResponse({
    description: '강사를 찾을 수 없음',
    schema: {
      example: {
        statusCode: 404,
        message: '선생님을 찾을 수 없습니다.',
        code: 'TEACHER_NOT_FOUND',
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
    description: '강사 권한이 부족함',
    schema: {
      example: {
        statusCode: 403,
        message: 'Forbidden resource',
      },
    },
  })
  async getMyClassesWithSessions(@GetUser() user: any) {
    return this.teacherService.getTeacherClassesWithSessions(user.id);
  }

  // 선생님의 현재 학원 정보 조회
  @Get('me/academy')
  @Roles(Role.TEACHER)
  @ApiOperation({
    summary: '내 학원 정보 조회',
    description: '강사가 현재 소속되어 있는 학원의 상세 정보를 조회합니다.',
    operationId: 'getMyAcademy',
  })
  @ApiResponse({
    status: 200,
    description: '현재 소속된 학원 정보를 반환합니다.',
    schema: {
      example: {
        id: 1,
        name: '발레 아카데미',
        code: 'BALLET_ACADEMY_001',
        phoneNumber: '02-1234-5678',
        address: '서울시 강남구 테헤란로 123',
        description: '전문적인 발레 교육을 제공하는 학원입니다.',
        principal: {
          id: 1,
          name: '박원장',
        },
        teachers: [
          {
            id: 1,
            name: '김강사',
            classes: [
              {
                id: 1,
                name: '발레 기초반',
                classSessions: [
                  {
                    id: 1,
                    name: '1주차 - 기본 자세',
                    enrollments: [
                      {
                        id: 1,
                        student: {
                          id: 1,
                          name: '학생1',
                        },
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        classes: [
          {
            id: 1,
            name: '발레 기초반',
            teacher: {
              id: 1,
              name: '김강사',
            },
            classSessions: [
              {
                id: 1,
                name: '1주차 - 기본 자세',
                enrollments: [
                  {
                    id: 1,
                    student: {
                      id: 1,
                      name: '학생1',
                    },
                  },
                ],
              },
            ],
          },
        ],
        students: [
          {
            id: 1,
            student: {
              id: 1,
              name: '학생1',
            },
          },
        ],
        createdAt: '2024-01-15T10:30:00.000Z',
        updatedAt: '2024-01-15T10:30:00.000Z',
      },
    },
  })
  @ApiNotFoundResponse({
    description: '강사를 찾을 수 없음',
    schema: {
      example: {
        statusCode: 404,
        message: '선생님을 찾을 수 없습니다.',
        code: 'TEACHER_NOT_FOUND',
        details: { teacherId: 1 },
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
    description: '강사 권한이 부족함',
    schema: {
      example: {
        statusCode: 403,
        message: 'Forbidden resource',
      },
    },
  })
  async getMyAcademy(@GetUser() user: any) {
    return this.teacherService.getMyAcademy(user.id);
  }

  // 선생님의 학원 변경
  @Post('me/change-academy')
  @Roles(Role.TEACHER)
  @ApiOperation({
    summary: '학원 변경',
    description:
      '강사가 현재 소속된 학원을 다른 학원으로 변경합니다. 학원 코드를 사용하여 변경할 수 있습니다.',
    operationId: 'changeAcademy',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        code: {
          type: 'string',
          description: '변경할 학원의 고유 코드',
          example: 'NEW_ACADEMY_001',
        },
      },
      required: ['code'],
    },
  })
  @ApiResponse({
    status: 200,
    description: '학원 변경이 완료되었습니다.',
    schema: {
      example: {
        id: 1,
        userId: 'teacher001',
        name: '김강사',
        phoneNumber: '010-1234-5678',
        academyId: 2,
        academy: {
          id: 2,
          name: '새로운 발레 아카데미',
        },
        createdAt: '2024-01-15T10:30:00.000Z',
        updatedAt: '2024-01-15T10:30:00.000Z',
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
    description: '강사 또는 학원을 찾을 수 없음',
    schema: {
      example: {
        statusCode: 404,
        message: '해당 코드의 학원을 찾을 수 없습니다.',
        code: 'ACADEMY_CODE_NOT_FOUND',
        details: { code: 'INVALID_CODE' },
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
    description: '강사 권한이 부족함',
    schema: {
      example: {
        statusCode: 403,
        message: 'Forbidden resource',
      },
    },
  })
  async changeAcademy(@GetUser() user: any, @Body() body: { code: string }) {
    return this.teacherService.changeAcademy(user.id, body.code);
  }

  // 학원 탈퇴 (관리자 불가)
  @Post('me/leave-academy')
  @Roles(Role.TEACHER)
  @ApiOperation({
    summary: '학원 탈퇴',
    description:
      '강사가 현재 소속된 학원에서 탈퇴합니다. 담당하고 있는 클래스가 있는 경우 탈퇴할 수 없습니다.',
    operationId: 'leaveAcademy',
  })
  @ApiResponse({
    status: 200,
    description: '학원 탈퇴가 완료되었습니다.',
    schema: {
      example: {
        id: 1,
        userId: 'teacher001',
        name: '김강사',
        phoneNumber: '010-1234-5678',
        academyId: null,
        academy: null,
        createdAt: '2024-01-15T10:30:00.000Z',
        updatedAt: '2024-01-15T10:30:00.000Z',
      },
    },
  })
  @ApiBadRequestResponse({
    description: '소속된 학원이 없거나 담당 클래스가 있어 탈퇴할 수 없음',
    schema: {
      example: {
        statusCode: 400,
        message: '담당하고 있는 클래스가 있어 학원을 탈퇴할 수 없습니다.',
        code: 'TEACHER_HAS_CLASSES',
        details: { classCount: 3 },
      },
    },
  })
  @ApiNotFoundResponse({
    description: '강사를 찾을 수 없음',
    schema: {
      example: {
        statusCode: 404,
        message: '선생님을 찾을 수 없습니다.',
        code: 'TEACHER_NOT_FOUND',
        details: { teacherId: 1 },
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
    description: '강사 권한이 부족함',
    schema: {
      example: {
        statusCode: 403,
        message: 'Forbidden resource',
      },
    },
  })
  async leaveAcademy(@GetUser() user: any) {
    return this.teacherService.leaveAcademy(user.id);
  }
}
