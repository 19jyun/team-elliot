import { Module } from '@nestjs/common';
import { TeacherController } from './teacher.controller';
import { TeacherService } from './teacher.service';
import { ClassModule } from '../class/class.module';
import { AcademyModule } from '../academy/academy.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [ClassModule, AcademyModule, PrismaModule],
  controllers: [TeacherController],
  providers: [TeacherService],
  exports: [TeacherService],
})
export class TeacherModule {}
