import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({ example: 'new_secure_password', description: '새 비밀번호' })
  @IsString()
  newPassword: string;
}
