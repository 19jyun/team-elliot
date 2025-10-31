import { Module } from '@nestjs/common';
import { RefundController } from './refund.controller';
import { RefundService } from './refund.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ClassSessionModule } from '../class-session/class-session.module';
import { SocketModule } from '../socket/socket.module';
import { PushNotificationModule } from '../push-notification/push-notification.module';

@Module({
  imports: [
    PrismaModule,
    ClassSessionModule,
    SocketModule,
    PushNotificationModule,
  ],
  controllers: [RefundController],
  providers: [RefundService],
  exports: [RefundService],
})
export class RefundModule {}
