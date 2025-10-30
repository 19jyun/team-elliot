import { Module } from '@nestjs/common';
import { ClassSessionController } from './class-session.controller';
import { ClassSessionService } from './class-session.service';
import { PrismaModule } from '../prisma/prisma.module';
import { SocketModule } from '../socket/socket.module';
import { PushNotificationModule } from '../push-notification/push-notification.module';

@Module({
  imports: [PrismaModule, SocketModule, PushNotificationModule],
  controllers: [ClassSessionController],
  providers: [ClassSessionService],
  exports: [ClassSessionService],
})
export class ClassSessionModule {}
