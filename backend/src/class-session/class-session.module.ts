import { Module } from '@nestjs/common';
import { ClassSessionController } from './class-session.controller';
import { ClassSessionService } from './class-session.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ClassSessionController],
  providers: [ClassSessionService],
  exports: [ClassSessionService],
})
export class ClassSessionModule {}
