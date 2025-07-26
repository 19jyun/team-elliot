import { PartialType } from '@nestjs/swagger';
import { CreateBalletPoseDto } from './create-ballet-pose.dto';

export class UpdateBalletPoseDto extends PartialType(CreateBalletPoseDto) {}
