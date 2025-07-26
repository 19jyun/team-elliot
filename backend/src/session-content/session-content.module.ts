import { Module } from '@nestjs/common';
import { SessionContentController } from './session-content.controller';
import { SessionContentService } from './session-content.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SessionContentController],
  providers: [SessionContentService],
  exports: [SessionContentService],
})
export class SessionContentModule {}
