import { IsString, IsNotEmpty } from 'class-validator';

export class JoinAcademyDto {
  @IsString()
  @IsNotEmpty()
  code: string; // 학원 고유 코드
}
