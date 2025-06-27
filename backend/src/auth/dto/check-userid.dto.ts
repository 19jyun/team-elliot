import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CheckUserIdDto {
  @ApiProperty({ example: 'student001' })
  @IsString()
  userId: string;
}
