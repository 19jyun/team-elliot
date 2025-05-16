import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { TeacherService } from './teacher.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { multerConfig } from '../config/multer.config';
import { Role } from '@prisma/client';

@Controller('teachers')
@UseGuards(RolesGuard)
export class TeacherController {
  constructor(private readonly teacherService: TeacherService) {}

  @Get(':id')
  async getTeacherProfile(@Param('id', ParseIntPipe) id: number) {
    return this.teacherService.getTeacherProfile(id);
  }

  @Put(':id/profile')
  @Roles(Role.TEACHER)
  @UseInterceptors(FileInterceptor('photo', multerConfig))
  async updateProfile(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateData: { introduction?: string },
    @UploadedFile() photo?: Express.Multer.File,
  ) {
    return this.teacherService.updateProfile(id, updateData, photo);
  }

  @Get(':id/classes')
  @Roles(Role.TEACHER, Role.ADMIN)
  async getTeacherClasses(@Param('id', ParseIntPipe) id: number) {
    return this.teacherService.getTeacherClasses(id);
  }
}
