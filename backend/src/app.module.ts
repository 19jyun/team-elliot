import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { PrismaService } from './prisma/prisma.service';
import { AdminModule } from './admin/admin.module';
import { TeacherModule } from './teacher/teacher.module';
import { ClassModule } from './class/class.module';
import { ClassSessionModule } from './class-session/class-session.module';
import { AcademyModule } from './academy/academy.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { StudentModule } from './student/student.module';
import { SmsModule } from './sms/sms.module';

import { RefundModule } from './refund/refund.module';
import { BalletPoseModule } from './ballet-pose/ballet-pose.module';
import { SessionContentModule } from './session-content/session-content.module';
import { PrincipalModule } from './principal/principal.module';
import { SocketModule } from './socket/socket.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    AuthModule,
    AdminModule,
    TeacherModule,
    ClassModule,
    ClassSessionModule,
    AcademyModule,
    StudentModule,
    SmsModule,

    RefundModule,
    BalletPoseModule,
    SessionContentModule,
    PrincipalModule,
    SocketModule,
  ],
  providers: [PrismaService],
})
export class AppModule {}
