import { ApiProperty } from '@nestjs/swagger';

export class CheckUserIdResponseEntity {
  @ApiProperty({ example: true, description: '사용 가능한지 여부' })
  available: boolean;
}
