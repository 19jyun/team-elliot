import { Module } from '@nestjs/common';
import { PrincipalController } from './principal.controller';
import { PrincipalService } from './principal.service';
import { PrismaModule } from '../prisma/prisma.module';
import { SocketModule } from '../socket/socket.module';
import { ClassModule } from '../class/class.module';
import { ClassSessionModule } from '../class-session/class-session.module';
import { RefundModule } from '../refund/refund.module';
import { TeacherModule } from '../teacher/teacher.module';
import { StudentModule } from '../student/student.module';

@Module({
  imports: [
    PrismaModule,
    SocketModule,
    ClassModule,
    ClassSessionModule,
    RefundModule,
    TeacherModule,
    StudentModule,
  ],
  controllers: [PrincipalController],
  providers: [PrincipalService],
  exports: [PrincipalService],
})
export class PrincipalModule {}
