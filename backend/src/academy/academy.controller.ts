import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AcademyService } from './academy.service';
import { CreateAcademyDto, JoinAcademyDto, LeaveAcademyDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';

@ApiTags('학원 관리')
@Controller('academy')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AcademyController {
  constructor(private readonly academyService: AcademyService) {}

  // 관리자용 API
  @Post()
  @Roles('ADMIN')
  @ApiOperation({ summary: '학원 생성 (관리자)' })
  @ApiResponse({
    status: 201,
    description: '학원이 성공적으로 생성되었습니다.',
  })
  async createAcademy(@Body() dto: CreateAcademyDto) {
    return this.academyService.createAcademy(dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: '학원 삭제 (관리자)' })
  @ApiResponse({
    status: 200,
    description: '학원이 성공적으로 삭제되었습니다.',
  })
  async deleteAcademy(@Param('id', ParseIntPipe) id: number) {
    return this.academyService.deleteAcademy(id);
  }

  // 공통 API
  @Get()
  @ApiOperation({ summary: '학원 목록 조회' })
  @ApiResponse({ status: 200, description: '학원 목록을 반환합니다.' })
  async getAcademies() {
    return this.academyService.getAcademies();
  }

  @Get(':id')
  @ApiOperation({ summary: '학원 상세 조회' })
  @ApiResponse({ status: 200, description: '학원 상세 정보를 반환합니다.' })
  async getAcademyById(@Param('id', ParseIntPipe) id: number) {
    return this.academyService.getAcademyById(id);
  }

  // 학생용 API
  @Post('join')
  @Roles('STUDENT')
  @ApiOperation({ summary: '학원 가입 (학생)' })
  @ApiResponse({ status: 201, description: '학원 가입이 완료되었습니다.' })
  async joinAcademy(@GetUser() user: any, @Body() dto: JoinAcademyDto) {
    return this.academyService.joinAcademy(user.id, dto);
  }

  @Post('leave')
  @Roles('STUDENT')
  @ApiOperation({ summary: '학원 탈퇴 (학생)' })
  @ApiResponse({ status: 200, description: '학원 탈퇴가 완료되었습니다.' })
  async leaveAcademy(@GetUser() user: any, @Body() dto: LeaveAcademyDto) {
    return this.academyService.leaveAcademy(user.id, dto);
  }

  @Get('my/list')
  @Roles('STUDENT')
  @ApiOperation({ summary: '내가 가입한 학원 목록 (학생)' })
  @ApiResponse({ status: 200, description: '가입한 학원 목록을 반환합니다.' })
  async getMyAcademies(@GetUser() user: any) {
    return this.academyService.getMyAcademies(user.id);
  }
}
