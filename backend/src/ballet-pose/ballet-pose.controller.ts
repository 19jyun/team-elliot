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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { BalletPoseService } from './ballet-pose.service';
import { CreateBalletPoseDto } from './dto/create-ballet-pose.dto';
import { UpdateBalletPoseDto } from './dto/update-ballet-pose.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('BalletPose')
@Controller('ballet-poses')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BalletPoseController {
  constructor(private readonly balletPoseService: BalletPoseService) {}

  @Get()
  @ApiOperation({ summary: '발레 자세 목록 조회' })
  @ApiResponse({ status: 200, description: '발레 자세 목록 조회 성공' })
  async findAll(@Query('difficulty') difficulty?: string) {
    if (difficulty) {
      return this.balletPoseService.findByDifficulty(difficulty);
    }
    return this.balletPoseService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: '발레 자세 상세 조회' })
  @ApiResponse({ status: 200, description: '발레 자세 상세 조회 성공' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.balletPoseService.findOne(id);
  }

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '발레 자세 생성' })
  @ApiResponse({ status: 201, description: '발레 자세 생성 성공' })
  async create(@Body() createBalletPoseDto: CreateBalletPoseDto) {
    return this.balletPoseService.create(createBalletPoseDto);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '발레 자세 수정' })
  @ApiResponse({ status: 200, description: '발레 자세 수정 성공' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBalletPoseDto: UpdateBalletPoseDto,
  ) {
    return this.balletPoseService.update(id, updateBalletPoseDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '발레 자세 삭제' })
  @ApiResponse({ status: 200, description: '발레 자세 삭제 성공' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.balletPoseService.remove(id);
  }
}
