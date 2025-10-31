import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsIn } from 'class-validator';

export class RegisterDeviceDto {
  @ApiProperty({
    example: 'fcm-token-abc123...',
    description: 'FCM 토큰',
  })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({
    example: 'ios',
    description: '플랫폼 (ios 또는 android)',
    enum: ['ios', 'android'],
  })
  @IsString()
  @IsIn(['ios', 'android'])
  platform: 'ios' | 'android';
}

export class UnregisterDeviceDto {
  @ApiProperty({
    example: 'fcm-token-abc123...',
    description: '해제할 FCM 토큰',
  })
  @IsString()
  @IsNotEmpty()
  token: string;
}

export class DeviceTokenResponseDto {
  @ApiProperty({ example: 1, description: '디바이스 토큰 ID' })
  id: number;

  @ApiProperty({ example: 1, description: '사용자 ID' })
  userId: number;

  @ApiProperty({
    example: 'fcm-token-abc123...',
    description: 'FCM/APNS 토큰',
  })
  token: string;

  @ApiProperty({ example: 'android', description: '플랫폼' })
  platform: string;

  @ApiProperty({ example: true, description: '활성화 상태' })
  isActive: boolean;

  @ApiProperty({
    example: '2025-10-31T12:00:00.000Z',
    description: '생성 일시 (ISO 8601 문자열)',
  })
  createdAt: string;

  @ApiProperty({
    example: '2025-10-31T12:00:00.000Z',
    description: '수정 일시 (ISO 8601 문자열)',
  })
  updatedAt: string;
}

export class DeviceOperationResponseDto {
  @ApiProperty({ example: true, description: '작업 성공 여부' })
  success: boolean;

  @ApiProperty({ example: 1, description: '영향받은 레코드 수' })
  count: number;

  @ApiProperty({
    example: '디바이스 토큰이 비활성화되었습니다',
    description: '작업 메시지',
  })
  message: string;
}
