import { Module } from '@nestjs/common';
import { ActivityLogService } from './activity-log.service';
import { ActivityLogQueryService } from './activity-log-query.service';
import { ActivityLogController } from './activity-log.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ActivityLogController],
  providers: [ActivityLogService, ActivityLogQueryService],
  exports: [ActivityLogService, ActivityLogQueryService],
})
export class ActivityLogModule {}
