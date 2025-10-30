import { Controller, Post, Delete, Body, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { DeviceService } from './device.service';
import {
  RegisterDeviceDto,
  UnregisterDeviceDto,
} from './dto/register-device.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '@prisma/client';

@ApiTags('devices')
@Controller('devices')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DeviceController {
  constructor(private deviceService: DeviceService) {}

  @Post('register')
  @ApiOperation({ summary: '디바이스 토큰 등록' })
  @ApiResponse({
    status: 201,
    description: '디바이스 토큰이 성공적으로 등록되었습니다.',
  })
  @ApiResponse({ status: 401, description: '인증되지 않은 사용자입니다.' })
  async registerDevice(
    @CurrentUser() user: User,
    @Body() dto: RegisterDeviceDto,
  ) {
    return this.deviceService.saveToken(user.id, dto.token, dto.platform);
  }

  @Delete('unregister')
  @ApiOperation({ summary: '디바이스 토큰 해제' })
  @ApiResponse({
    status: 200,
    description: '디바이스 토큰이 성공적으로 해제되었습니다.',
  })
  @ApiResponse({ status: 401, description: '인증되지 않은 사용자입니다.' })
  async unregisterDevice(
    @CurrentUser() user: User,
    @Body() dto: UnregisterDeviceDto,
  ) {
    return this.deviceService.removeToken(user.id, dto.token);
  }
}
