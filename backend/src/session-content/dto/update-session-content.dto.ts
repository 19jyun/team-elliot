import { PartialType } from '@nestjs/swagger';
import { CreateSessionContentDto } from './create-session-content.dto';

export class UpdateSessionContentDto extends PartialType(
  CreateSessionContentDto,
) {}
