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

    await this.schemaManager.createWorkerSchema(this.schema);

    const schemaUrl = this.schemaManager.getSchemaUrl(this.schema);
    process.env.DATABASE_URL = schemaUrl;

    console.log('TestApp Environment Variables:');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('DATABASE_URL:', process.env.DATABASE_URL);
    console.log('JWT_SECRET:', process.env.JWT_SECRET);
    console.log('WORKER_SCHEMA:', this.schema);

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test',
        }),
        AppModule,
      ],
    }).compile();

    this.app = moduleFixture.createNestApplication();

    this.prisma = moduleFixture.get<PrismaService>(PrismaService);
    if (!this.prisma) {
      throw new Error('PrismaService not found in module');
    }

    this.jwtService = moduleFixture.get<JwtService>(JwtService);

    this.app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );

    await this.runMigrations();

    await this.app.init();
  }

  async cleanup() {
    if (!this.prisma) {
      console.log('Prisma service not initialized, skipping cleanup');
      return;
    }

    try {
      // 테스트 데이터 정리 (외래키 의존성 순서대로 삭제)
      await this.prisma.$transaction([
        // 1. 가장 하위 레벨: 환불 요청 (SessionEnrollment, Student, User 참조)
        this.prisma.refundRequest.deleteMany(),

        // 2. 거절 상세 정보 (User 참조)
        this.prisma.rejectionDetail.deleteMany(),

        // 3. 결제 정보 (SessionEnrollment, Student, Enrollment 참조)
        this.prisma.payment.deleteMany(),

        // 4. 세션 수강신청 (ClassSession, Student 참조)
        this.prisma.sessionEnrollment.deleteMany(),

        // 5. 세션 내용 (ClassSession, BalletPose 참조)
        this.prisma.sessionContent.deleteMany(),

        // 6. 출석 정보 (Enrollment, Class, Student 참조)
        this.prisma.attendance.deleteMany(),

        // 7. 수강신청 (Class, Student 참조)
        this.prisma.enrollment.deleteMany(),

        // 8. 공지사항 (User, Class 참조)
        this.prisma.notice.deleteMany(),

        // 9. 클래스 세션 (Class 참조)
        this.prisma.classSession.deleteMany(),

        // 10. 클래스 (Teacher, Academy, ClassDetail 참조)
        this.prisma.class.deleteMany(),

        // 11. 클래스 상세 정보 (Teacher 참조)
        this.prisma.classDetail.deleteMany(),

        // 12. 학원 가입 신청 (Teacher, Academy 참조)
        this.prisma.academyJoinRequest.deleteMany(),

        // 13. 학원 생성 신청 (Teacher 참조)
        this.prisma.academyCreationRequest.deleteMany(),

        // 14. 학생-학원 관계 (Student, Academy 참조)
        this.prisma.studentAcademy.deleteMany(),

        // 15. 학생 (User 참조)
        this.prisma.student.deleteMany(),

        // 16. 강사 (Academy 참조)
        this.prisma.teacher.deleteMany(),

        // 17. 원장 (Academy 참조)
        this.prisma.principal.deleteMany(),

        // 18. 탈퇴 이력 (독립적)
        this.prisma.withdrawalHistory.deleteMany(),

        // 19. 학원 (독립적)
        this.prisma.academy.deleteMany(),

        // 20. 사용자 (독립적, 마지막)
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
          await this.prisma.enrollment.deleteMany();
          await this.prisma.notice.deleteMany();
          await this.prisma.classSession.deleteMany();
          await this.prisma.class.deleteMany();
          await this.prisma.classDetail.deleteMany();
          await this.prisma.academyJoinRequest.deleteMany();
          await this.prisma.academyCreationRequest.deleteMany();
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
      const { execSync } = require('child_process');

      // 환경 변수 설정
      const env = { ...process.env };
      env.DATABASE_URL = this.schemaManager.getSchemaUrl(this.schema);

      // Prisma migrate 실행
      execSync('npx prisma migrate deploy', {
        stdio: 'inherit',
        env,
        cwd: process.cwd(),
      });

      console.log(`✅ Migrations applied to schema: ${this.schema}`);
    } catch (error) {
      console.error(
        `❌ Failed to run migrations for schema ${this.schema}:`,
        error,
      );
      throw error;
    }
  }
}
