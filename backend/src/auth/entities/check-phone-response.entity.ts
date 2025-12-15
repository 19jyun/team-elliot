import { ApiProperty } from '@nestjs/swagger';

export class CheckPhoneResponseEntity {
  @ApiProperty({ example: true, description: '사용 가능 여부' })
  available: boolean;
}
