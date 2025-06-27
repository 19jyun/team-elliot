import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'student001' })
  @IsString()
  userId: string;

  @ApiProperty({ example: 'securePassword123' })
  @IsString()
  password: string;
}
