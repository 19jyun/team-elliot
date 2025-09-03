import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiConsumes,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
} from '@nestjs/swagger';
import { BalletPoseService } from './ballet-pose.service';
import { CreateBalletPoseDto } from './dto/create-ballet-pose.dto';
import { UpdateBalletPoseDto } from './dto/update-ballet-pose.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { balletPoseConfig } from '../config/multer.config';

@ApiTags('BalletPose')
@Controller('ballet-poses')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class BalletPoseController {
  constructor(private readonly balletPoseService: BalletPoseService) {}

  @Get()
  @ApiOperation({
    summary: '발레 자세 목록 조회',
    description:
      '모든 발레 자세를 조회합니다. 난이도별로 필터링이 가능하며, 난이도 순으로 정렬됩니다.',
    operationId: 'findAll',
  })
  @ApiQuery({
    name: 'difficulty',
    description: '난이도로 필터링 (선택사항)',
    required: false,
    example: 'BEGINNER',
    enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'],
  })
  @ApiResponse({
    status: 200,
    description: '발레 자세 목록 조회 성공',
    schema: {
      example: [
        {
          id: 1,
          name: '플리에',
          imageUrl: '/uploads/ballet-poses/plie.jpg',
          description: '발레의 기본 자세 중 하나로, 무릎을 굽히는 동작입니다.',
          difficulty: 'BEGINNER',
          createdAt: '2024-01-15T10:30:00.000Z',
        },
        {
          id: 2,
          name: '바토망',
          imageUrl: '/uploads/ballet-poses/battement.jpg',
          description:
            '발레바를 잡고 하는 기본 동작으로, 다리를 들어올리는 동작입니다.',
          difficulty: 'INTERMEDIATE',
          createdAt: '2024-01-15T10:30:00.000Z',
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
  async findAll(@Query('difficulty') difficulty?: string) {
    if (difficulty) {
      return this.balletPoseService.findByDifficulty(difficulty);
    }
    return this.balletPoseService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: '발레 자세 상세 조회',
    description: '특정 발레 자세의 상세 정보를 조회합니다.',
    operationId: 'findOne',
  })
  @ApiParam({
    name: 'id',
    description: '조회할 발레 자세의 고유 ID',
    example: 1,
    type: 'integer',
  })
  @ApiResponse({
    status: 200,
    description: '발레 자세 상세 조회 성공',
    schema: {
      example: {
        id: 1,
        name: '플리에',
        imageUrl: '/uploads/ballet-poses/plie.jpg',
        description:
          '발레의 기본 자세 중 하나로, 무릎을 굽히는 동작입니다. 발레의 모든 동작의 기초가 되는 중요한 자세입니다.',
        difficulty: 'BEGINNER',
        createdAt: '2024-01-15T10:30:00.000Z',
        updatedAt: '2024-01-15T10:30:00.000Z',
      },
    },
  })
  @ApiNotFoundResponse({
    description: '발레 자세를 찾을 수 없음',
    schema: {
      example: {
        statusCode: 404,
        message: '발레 자세를 찾을 수 없습니다.',
        code: 'BALLET_POSE_NOT_FOUND',
        details: { poseId: 999 },
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
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.balletPoseService.findOne(id);
  }

  @Post()
  @Roles(Role.PRINCIPAL)
  @UseInterceptors(FileInterceptor('image', balletPoseConfig))
  @ApiOperation({
    summary: '발레 자세 생성',
    description:
      '원장 권한으로 새로운 발레 자세를 생성합니다. 이미지 업로드가 가능하며, 동일한 이름의 자세는 생성할 수 없습니다.',
    operationId: 'create',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: CreateBalletPoseDto,
    description: '발레 자세 생성 정보',
    examples: {
      basicPose: {
        summary: '기본 발레 자세 생성',
        value: {
          name: '플리에',
          description: '발레의 기본 자세 중 하나로, 무릎을 굽히는 동작입니다.',
          difficulty: 'BEGINNER',
        },
      },
      advancedPose: {
        summary: '고급 발레 자세 생성',
        value: {
          name: '피루엣',
          description: '발끝으로 회전하는 고급 발레 동작입니다.',
          difficulty: 'ADVANCED',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: '발레 자세 생성 성공',
    schema: {
      example: {
        id: 1,
        name: '플리에',
        imageUrl: '/uploads/ballet-poses/plie.jpg',
        description: '발레의 기본 자세 중 하나로, 무릎을 굽히는 동작입니다.',
        difficulty: 'BEGINNER',
        createdAt: '2024-01-15T10:30:00.000Z',
      },
    },
  })
  @ApiBadRequestResponse({
    description: '잘못된 입력값 또는 이미지 형식/크기 오류',
    schema: {
      example: {
        statusCode: 400,
        message: '지원하지 않는 이미지 형식입니다. (JPG, PNG, WEBP만 가능)',
        code: 'INVALID_IMAGE_FORMAT',
        details: {
          providedType: 'image/gif',
          allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
        },
      },
    },
  })
  @ApiConflictResponse({
    description: '이미 존재하는 발레 자세명',
    schema: {
      example: {
        statusCode: 409,
        message: '이미 존재하는 발레 자세명입니다.',
        code: 'BALLET_POSE_NAME_ALREADY_EXISTS',
        details: { name: '플리에' },
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
  async create(
    @Body() createBalletPoseDto: CreateBalletPoseDto,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    return this.balletPoseService.create(createBalletPoseDto, image);
  }

  @Patch(':id')
  @Roles(Role.PRINCIPAL)
  @UseInterceptors(FileInterceptor('image', balletPoseConfig))
  @ApiOperation({
    summary: '발레 자세 수정',
    description:
      '원장 권한으로 기존 발레 자세를 수정합니다. 이미지 업로드가 가능하며, 이름 변경 시 중복 검사가 수행됩니다.',
    operationId: 'update',
  })
  @ApiParam({
    name: 'id',
    description: '수정할 발레 자세의 고유 ID',
    example: 1,
    type: 'integer',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: UpdateBalletPoseDto,
    description: '수정할 발레 자세 정보',
    examples: {
      updateDescription: {
        summary: '설명 수정',
        value: {
          description: '수정된 발레 자세 설명입니다.',
        },
      },
      updateDifficulty: {
        summary: '난이도 수정',
        value: {
          difficulty: 'INTERMEDIATE',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '발레 자세 수정 성공',
    schema: {
      example: {
        id: 1,
        name: '플리에',
        imageUrl: '/uploads/ballet-poses/plie-updated.jpg',
        description: '수정된 발레 자세 설명입니다.',
        difficulty: 'INTERMEDIATE',
        updatedAt: '2024-01-15T10:30:00.000Z',
      },
    },
  })
  @ApiBadRequestResponse({
    description: '잘못된 입력값 또는 이미지 형식/크기 오류',
    schema: {
      example: {
        statusCode: 400,
        message: '이미지 크기가 너무 큽니다. (5MB 이하만 가능)',
        code: 'IMAGE_TOO_LARGE',
        details: {
          providedSize: 10485760,
          maxSize: 5242880,
        },
      },
    },
  })
  @ApiNotFoundResponse({
    description: '발레 자세를 찾을 수 없음',
    schema: {
      example: {
        statusCode: 404,
        message: '발레 자세를 찾을 수 없습니다.',
        code: 'BALLET_POSE_NOT_FOUND',
        details: { poseId: 999 },
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
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBalletPoseDto: UpdateBalletPoseDto,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    return this.balletPoseService.update(id, updateBalletPoseDto, image);
  }

  @Delete(':id')
  @Roles(Role.PRINCIPAL)
  @ApiOperation({
    summary: '발레 자세 삭제',
    description:
      '원장 권한으로 발레 자세를 삭제합니다. 주의: 이 작업은 되돌릴 수 없습니다.',
    operationId: 'remove',
  })
  @ApiParam({
    name: 'id',
    description: '삭제할 발레 자세의 고유 ID',
    example: 1,
    type: 'integer',
  })
  @ApiResponse({
    status: 200,
    description: '발레 자세 삭제 성공',
    schema: {
      example: {
        id: 1,
        name: '플리에',
        imageUrl: '/uploads/ballet-poses/plie.jpg',
        description: '발레의 기본 자세 중 하나로, 무릎을 굽히는 동작입니다.',
        difficulty: 'BEGINNER',
        deletedAt: '2024-01-15T10:30:00.000Z',
      },
    },
  })
  @ApiNotFoundResponse({
    description: '발레 자세를 찾을 수 없음',
    schema: {
      example: {
        statusCode: 404,
        message: '발레 자세를 찾을 수 없습니다.',
        code: 'BALLET_POSE_NOT_FOUND',
        details: { poseId: 999 },
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
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.balletPoseService.remove(id);
  }
}
