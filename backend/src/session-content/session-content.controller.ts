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
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
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
export class SessionContentController {
  constructor(private readonly sessionContentService: SessionContentService) {}

  @Get()
  @ApiOperation({ summary: '세션 내용 목록 조회' })
  @ApiResponse({ status: 200, description: '세션 내용 목록 조회 성공' })
  async findBySessionId(@Param('sessionId', ParseIntPipe) sessionId: number) {
    return this.sessionContentService.findBySessionId(sessionId);
  }

  @Get(':id')
  @ApiOperation({ summary: '세션 내용 상세 조회' })
  @ApiResponse({ status: 200, description: '세션 내용 상세 조회 성공' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.sessionContentService.findOne(id);
  }

  @Post()
  @Roles(Role.TEACHER, Role.ADMIN)
  @ApiOperation({ summary: '세션 내용 추가' })
  @ApiResponse({ status: 201, description: '세션 내용 추가 성공' })
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
  @Roles(Role.TEACHER, Role.ADMIN)
  @ApiOperation({ summary: '세션 내용 순서 변경' })
  @ApiResponse({ status: 200, description: '세션 내용 순서 변경 성공' })
  async reorder(
    @Param('sessionId', ParseIntPipe) sessionId: number,
    @Body() reorderDto: ReorderSessionContentsDto,
  ) {
    return this.sessionContentService.reorder(sessionId, reorderDto);
  }

  @Patch(':id')
  @Roles(Role.TEACHER, Role.ADMIN)
  @ApiOperation({ summary: '세션 내용 수정' })
  @ApiResponse({ status: 200, description: '세션 내용 수정 성공' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSessionContentDto: UpdateSessionContentDto,
  ) {
    return this.sessionContentService.update(id, updateSessionContentDto);
  }

  @Delete(':id')
  @Roles(Role.TEACHER, Role.ADMIN)
  @ApiOperation({ summary: '세션 내용 삭제' })
  @ApiResponse({ status: 200, description: '세션 내용 삭제 성공' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.sessionContentService.remove(id);
  }
}
