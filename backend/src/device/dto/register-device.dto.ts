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
