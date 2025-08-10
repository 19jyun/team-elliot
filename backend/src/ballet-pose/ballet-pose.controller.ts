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
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
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
  @Roles(Role.PRINCIPAL)
  @UseInterceptors(FileInterceptor('image', balletPoseConfig))
  @ApiOperation({ summary: '발레 자세 생성' })
  @ApiResponse({ status: 201, description: '발레 자세 생성 성공' })
  async create(
    @Body() createBalletPoseDto: CreateBalletPoseDto,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    return this.balletPoseService.create(createBalletPoseDto, image);
  }

  @Patch(':id')
  @Roles(Role.PRINCIPAL)
  @UseInterceptors(FileInterceptor('image', balletPoseConfig))
  @ApiOperation({ summary: '발레 자세 수정' })
  @ApiResponse({ status: 200, description: '발레 자세 수정 성공' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBalletPoseDto: UpdateBalletPoseDto,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    return this.balletPoseService.update(id, updateBalletPoseDto, image);
  }

  @Delete(':id')
  @Roles(Role.PRINCIPAL)
  @ApiOperation({ summary: '발레 자세 삭제' })
  @ApiResponse({ status: 200, description: '발레 자세 삭제 성공' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.balletPoseService.remove(id);
  }
}
