import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { Logger } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';
import { SocketService } from './socket.service';
import { SocketTargetResolver } from './resolvers/socket-target.resolver';
import { ClassSocketManager } from './managers/class-socket.manager';
import { EnrollmentSocketManager } from './managers/enrollment-socket.manager';
import { UniversalSocketManager } from './managers/universal-socket.manager';
import { AcademySocketManager } from './managers/academy-socket.manager';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
    PrismaModule,
  ],
  providers: [
    Logger,
    SocketGateway,
    SocketService,
    SocketTargetResolver,
    ClassSocketManager,
    EnrollmentSocketManager,
    UniversalSocketManager,
    AcademySocketManager,
  ],
  exports: [
    SocketGateway,
    SocketService,
    ClassSocketManager,
    EnrollmentSocketManager,
    UniversalSocketManager,
    AcademySocketManager,
  ],
})
export class SocketModule {}
