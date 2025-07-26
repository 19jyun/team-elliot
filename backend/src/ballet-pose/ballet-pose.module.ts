import { Module } from '@nestjs/common';
import { BalletPoseController } from './ballet-pose.controller';
import { BalletPoseService } from './ballet-pose.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [BalletPoseController],
  providers: [BalletPoseService],
  exports: [BalletPoseService],
})
export class BalletPoseModule {}
