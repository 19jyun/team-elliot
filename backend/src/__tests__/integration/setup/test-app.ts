import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from '../../../prisma/prisma.service';
import { AppModule } from '../../../app.module';
import * as request from 'supertest';
import { JwtService } from '@nestjs/jwt';

export class TestApp {
  app: INestApplication;
  prisma: PrismaService;
  jwtService: JwtService;

  async init() {
    // 환경변수는 test-setup.ts에서 이미 설정됨
    console.log('TestApp Environment Variables:');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('DATABASE_URL:', process.env.DATABASE_URL);
    console.log('JWT_SECRET:', process.env.JWT_SECRET);

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
    this.jwtService = moduleFixture.get<JwtService>(JwtService);

    this.app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );

    await this.app.init();
  }

  async cleanup() {
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
  }

  async close() {
    await this.cleanup();
    await this.app.close();
    await this.prisma.$disconnect();
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
}
