import { IsString, IsOptional, MaxLength, Matches } from 'class-validator';

export class UpdateRefundAccountDto {
  @IsOptional()
  @IsString({ message: '예금주는 문자열이어야 합니다.' })
  @MaxLength(50, { message: '예금주는 50자 이하여야 합니다.' })
  @Matches(/^[가-힣a-zA-Z\s]+$/, {
    message: '예금주는 한글, 영문, 공백만 사용 가능합니다.',
  })
  refundAccountHolder?: string;

  @IsOptional()
  @IsString({ message: '계좌번호는 문자열이어야 합니다.' })
  @MaxLength(20, { message: '계좌번호는 20자 이하여야 합니다.' })
  @Matches(/^[0-9-]+$/, {
    message: '계좌번호는 숫자와 하이픈(-)만 사용 가능합니다.',
  })
  refundAccountNumber?: string;

  @IsOptional()
  @IsString({ message: '은행명은 문자열이어야 합니다.' })
  @MaxLength(50, { message: '은행명은 50자 이하여야 합니다.' })
  @Matches(/^[가-힣a-zA-Z\s]+$/, {
    message: '은행명은 한글, 영문, 공백만 사용 가능합니다.',
  })
  refundBankName?: string;
}
