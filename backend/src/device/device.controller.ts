import {
  Controller,
  Post,
  Patch,
  Delete,
  Body,
  UseGuards,
} from '@nestjs/common';
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
  DeviceTokenResponseDto,
  DeviceOperationResponseDto,
} from './dto/register-device.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/auth.types';

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
    type: DeviceTokenResponseDto,
  })
  @ApiResponse({ status: 401, description: '인증되지 않은 사용자입니다.' })
  async registerDevice(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: RegisterDeviceDto,
  ): Promise<DeviceTokenResponseDto> {
    return this.deviceService.saveToken(
      parseInt(user.id),
      dto.token,
      dto.platform,
    );
  }

  @Patch('deactivate')
  @ApiOperation({ summary: '디바이스 토큰 비활성화 (토글 OFF)' })
  @ApiResponse({
    status: 200,
    description: '디바이스 토큰이 비활성화되었습니다.',
    type: DeviceOperationResponseDto,
  })
  @ApiResponse({ status: 401, description: '인증되지 않은 사용자입니다.' })
  async deactivateDevice(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UnregisterDeviceDto,
  ): Promise<DeviceOperationResponseDto> {
    return this.deviceService.deactivateToken(parseInt(user.id), dto.token);
  }

  @Delete('unregister')
  @ApiOperation({ summary: '디바이스 토큰 완전 삭제 (로그아웃)' })
  @ApiResponse({
    status: 200,
    description: '디바이스 토큰이 완전히 삭제되었습니다.',
    type: DeviceOperationResponseDto,
  })
  @ApiResponse({ status: 401, description: '인증되지 않은 사용자입니다.' })
  async unregisterDevice(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UnregisterDeviceDto,
  ): Promise<DeviceOperationResponseDto> {
    return this.deviceService.deleteToken(parseInt(user.id), dto.token);
  }
}
