import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from '../../../prisma/prisma.service';
import { AppModule } from '../../../app.module';
import * as request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { SchemaManager } from './schema-manager';

export class TestApp {
  app: INestApplication;
  prisma: PrismaService;
  jwtService: JwtService;
  private schemaManager: SchemaManager;
  private schema: string;

  async init() {
    this.schema = `test_worker_${process.env.JEST_WORKER_ID || '1'}`;
    this.schemaManager = new SchemaManager();

    // 스키마 생성은 하되, DATABASE_URL은 그대로 유지
    await this.schemaManager.createWorkerSchema(this.schema);

    console.log('TestApp Environment Variables:');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('DATABASE_URL:', process.env.DATABASE_URL);
    console.log('JWT_SECRET:', process.env.JWT_SECRET);
    console.log('WORKER_SCHEMA:', this.schema);

    // 스키마별 DATABASE_URL 생성
    const schemaUrl = this.schemaManager.getSchemaUrl(this.schema);

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test',
          load: [
            () => ({
              DATABASE_URL: schemaUrl,
              JWT_SECRET: process.env.JWT_SECRET,
              NODE_ENV: process.env.NODE_ENV,
              // Firebase 테스트용 더미 환경변수 (실제로는 사용되지 않지만 초기화 오류 방지)
              TYPE: process.env.TYPE || 'service_account',
              PROJECT_ID: process.env.PROJECT_ID || 'test-project-id',
              PRIVATE_KEY:
                process.env.PRIVATE_KEY ||
                '-----BEGIN PRIVATE KEY-----\nTEST_KEY\n-----END PRIVATE KEY-----\n',
              CLIENT_EMAIL:
                process.env.CLIENT_EMAIL ||
                'test@test-project-id.iam.gserviceaccount.com',
            }),
          ],
        }),
        AppModule,
      ],
    }).compile();

    this.app = moduleFixture.createNestApplication();

    this.prisma = moduleFixture.get<PrismaService>(PrismaService);
    if (!this.prisma) {
      throw new Error('PrismaService not found in module');
    }

    // 데이터베이스 연결 상태 확인
    try {
      await this.prisma.$connect();
      console.log('✅ Database connection established');
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      throw error;
    }

    this.jwtService = moduleFixture.get<JwtService>(JwtService);

    this.app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );

    // 테스트 환경에서 에러 로깅 활성화
    if (process.env.NODE_ENV === 'test') {
      this.app.use((err, req, res, next) => {
        console.error('Test Error:', err);
        next(err);
      });
    }

    await this.runMigrations();

    await this.app.init();
  }

  async cleanup() {
    if (!this.prisma) {
      console.log('Prisma service not initialized, skipping cleanup');
      return;
    }

    // 스키마별 격리를 위한 추가 대기
    await new Promise((resolve) => setTimeout(resolve, 50));

    try {
      // 테스트 데이터 정리 (외래키 의존성 순서대로 삭제)
      await this.prisma.$transaction([
        // 1. 가장 하위 레벨: 환불 요청 (SessionEnrollment, Student, User 참조)
        this.prisma.refundRequest.deleteMany(),

        // 2. 거절 상세 정보 (User 참조)
        this.prisma.rejectionDetail.deleteMany(),

        // 3. 결제 정보 (SessionEnrollment, Student 참조)
        this.prisma.payment.deleteMany(),

        // 4. 세션 수강신청 (ClassSession, Student 참조)
        this.prisma.sessionEnrollment.deleteMany(),

        // 5. 세션 내용 (ClassSession, BalletPose 참조)
        this.prisma.sessionContent.deleteMany(),

        // 6. 출석 정보 (SessionEnrollment, Class, Student 참조)
        this.prisma.attendance.deleteMany(),

        // 7. 공지사항 (User, Class 참조)
        this.prisma.notice.deleteMany(),

        // 8. 클래스 세션 (Class 참조)
        this.prisma.classSession.deleteMany(),

        // 9. 클래스 (Teacher, Academy, ClassDetail 참조)
        this.prisma.class.deleteMany(),

        // 10. 클래스 상세 정보 (Teacher 참조)
        this.prisma.classDetail.deleteMany(),

        // 11. 학생-학원 관계 (Student, Academy 참조)
        this.prisma.studentAcademy.deleteMany(),

        // 13. 학생 (User 참조)
        this.prisma.student.deleteMany(),

        // 14. 강사 (Academy 참조)
        this.prisma.teacher.deleteMany(),

        // 15. 원장 (Academy 참조)
        this.prisma.principal.deleteMany(),

        // 16. 탈퇴 이력 (독립적)
        this.prisma.withdrawalHistory.deleteMany(),

        // 17. 학원 (독립적)
        this.prisma.academy.deleteMany(),

        // 18. 사용자 (독립적, 마지막)
        this.prisma.user.deleteMany(),
      ]);
    } catch (error) {
      console.error(
        'Cleanup transaction failed, trying individual deletes:',
        error,
      );

      // 트랜잭션 실패 시 개별적으로 삭제 시도
      try {
        if (this.prisma) {
          await this.prisma.refundRequest.deleteMany();
          await this.prisma.rejectionDetail.deleteMany();
          await this.prisma.payment.deleteMany();
          await this.prisma.sessionEnrollment.deleteMany();
          await this.prisma.sessionContent.deleteMany();
          await this.prisma.attendance.deleteMany();
          await this.prisma.notice.deleteMany();
          await this.prisma.classSession.deleteMany();
          await this.prisma.class.deleteMany();
          await this.prisma.classDetail.deleteMany();
          await this.prisma.studentAcademy.deleteMany();
          await this.prisma.student.deleteMany();
          await this.prisma.teacher.deleteMany();
          await this.prisma.principal.deleteMany();
          await this.prisma.withdrawalHistory.deleteMany();
          await this.prisma.academy.deleteMany();
          await this.prisma.user.deleteMany();
        }
      } catch (individualError) {
        console.error('Individual cleanup also failed:', individualError);
        // 마지막 수단: 데이터베이스 연결 재설정
        if (this.prisma) {
          try {
            await this.prisma.$disconnect();
            await this.prisma.$connect();
          } catch (disconnectError) {
            console.error('Failed to reconnect to database:', disconnectError);
          }
        }
      }
    }
  }

  async close() {
    try {
      await this.cleanup();
    } catch (error) {
      console.error('Error during cleanup:', error);
    }

    try {
      if (this.app) {
        await this.app.close();
      }
    } catch (error) {
      console.error('Error closing app:', error);
    }

    try {
      if (this.prisma) {
        await this.prisma.$disconnect();
      }
    } catch (error) {
      console.error('Error disconnecting prisma:', error);
    }

    // 워커별 스키마 정리
    try {
      if (this.schemaManager && this.schema) {
        await this.schemaManager.dropWorkerSchema(this.schema);
        await this.schemaManager.cleanup();
      }
    } catch (error) {
      console.error('Error cleaning up schema:', error);
    }
  }

  // 인증 토큰 생성 헬퍼
  generateToken(userId: string, role: string) {
    return this.jwtService.sign({ sub: userId, role });
  }

  // API 요청 헬퍼
  request() {
    return request(this.app.getHttpServer());
  }

  // 인증된 요청 헬퍼
  authenticatedRequest(token?: string) {
    if (token) {
      return request(this.app.getHttpServer()).set(
        'Authorization',
        `Bearer ${token}`,
      );
    }
    return this.request();
  }

  // 마이그레이션 실행
  private async runMigrations(): Promise<void> {
    try {
      const childProcess = await import('child_process');

      // 환경 변수 설정
      const env = { ...process.env };
      env.DATABASE_URL = this.schemaManager.getSchemaUrl(this.schema);

      // 테스트 환경에서는 prisma db push를 사용 (마이그레이션 히스토리 없이 스키마 동기화)
      childProcess.execSync(
        'npx prisma db push --accept-data-loss --skip-generate',
        {
          stdio: 'inherit',
          env,
          cwd: process.cwd(),
        },
      );

      console.log(`✅ Schema synchronized: ${this.schema}`);
    } catch (error) {
      console.error(`❌ Failed to sync schema ${this.schema}:`, error);
      throw error;
    }
  }
}
