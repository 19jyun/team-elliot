import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Query,
} from '@nestjs/common';
import { StudentService } from './student.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('student')
@UseGuards(JwtAuthGuard)
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Get('classes')
  async getMyClasses(@CurrentUser() user: any) {
    return this.studentService.getStudentClasses(user.id);
  }

  @Get('classes/:id')
  async getClassDetail(@Param('id') id: string) {
    return this.studentService.getClassDetail(Number(id));
  }

  @Post('classes/:id/enroll')
  async enrollClass(@Param('id') classId: string, @CurrentUser() user: any) {
    return this.studentService.enrollClass(Number(classId), user.id);
  }

  @Delete('classes/:id/enroll')
  async unenrollClass(@Param('id') classId: string, @CurrentUser() user: any) {
    return this.studentService.unenrollClass(Number(classId), user.id);
  }

  @Get('profile')
  async getMyProfile(@CurrentUser() user: any) {
    return this.studentService.getMyProfile(user.id);
  }

  @Put('profile')
  async updateMyProfile(
    @CurrentUser() user: any,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.studentService.updateMyProfile(user.id, updateProfileDto);
  }

  @Get('enrollment-history')
  async getEnrollmentHistory(@CurrentUser() user: any) {
    return this.studentService.getEnrollmentHistory(user.id);
  }

  @Get('cancellation-history')
  async getCancellationHistory(@CurrentUser() user: any) {
    return this.studentService.getCancellationHistory(user.id);
  }
}
