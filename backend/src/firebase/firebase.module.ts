import { Module, DynamicModule, Global } from '@nestjs/common';
import { FirebaseService } from './firebase.service';
import * as admin from 'firebase-admin';
import * as path from 'path';
import * as fs from 'fs';

@Global()
@Module({})
export class FirebaseModule {
  static forRoot(): DynamicModule {
    let serviceAccount: any;
    let app: admin.app.App;

    try {
      // 방법 1: 개별 환경변수로 구성 (우선순위 최상위)
      if (
        process.env.TYPE &&
        process.env.PROJECT_ID &&
        process.env.PRIVATE_KEY &&
        process.env.CLIENT_EMAIL
      ) {
        serviceAccount = {
          type: process.env.TYPE,
          projectId: process.env.PROJECT_ID,
          privateKeyId: process.env.PRIVATE_KEY_ID || undefined,
          privateKey: process.env.PRIVATE_KEY.replace(/\\n/g, '\n'),
          clientEmail: process.env.CLIENT_EMAIL,
          clientId: process.env.CLIENT_ID || undefined,
          authUri:
            process.env.AUTH_URI || 'https://accounts.google.com/o/oauth2/auth',
          tokenUri:
            process.env.TOKEN_URI || 'https://oauth2.googleapis.com/token',
          authProviderX509CertUrl:
            process.env.AUTH_PROVIDER_X509_CERT_URL ||
            'https://www.googleapis.com/oauth2/v1/certs',
          clientX509CertUrl: process.env.CLIENT_X509_CERT_URL || undefined,
          universeDomain: process.env.UNIVERSE_DOMAIN || 'googleapis.com',
        };
        console.log('✅ Firebase Service Account를 환경변수에서 로드했습니다');
      }
      // 방법 2: 환경변수로 파일 경로 지정
      else if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
        const serviceAccountPath = path.resolve(
          process.env.FIREBASE_SERVICE_ACCOUNT_PATH,
        );

        if (!fs.existsSync(serviceAccountPath)) {
          throw new Error(
            `Firebase Service Account 파일을 찾을 수 없습니다: ${serviceAccountPath}`,
          );
        }

        const jsonContent = JSON.parse(
          fs.readFileSync(serviceAccountPath, 'utf8'),
        );

        // JSON 파일은 snake_case이므로 camelCase로 변환
        serviceAccount = {
          type: jsonContent.type,
          projectId: jsonContent.project_id,
          privateKeyId: jsonContent.private_key_id,
          privateKey: jsonContent.private_key,
          clientEmail: jsonContent.client_email,
          clientId: jsonContent.client_id,
          authUri: jsonContent.auth_uri,
          tokenUri: jsonContent.token_uri,
          authProviderX509CertUrl: jsonContent.auth_provider_x509_cert_url,
          clientX509CertUrl: jsonContent.client_x509_cert_url,
          universeDomain: jsonContent.universe_domain,
        };

        console.log(
          `✅ Firebase Service Account를 파일에서 로드했습니다: ${serviceAccountPath}`,
        );
      }
      // 방법 3: 기본 경로 (로컬 개발용)
      else {
        const defaultServiceAccountPath = path.resolve(
          process.cwd(),
          'config/firebase-service-account.json',
        );

        if (!fs.existsSync(defaultServiceAccountPath)) {
          throw new Error(
            `Firebase Service Account를 찾을 수 없습니다.\n` +
              `다음 중 하나의 방법을 사용하세요:\n` +
              `1. 환경변수로 개별 필드 설정 (TYPE, PROJECT_ID, PRIVATE_KEY, CLIENT_EMAIL 등)\n` +
              `2. 환경변수 FIREBASE_SERVICE_ACCOUNT_PATH로 파일 경로 지정\n` +
              `3. config/firebase-service-account.json 파일 생성`,
          );
        }

        const jsonContent = JSON.parse(
          fs.readFileSync(defaultServiceAccountPath, 'utf8'),
        );

        // JSON 파일은 snake_case이므로 camelCase로 변환
        serviceAccount = {
          type: jsonContent.type,
          projectId: jsonContent.project_id,
          privateKeyId: jsonContent.private_key_id,
          privateKey: jsonContent.private_key,
          clientEmail: jsonContent.client_email,
          clientId: jsonContent.client_id,
          authUri: jsonContent.auth_uri,
          tokenUri: jsonContent.token_uri,
          authProviderX509CertUrl: jsonContent.auth_provider_x509_cert_url,
          clientX509CertUrl: jsonContent.client_x509_cert_url,
          universeDomain: jsonContent.universe_domain,
        };

        console.log(
          `✅ Firebase Service Account를 기본 경로에서 로드했습니다: ${defaultServiceAccountPath}`,
        );
      }

      // Firebase Admin SDK 초기화
      app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log('✅ Firebase Admin SDK 초기화 성공');
    } catch (error) {
      console.error('❌ Firebase 초기화 실패:', error);
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
