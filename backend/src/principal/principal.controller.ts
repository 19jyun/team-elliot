import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Param,
  ParseIntPipe,
  UseGuards,
  Body,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PrincipalService } from './principal.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { Role } from '@prisma/client';
import { UpdateAcademyDto } from './dto/update-academy.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { principalProfileConfig } from '../config/multer.config';
import { ClassService } from '../class/class.service';
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
  ApiConsumes,
} from '@nestjs/swagger';

@ApiTags('Principal')
@Controller('principal')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.PRINCIPAL)
@ApiBearerAuth('JWT-auth')
export class PrincipalController {
  constructor(
    private readonly principalService: PrincipalService,
    private readonly classService: ClassService,
  ) {}

  // Principal의 학원 정보 조회
  @Get('academy')
  @ApiOperation({
    summary: '학원 정보 조회',
    description: 'Principal이 소속된 학원의 상세 정보를 조회합니다.',
    operationId: 'getMyAcademy',
  })
  @ApiResponse({
    status: 200,
    description: '학원 정보를 반환합니다.',
    schema: {
      example: {
        id: 1,
        name: '발레 아카데미',
        phoneNumber: '02-1234-5678',
        address: '서울시 강남구 테헤란로 123',
        description: '전문적인 발레 교육을 제공하는 아카데미입니다.',
        teachers: [
          {
            id: 1,
            name: '김강사',
            classes: [
              {
                id: 1,
                className: '발레 기초반',
              },
            ],
          },
        ],
        classes: [
          {
            id: 1,
            className: '발레 기초반',
            teacher: {
              id: 1,
              name: '김강사',
            },
            classSessions: [
              {
                id: 1,
                date: '2024-01-15T00:00:00.000Z',
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
        ],
        students: [
          {
            id: 1,
            student: {
              id: 1,
              name: '김학생',
            },
          },
        ],
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Principal을 찾을 수 없음',
    schema: {
      example: {
        statusCode: 404,
        message: 'Principal을 찾을 수 없습니다.',
        code: 'PRINCIPAL_NOT_FOUND',
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
    description: 'Principal 권한이 부족함',
    schema: {
      example: {
        statusCode: 403,
        message: 'Forbidden resource',
      },
    },
  })
  async getMyAcademy(@GetUser() user: any) {
    return this.principalService.getMyAcademy(user.id);
  }

  // Principal의 학원 모든 세션 조회
  @Get('sessions')
  @ApiOperation({
    summary: '학원 모든 세션 조회',
    description: 'Principal이 소속된 학원의 모든 세션 정보를 조회합니다.',
    operationId: 'getAllSessions',
  })
  @ApiResponse({
    status: 200,
    description: '학원의 모든 세션 정보를 반환합니다.',
    schema: {
      example: [
        {
          id: 1,
          date: '2024-01-15T00:00:00.000Z',
          startTime: '2024-01-15T18:00:00.000Z',
          endTime: '2024-01-15T20:00:00.000Z',
          class: {
            id: 1,
            className: '발레 기초반',
            teacher: {
              id: 1,
              name: '김강사',
            },
          },
          enrollments: [
            {
              id: 1,
              status: 'CONFIRMED',
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
  @ApiNotFoundResponse({
    description: 'Principal을 찾을 수 없음',
    schema: {
      example: {
        statusCode: 404,
        message: 'Principal을 찾을 수 없습니다.',
        code: 'PRINCIPAL_NOT_FOUND',
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
    description: 'Principal 권한이 부족함',
    schema: {
      example: {
        statusCode: 403,
        message: 'Forbidden resource',
      },
    },
  })
  async getAllSessions(@GetUser() user: any) {
    return this.principalService.getAllSessions(user.id);
  }

  // Principal의 학원 모든 클래스 조회
  @Get('classes')
  async getAllClasses(@GetUser() user: any) {
    return this.principalService.getAllClasses(user.id);
  }

  // Principal의 클래스 생성
  @Post('classes')
  @ApiOperation({
    summary: '클래스 생성',
    description:
      'Principal이 소속된 학원에 새로운 클래스를 생성합니다. 학원 ID는 자동으로 설정됩니다.',
    operationId: 'createClass',
  })
  @ApiBody({
    description: '클래스 생성 정보',
    examples: {
      basicClass: {
        summary: '기본 클래스 생성',
        value: {
          className: '발레 기초반',
          description: '발레를 처음 배우는 학생들을 위한 기초 클래스입니다.',
          maxStudents: 15,
          level: 'BEGINNER',
          dayOfWeek: 'MONDAY',
          startTime: '18:00',
          endTime: '20:00',
          startDate: '2024-01-15',
          endDate: '2024-03-15',
          price: 50000,
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: '클래스가 성공적으로 생성되었습니다.',
    schema: {
      example: {
        id: 1,
        className: '발레 기초반',
        description: '발레를 처음 배우는 학생들을 위한 기초 클래스입니다.',
        maxStudents: 15,
        level: 'BEGINNER',
        dayOfWeek: 'MONDAY',
        startTime: '18:00',
        endTime: '20:00',
        startDate: '2024-01-15',
        endDate: '2024-03-15',
        price: 50000,
        academyId: 1,
        teacherId: null,
        status: 'DRAFT',
        createdAt: '2024-01-15T10:30:00.000Z',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Principal이 소속된 학원을 찾을 수 없음',
    schema: {
      example: {
        statusCode: 400,
        message: 'Principal이 소속된 학원을 찾을 수 없습니다.',
        code: 'ACADEMY_NOT_FOUND',
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
    description: 'Principal 권한이 부족함',
    schema: {
      example: {
        statusCode: 403,
        message: 'Forbidden resource',
      },
    },
  })
  async createClass(@GetUser() user: any, @Body() createClassDto: any) {
    // Principal의 ID를 가져와서 클래스 생성
    const principal = await this.principalService.getPrincipalInfo(user.id);

    // Principal의 학원 ID를 자동으로 설정
    const principalWithAcademy = await this.principalService.getPrincipalData(
      user.id,
    );
    const academyId = principalWithAcademy.academy?.id;

    if (!academyId) {
      throw new BadRequestException({
        code: 'ACADEMY_NOT_FOUND',
        message: 'Principal이 소속된 학원을 찾을 수 없습니다.',
      });
    }

    // academyId를 자동으로 설정
    const classData = {
      ...createClassDto,
      academyId: academyId,
    };

    return this.classService.createClass(classData, 'PRINCIPAL');
  }

  // Principal의 학원 모든 강사 조회
  @Get('teachers')
  async getAllTeachers(@GetUser() user: any) {
    return this.principalService.getAllTeachers(user.id);
  }

  // Principal의 학원 모든 학생 조회
  @Get('students')
  async getAllStudents(@GetUser() user: any) {
    return this.principalService.getAllStudents(user.id);
  }

  // Principal의 학원 모든 수강신청 조회 (Redux store용)
  @Get('enrollments')
  async getAllEnrollments(@GetUser() user: any) {
    return this.principalService.getAllEnrollments(user.id);
  }

  // Principal의 학원 모든 환불요청 조회 (Redux store용)
  @Get('refund-requests')
  async getAllRefundRequests(@GetUser() user: any) {
    return this.principalService.getAllRefundRequests(user.id);
  }

  // Principal 정보 조회
  @Get('profile')
  async getPrincipalInfo(@GetUser() user: any) {
    return this.principalService.getPrincipalInfo(user.id);
  }

  // Principal의 은행 정보 조회
  @Get('bank-info')
  async getPrincipalBankInfo(@GetUser() user: any) {
    return this.principalService.getPrincipalBankInfo(user.id);
  }

  // Principal 전체 데이터 조회 (Redux 초기화용)
  @Get('me/data')
  async getPrincipalData(@GetUser() user: any) {
    return this.principalService.getPrincipalData(user.id);
  }

  // Principal 프로필 정보 수정
  @Put('profile')
  @ApiOperation({
    summary: '프로필 정보 수정',
    description: 'Principal의 개인 프로필 정보를 수정합니다.',
    operationId: 'updateProfile',
  })
  @ApiBody({
    type: UpdateProfileDto,
    description: '수정할 프로필 정보',
    examples: {
      basicProfile: {
        summary: '기본 프로필 수정',
        value: {
          name: '김원장',
          phoneNumber: '010-1234-5678',
          introduction: '발레 교육에 열정을 가진 원장입니다.',
          education: ['서울예술대학교 무용과 졸업'],
          certifications: ['발레 지도사 자격증'],
        },
      },
      bankInfo: {
        summary: '은행 정보 추가',
        value: {
          bankName: '신한은행',
          accountNumber: '110-123456789',
          accountHolder: '김원장',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '프로필 정보가 성공적으로 수정되었습니다.',
    schema: {
      example: {
        id: 1,
        name: '김원장',
        phoneNumber: '010-1234-5678',
        introduction: '발레 교육에 열정을 가진 원장입니다.',
        education: ['서울예술대학교 무용과 졸업'],
        certifications: ['발레 지도사 자격증'],
        bankName: '신한은행',
        accountNumber: '110-123456789',
        accountHolder: '김원장',
        updatedAt: '2024-01-15T10:30:00.000Z',
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
    description: 'Principal 권한이 부족함',
    schema: {
      example: {
        statusCode: 403,
        message: 'Forbidden resource',
      },
    },
  })
  async updateProfile(
    @GetUser() user: any,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.principalService.updateProfile(user.id, updateProfileDto);
  }

  // Principal 프로필 사진 업데이트
  @Put('profile/photo')
  @UseInterceptors(FileInterceptor('photo', principalProfileConfig))
  @ApiOperation({
    summary: '프로필 사진 업데이트',
    description: 'Principal의 프로필 사진을 업로드하여 업데이트합니다.',
    operationId: 'updateProfilePhoto',
  })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 200,
    description: '프로필 사진이 성공적으로 업데이트되었습니다.',
    schema: {
      example: {
        id: 1,
        name: '김원장',
        profilePhotoUrl: '/uploads/principal-photos/profile-123.jpg',
        updatedAt: '2024-01-15T10:30:00.000Z',
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
    description: 'Principal 권한이 부족함',
    schema: {
      example: {
        statusCode: 403,
        message: 'Forbidden resource',
      },
    },
  })
  async updateProfilePhoto(
    @GetUser() user: any,
    @UploadedFile() photo: Express.Multer.File,
  ) {
    return this.principalService.updateProfilePhoto(user.id, photo);
  }

  // Principal의 세션 수강생 조회
  @Get('sessions/:sessionId/enrollments')
  async getSessionEnrollments(
    @Param('sessionId', ParseIntPipe) sessionId: number,
    @GetUser() user: any,
  ) {
    return this.principalService.getSessionEnrollments(sessionId, user.id);
  }

  // Principal의 학원 정보 수정
  @Put('academy')
  async updateAcademy(
    @GetUser() user: any,
    @Body() updateAcademyDto: UpdateAcademyDto,
  ) {
    return this.principalService.updateAcademy(user.id, updateAcademyDto);
  }

  // === 수강 신청/환불 신청 관리 API ===

  // Principal의 수강 신청 대기 세션 목록 조회
  @Get('sessions-with-enrollment-requests')
  async getSessionsWithEnrollmentRequests(@GetUser() user: any) {
    return this.principalService.getSessionsWithEnrollmentRequests(user.id);
  }

  // Principal의 환불 요청 대기 세션 목록 조회
  @Get('sessions-with-refund-requests')
  async getSessionsWithRefundRequests(@GetUser() user: any) {
    return this.principalService.getSessionsWithRefundRequests(user.id);
  }

  // 특정 세션의 수강 신청 요청 목록 조회
  @Get('sessions/:sessionId/enrollment-requests')
  async getSessionEnrollmentRequests(
    @Param('sessionId', ParseIntPipe) sessionId: number,
    @GetUser() user: any,
  ) {
    return this.principalService.getSessionEnrollmentRequests(
      sessionId,
      user.id,
    );
  }

  // 특정 세션의 환불 요청 목록 조회
  @Get('sessions/:sessionId/refund-requests')
  async getSessionRefundRequests(
    @Param('sessionId', ParseIntPipe) sessionId: number,
    @GetUser() user: any,
  ) {
    return this.principalService.getSessionRefundRequests(sessionId, user.id);
  }

  // 수강 신청 승인
  @Post('enrollments/:enrollmentId/approve')
  async approveEnrollment(
    @Param('enrollmentId', ParseIntPipe) enrollmentId: number,
    @GetUser() user: any,
  ) {
    return this.principalService.approveEnrollment(enrollmentId, user.id);
  }

  // 수강 신청 거절
  @Post('enrollments/:enrollmentId/reject')
  async rejectEnrollment(
    @Param('enrollmentId', ParseIntPipe) enrollmentId: number,
    @Body() rejectData: { reason: string; detailedReason?: string },
    @GetUser() user: any,
  ) {
    return this.principalService.rejectEnrollment(
      enrollmentId,
      rejectData,
      user.id,
    );
  }

  // 환불 요청 승인
  @Post('refunds/:refundId/approve')
  async approveRefund(
    @Param('refundId', ParseIntPipe) refundId: number,
    @GetUser() user: any,
  ) {
    return this.principalService.approveRefund(refundId, user.id);
  }

  // 환불 요청 거절
  @Put('refunds/:refundId/reject')
  async rejectRefund(
    @Param('refundId', ParseIntPipe) refundId: number,
    @Body() rejectData: { reason: string; detailedReason?: string },
    @GetUser() user: any,
  ) {
    return this.principalService.rejectRefund(refundId, rejectData, user.id);
  }

  // === 선생님/수강생 관리 API ===

  // 선생님을 학원에서 제거
  @Delete('teachers/:teacherId')
  async removeTeacher(
    @Param('teacherId', ParseIntPipe) teacherId: number,
    @GetUser() user: any,
  ) {
    return this.principalService.removeTeacher(teacherId, user.id);
  }

  // 수강생을 학원에서 제거
  @Delete('students/:studentId')
  async removeStudent(
    @Param('studentId', ParseIntPipe) studentId: number,
    @GetUser() user: any,
  ) {
    return this.principalService.removeStudent(studentId, user.id);
  }

  // 수강생의 세션 수강 현황 조회
  @Get('students/:studentId/sessions')
  async getStudentSessionHistory(
    @Param('studentId', ParseIntPipe) studentId: number,
    @GetUser() user: any,
  ) {
    return this.principalService.getStudentSessionHistory(studentId, user.id);
  }
}
