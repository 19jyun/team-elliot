import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../app.module';
import { PrismaService } from '../../prisma/prisma.service';

describe('BankingController (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let authToken: string;

  const testTeacher = {
    userId: 'testteacher',
    password: 'password123',
    name: '테스트강사',
    phoneNumber: '010-1234-5678',
  };

  const testBankAccount = {
    bankName: '신한은행',
    accountNumber: '123-456-789012',
    accountHolder: '테스트강사',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prismaService = moduleFixture.get<PrismaService>(PrismaService);
    await app.init();

    // 테스트 데이터 생성
    await prismaService.teacher.create({
      data: testTeacher,
    });

    // 로그인하여 토큰 획득
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        userId: testTeacher.userId,
        password: testTeacher.password,
      });

    authToken = loginResponse.body.accessToken;
  });

  afterAll(async () => {
    // 테스트 데이터 정리
    await prismaService.bankAccount.deleteMany({
      where: { teacherId: 1 },
    });
    await prismaService.teacher.deleteMany({
      where: { userId: testTeacher.userId },
    });
    await app.close();
  });

  describe('/banking/teacher/:teacherId/bank-account (GET)', () => {
    it('should return 404 when teacher has no bank account', () => {
      return request(app.getHttpServer())
        .get('/banking/teacher/1/bank-account')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should return bank account when it exists', async () => {
      // 먼저 계좌 생성
      await prismaService.bankAccount.create({
        data: {
          ...testBankAccount,
          teacherId: 1,
        },
      });

      return request(app.getHttpServer())
        .get('/banking/teacher/1/bank-account')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('bankName', testBankAccount.bankName);
          expect(res.body).toHaveProperty(
            'accountNumber',
            testBankAccount.accountNumber,
          );
          expect(res.body).toHaveProperty(
            'accountHolder',
            testBankAccount.accountHolder,
          );
        });
    });
  });

  describe('/banking/teacher/:teacherId (GET)', () => {
    it('should return teacher with bank account information', () => {
      return request(app.getHttpServer())
        .get('/banking/teacher/1')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('name', testTeacher.name);
          expect(res.body).toHaveProperty('bankAccount');
          expect(res.body.bankAccount).toHaveProperty(
            'bankName',
            testBankAccount.bankName,
          );
        });
    });
  });

  describe('/banking/teacher/:teacherId/bank-account (POST)', () => {
    beforeEach(async () => {
      // 기존 계좌 삭제
      await prismaService.bankAccount.deleteMany({
        where: { teacherId: 1 },
      });
    });

    it('should create a new bank account', () => {
      return request(app.getHttpServer())
        .post('/banking/teacher/1/bank-account')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testBankAccount)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('bankName', testBankAccount.bankName);
          expect(res.body).toHaveProperty(
            'accountNumber',
            testBankAccount.accountNumber,
          );
          expect(res.body).toHaveProperty(
            'accountHolder',
            testBankAccount.accountHolder,
          );
          expect(res.body).toHaveProperty('teacherId', 1);
        });
    });

    it('should return 400 when teacher already has a bank account', async () => {
      // 먼저 계좌 생성
      await prismaService.bankAccount.create({
        data: {
          ...testBankAccount,
          teacherId: 1,
        },
      });

      return request(app.getHttpServer())
        .post('/banking/teacher/1/bank-account')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testBankAccount)
        .expect(400);
    });

    it('should return 400 when required fields are missing', () => {
      return request(app.getHttpServer())
        .post('/banking/teacher/1/bank-account')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          bankName: '신한은행',
          // accountNumber and accountHolder are missing
        })
        .expect(400);
    });
  });

  describe('/banking/teacher/:teacherId/bank-account (PUT)', () => {
    beforeEach(async () => {
      // 테스트용 계좌 생성
      await prismaService.bankAccount.deleteMany({
        where: { teacherId: 1 },
      });
      await prismaService.bankAccount.create({
        data: {
          ...testBankAccount,
          teacherId: 1,
        },
      });
    });

    it('should update bank account information', () => {
      const updateData = {
        bankName: '국민은행',
        accountNumber: '987-654-321098',
      };

      return request(app.getHttpServer())
        .put('/banking/teacher/1/bank-account')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('bankName', '국민은행');
          expect(res.body).toHaveProperty('accountNumber', '987-654-321098');
          expect(res.body).toHaveProperty(
            'accountHolder',
            testBankAccount.accountHolder,
          );
        });
    });

    it('should handle partial updates', () => {
      const updateData = {
        accountHolder: '새로운강사',
      };

      return request(app.getHttpServer())
        .put('/banking/teacher/1/bank-account')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('bankName', testBankAccount.bankName);
          expect(res.body).toHaveProperty(
            'accountNumber',
            testBankAccount.accountNumber,
          );
          expect(res.body).toHaveProperty('accountHolder', '새로운강사');
        });
    });

    it('should return 404 when bank account does not exist', () => {
      return request(app.getHttpServer())
        .put('/banking/teacher/999/bank-account')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ bankName: '국민은행' })
        .expect(404);
    });
  });

  describe('/banking/teacher/:teacherId/bank-account (DELETE)', () => {
    beforeEach(async () => {
      // 테스트용 계좌 생성
      await prismaService.bankAccount.deleteMany({
        where: { teacherId: 1 },
      });
      await prismaService.bankAccount.create({
        data: {
          ...testBankAccount,
          teacherId: 1,
        },
      });
    });

    it('should delete bank account', () => {
      return request(app.getHttpServer())
        .delete('/banking/teacher/1/bank-account')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('deleted', true);
        });
    });

    it('should return 404 when bank account does not exist', () => {
      return request(app.getHttpServer())
        .delete('/banking/teacher/999/bank-account')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('Authentication and Authorization', () => {
    it('should return 401 when no token is provided', () => {
      return request(app.getHttpServer())
        .get('/banking/teacher/1/bank-account')
        .expect(401);
    });

    it('should return 401 when invalid token is provided', () => {
      return request(app.getHttpServer())
        .get('/banking/teacher/1/bank-account')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });
});
