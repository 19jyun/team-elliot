import { ApiProperty } from '@nestjs/swagger';

class ReasonStats {
  @ApiProperty({ example: 4 })
  DISSATISFACTION: number;

  @ApiProperty({ example: 3 })
  UNUSED: number;

  @ApiProperty({ example: 2 })
  PRIVACY: number;

  @ApiProperty({ example: 1 })
  OTHER: number;
}

class RoleStats {
  @ApiProperty({ example: 5 })
  STUDENT: number;

  @ApiProperty({ example: 2 })
  TEACHER: number;
}

export class WithdrawalStatsDto {
  @ApiProperty({ example: 8, description: '전체 탈퇴 수' })
  total: number;

  @ApiProperty({ type: ReasonStats })
  byReason: ReasonStats;

  @ApiProperty({ type: RoleStats })
  byRole: RoleStats;
}
