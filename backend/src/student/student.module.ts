import { Module } from '@nestjs/common';
import { StudentController } from './student.controller';
import { StudentService } from './student.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ClassModule } from '../class/class.module';
import { AcademyModule } from '../academy/academy.module';

@Module({
  imports: [PrismaModule, ClassModule, AcademyModule],
  controllers: [StudentController],
  providers: [StudentService],
  exports: [StudentService],
})
export class StudentModule {}
