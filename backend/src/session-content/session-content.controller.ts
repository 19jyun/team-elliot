import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
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
} from '@nestjs/swagger';
import { SessionContentService } from './session-content.service';
import { CreateSessionContentDto } from './dto/create-session-content.dto';
import { UpdateSessionContentDto } from './dto/update-session-content.dto';
import { ReorderSessionContentsDto } from './dto/reorder-session-contents.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('SessionContent')
@Controller('class-sessions/:sessionId/contents')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class SessionContentController {
  constructor(private readonly sessionContentService: SessionContentService) {}

  @Get()
  @ApiOperation({
    summary: '세션 내용 목록 조회',
    description: '특정 세션의 모든 내용을 순서대로 조회합니다.',
    operationId: 'findBySessionId',
  })
  @ApiParam({
    name: 'sessionId',
    description: '내용을 조회할 세션의 고유 ID',
    example: 1,
    type: 'integer',
  })
  @ApiResponse({
    status: 200,
    description: '세션 내용 목록 조회 성공',
    schema: {
      example: [
        {
          id: 1,
          sessionId: 1,
          poseId: 1,
          order: 0,
          notes: '기본 자세 연습',
          pose: {
            id: 1,
            name: '플리에',
            description: '발레의 기본 자세 중 하나',
            imageUrl: '/uploads/ballet-poses/plie.jpg',
          },
        },
        {
          id: 2,
          sessionId: 1,
          poseId: 2,
          order: 1,
          notes: '발레바 연습',
          pose: {
            id: 2,
            name: '바토망',
            description: '발레바를 잡고 하는 기본 동작',
            imageUrl: '/uploads/ballet-poses/battement.jpg',
          },
        },
      ],
    },
  })
  @ApiNotFoundResponse({
    description: '세션을 찾을 수 없음',
    schema: {
      example: {
        statusCode: 404,
        message: '세션을 찾을 수 없습니다.',
        code: 'SESSION_NOT_FOUND',
        details: { sessionId: 999 },
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
  async findBySessionId(@Param('sessionId', ParseIntPipe) sessionId: number) {
    return this.sessionContentService.findBySessionId(sessionId);
  }

  @Get(':id')
  @ApiOperation({
    summary: '세션 내용 상세 조회',
    description: '특정 세션 내용의 상세 정보를 조회합니다.',
    operationId: 'findOne',
  })
  @ApiParam({
    name: 'sessionId',
    description: '세션의 고유 ID',
    example: 1,
    type: 'integer',
  })
  @ApiParam({
    name: 'id',
    description: '조회할 세션 내용의 고유 ID',
    example: 1,
    type: 'integer',
  })
  @ApiResponse({
    status: 200,
    description: '세션 내용 상세 조회 성공',
    schema: {
      example: {
        id: 1,
        sessionId: 1,
        poseId: 1,
        order: 0,
        notes: '기본 자세 연습',
        pose: {
          id: 1,
          name: '플리에',
          description: '발레의 기본 자세 중 하나',
          imageUrl: '/uploads/ballet-poses/plie.jpg',
        },
      },
    },
  })
  @ApiNotFoundResponse({
    description: '세션 내용을 찾을 수 없음',
    schema: {
      example: {
        statusCode: 404,
        message: '세션 내용을 찾을 수 없습니다.',
        code: 'SESSION_CONTENT_NOT_FOUND',
        details: { contentId: 999 },
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
    return this.sessionContentService.findOne(id);
  }

  @Post()
  @Roles(Role.TEACHER, Role.PRINCIPAL)
  @ApiOperation({
    summary: '세션 내용 추가',
    description:
      '강사 또는 원장 권한으로 세션에 새로운 내용을 추가합니다. 순서가 지정되지 않은 경우 자동으로 마지막 순서에 추가됩니다.',
    operationId: 'create',
  })
  @ApiParam({
    name: 'sessionId',
    description: '내용을 추가할 세션의 고유 ID',
    example: 1,
    type: 'integer',
  })
  @ApiBody({
    type: CreateSessionContentDto,
    description: '세션 내용 생성 정보',
    examples: {
      basicContent: {
        summary: '기본 내용 추가',
        value: {
          poseId: 1,
          notes: '기본 자세 연습',
        },
      },
      orderedContent: {
        summary: '순서 지정 내용 추가',
        value: {
          poseId: 2,
          order: 1,
          notes: '발레바 연습',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: '세션 내용 추가 성공',
    schema: {
      example: {
        id: 1,
        sessionId: 1,
        poseId: 1,
        order: 0,
        notes: '기본 자세 연습',
        pose: {
          id: 1,
          name: '플리에',
          description: '발레의 기본 자세 중 하나',
          imageUrl: '/uploads/ballet-poses/plie.jpg',
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: '잘못된 입력값',
    schema: {
      example: {
        statusCode: 400,
        message: '발레 자세 ID는 1 이상이어야 합니다.',
        error: 'Bad Request',
      },
    },
  })
  @ApiNotFoundResponse({
    description: '세션이나 발레 자세를 찾을 수 없음',
    schema: {
      example: {
        statusCode: 404,
        message: '세션을 찾을 수 없습니다.',
        code: 'SESSION_NOT_FOUND',
        details: { sessionId: 999 },
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
    description: '강사 또는 원장 권한이 부족함',
    schema: {
      example: {
        statusCode: 403,
        message: 'Forbidden resource',
      },
    },
  })
  async create(
    @Param('sessionId', ParseIntPipe) sessionId: number,
    @Body() createSessionContentDto: CreateSessionContentDto,
  ) {
    return this.sessionContentService.create(
      sessionId,
      createSessionContentDto,
    );
  }

  @Patch('reorder')
  @Roles(Role.TEACHER, Role.PRINCIPAL)
  @ApiOperation({
    summary: '세션 내용 순서 변경',
    description:
      '강사 또는 원장 권한으로 세션 내용의 순서를 변경합니다. 트랜잭션을 통해 모든 순서가 동시에 업데이트됩니다.',
    operationId: 'reorder',
  })
  @ApiParam({
    name: 'sessionId',
    description: '순서를 변경할 세션의 고유 ID',
    example: 1,
    type: 'integer',
  })
  @ApiBody({
    type: ReorderSessionContentsDto,
    description: '순서 변경 정보',
    examples: {
      reorderContents: {
        summary: '세션 내용 순서 변경',
        value: {
          contentIds: ['1', '3', '2', '4'],
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '세션 내용 순서 변경 성공',
    schema: {
      example: [
        {
          id: 1,
          sessionId: 1,
          poseId: 1,
          order: 0,
          notes: '기본 자세 연습',
          pose: {
            id: 1,
            name: '플리에',
            description: '발레의 기본 자세 중 하나',
            imageUrl: '/uploads/ballet-poses/plie.jpg',
          },
        },
        {
          id: 3,
          sessionId: 1,
          poseId: 3,
          order: 1,
          notes: '발레바 연습',
          pose: {
            id: 3,
            name: '바토망',
            description: '발레바를 잡고 하는 기본 동작',
            imageUrl: '/uploads/ballet-poses/battement.jpg',
          },
        },
      ],
    },
  })
  @ApiBadRequestResponse({
    description: '유효하지 않은 세션 내용 ID가 포함됨',
    schema: {
      example: {
        statusCode: 400,
        message: '유효하지 않은 세션 내용 ID가 포함되어 있습니다.',
        code: 'INVALID_CONTENT_IDS',
        details: {
          sessionId: 1,
          requestedIds: [1, 999, 3],
          validIds: [1, 2, 3, 4],
        },
      },
    },
  })
  @ApiNotFoundResponse({
    description: '세션을 찾을 수 없음',
    schema: {
      example: {
        statusCode: 404,
        message: '세션을 찾을 수 없습니다.',
        code: 'SESSION_NOT_FOUND',
        details: { sessionId: 999 },
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
    description: '강사 또는 원장 권한이 부족함',
    schema: {
      example: {
        statusCode: 403,
        message: 'Forbidden resource',
      },
    },
  })
  async reorder(
    @Param('sessionId', ParseIntPipe) sessionId: number,
    @Body() reorderDto: ReorderSessionContentsDto,
  ) {
    return this.sessionContentService.reorder(sessionId, reorderDto);
  }

  @Patch(':id')
  @Roles(Role.TEACHER, Role.PRINCIPAL)
  @ApiOperation({
    summary: '세션 내용 수정',
    description: '강사 또는 원장 권한으로 특정 세션 내용을 수정합니다.',
    operationId: 'update',
  })
  @ApiParam({
    name: 'sessionId',
    description: '세션의 고유 ID',
    example: 1,
    type: 'integer',
  })
  @ApiParam({
    name: 'id',
    description: '수정할 세션 내용의 고유 ID',
    example: 1,
    type: 'integer',
  })
  @ApiBody({
    type: UpdateSessionContentDto,
    description: '수정할 세션 내용 정보',
    examples: {
      updateNotes: {
        summary: '노트 수정',
        value: {
          notes: '수정된 노트 내용',
        },
      },
      updateOrder: {
        summary: '순서 수정',
        value: {
          order: 2,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '세션 내용 수정 성공',
    schema: {
      example: {
        id: 1,
        sessionId: 1,
        poseId: 1,
        order: 2,
        notes: '수정된 노트 내용',
        pose: {
          id: 1,
          name: '플리에',
          description: '발레의 기본 자세 중 하나',
          imageUrl: '/uploads/ballet-poses/plie.jpg',
        },
      },
    },
  })
  @ApiNotFoundResponse({
    description: '세션 내용을 찾을 수 없음',
    schema: {
      example: {
        statusCode: 404,
        message: '세션 내용을 찾을 수 없습니다.',
        code: 'SESSION_CONTENT_NOT_FOUND',
        details: { contentId: 999 },
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
    description: '강사 또는 원장 권한이 부족함',
    schema: {
      example: {
        statusCode: 403,
        message: 'Forbidden resource',
      },
    },
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSessionContentDto: UpdateSessionContentDto,
  ) {
    return this.sessionContentService.update(id, updateSessionContentDto);
  }

  @Delete(':id')
  @Roles(Role.TEACHER, Role.PRINCIPAL)
  @ApiOperation({
    summary: '세션 내용 삭제',
    description: '강사 또는 원장 권한으로 특정 세션 내용을 삭제합니다.',
    operationId: 'remove',
  })
  @ApiParam({
    name: 'sessionId',
    description: '세션의 고유 ID',
    example: 1,
    type: 'integer',
  })
  @ApiParam({
    name: 'id',
    description: '삭제할 세션 내용의 고유 ID',
    example: 1,
    type: 'integer',
  })
  @ApiResponse({
    status: 200,
    description: '세션 내용 삭제 성공',
    schema: {
      example: {
        id: 1,
        sessionId: 1,
        poseId: 1,
        order: 0,
        notes: '기본 자세 연습',
      },
    },
  })
  @ApiNotFoundResponse({
    description: '세션 내용을 찾을 수 없음',
    schema: {
      example: {
        statusCode: 404,
        message: '세션 내용을 찾을 수 없습니다.',
        code: 'SESSION_CONTENT_NOT_FOUND',
        details: { contentId: 999 },
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
    description: '강사 또는 원장 권한이 부족함',
    schema: {
      example: {
        statusCode: 403,
        message: 'Forbidden resource',
      },
    },
  })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.sessionContentService.remove(id);
  }
}
