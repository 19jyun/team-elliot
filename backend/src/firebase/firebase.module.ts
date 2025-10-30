import { Module, DynamicModule, Global } from '@nestjs/common';
import { FirebaseService } from './firebase.service';
import * as admin from 'firebase-admin';
import * as path from 'path';

@Global()
@Module({})
export class FirebaseModule {
  static forRoot(): DynamicModule {
    const serviceAccountPath =
      process.env.FIREBASE_SERVICE_ACCOUNT_PATH ||
      path.join(__dirname, '../../config/firebase-service-account.json');

    let app: admin.app.App;

    try {
      const serviceAccount = require(serviceAccountPath);
      app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log('✅ Firebase Admin SDK 초기화 성공');
    } catch (error) {
      console.error('❌ Firebase 초기화 실패:', error);
      console.error(`⚠️  Service Account 경로: ${serviceAccountPath}`);
      console.error(
        '⚠️  환경변수 FIREBASE_SERVICE_ACCOUNT_PATH를 설정하거나 config/firebase-service-account.json 파일을 준비해주세요.',
      );
      throw error;
    }

    return {
      module: FirebaseModule,
      providers: [
        {
          provide: 'FIREBASE_ADMIN',
          useValue: app,
        },
        FirebaseService,
      ],
      exports: [FirebaseService],
    };
  }
}
