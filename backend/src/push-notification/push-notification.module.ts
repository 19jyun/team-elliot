import { Module } from '@nestjs/common';
import { PushNotificationService } from './push-notification.service';
import { DeviceModule } from '../device/device.module';
import { FirebaseModule } from '../firebase/firebase.module';

@Module({
  imports: [DeviceModule, FirebaseModule],
  providers: [PushNotificationService],
  exports: [PushNotificationService],
})
export class PushNotificationModule {}
