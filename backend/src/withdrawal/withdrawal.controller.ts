import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { WithdrawalService } from './withdrawal.service';
import { WithdrawalDto } from './dto/withdrawal.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('Withdrawal')
@Controller('withdrawal')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class WithdrawalController {
  constructor(private readonly withdrawalService: WithdrawalService) {}

  /**
   * 회원 탈퇴
   */
  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '회원 탈퇴' })
  @ApiResponse({
    status: 200,
    description: '회원 탈퇴 성공',
    schema: {
      example: {
        message: '회원 탈퇴가 완료되었습니다.',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: '사용자를 찾을 수 없습니다.',
  })
  async withdraw(@CurrentUser() user: any, @Body() dto: WithdrawalDto) {
    await this.withdrawalService.withdrawStudent(user.id, dto.reason);
    return {
      message: '회원 탈퇴가 완료되었습니다.',
    };
  }
}
