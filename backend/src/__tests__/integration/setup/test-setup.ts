import { TestApp } from './test-app';
import { TestDataFactory } from './test-data';

// 전역 테스트 앱 인스턴스
let globalTestApp: TestApp;

// Jest 전역 설정
beforeAll(async () => {
  // 테스트 환경변수 설정 (운영 코드와 동일한 방식)
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL =
    'postgresql://postgres:postgres@localhost:5433/ballet_class_test_db';
  process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';

  console.log('Test Environment Variables:');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('DATABASE_URL:', process.env.DATABASE_URL);
  console.log('JWT_SECRET:', process.env.JWT_SECRET);

  // 전역 테스트 앱 초기화
  globalTestApp = new TestApp();
  await globalTestApp.init();
});

afterAll(async () => {
  // 전역 테스트 앱 정리
  if (globalTestApp) {
    await globalTestApp.close();
  }
});

// 각 테스트 전후 정리
beforeEach(async () => {
  if (globalTestApp) {
    await globalTestApp.cleanup();
  }
});

// 전역 헬퍼 함수들
export const getTestApp = () => globalTestApp;
export const getTestData = () => TestDataFactory;

// 공통 테스트 헬퍼
export const createAuthenticatedUser = async (
  role: 'STUDENT' | 'TEACHER' | 'PRINCIPAL',
) => {
  const testApp = getTestApp();
  const testData = getTestData();

  if (role === 'PRINCIPAL') {
    // 원장은 테스트용 더미 데이터로 직접 생성
    return await createTestPrincipal();
  }

  // 사용자 데이터 생성
  const userData =
    testData.users[role.toLowerCase() as keyof typeof testData.users]();

  // 회원가입
  const signupResponse = await testApp
    .request()
    .post('/auth/signup')
    .send(userData);

  // 로그인
  const loginResponse = await testApp.request().post('/auth/login').send({
    userId: userData.userId,
    password: userData.password,
  });

  // 실제 로그인 API를 통해 받은 토큰 사용 (운영 코드와 동일한 방식)
  return {
    user: signupResponse.body.user,
    token: loginResponse.body.access_token,
    userData,
  };
};

// 테스트용 원장 생성 헬퍼
export const createTestPrincipal = async () => {
  const testApp = getTestApp();
  const testData = getTestData();

  // 원장 데이터 생성
  const principalData = testData.users.principal();

  // 비밀번호 해싱
  const bcrypt = require('bcrypt');
  const hashedPassword = await bcrypt.hash(principalData.password, 10);

  // 먼저 Academy 생성 (원장이 필요함)
  const academy = await testApp.prisma.academy.create({
    data: {
      name: '테스트 발레 학원',
      phoneNumber: '02-1234-5678',
      address: '서울시 강남구 테스트로 123',
      description: '전문적인 발레 교육을 제공합니다.',
      code: `ACADEMY_${Date.now()}`,
    },
  });

  // 원장 직접 생성 (회원가입 API 우회)
  const principal = await testApp.prisma.principal.create({
    data: {
      userId: principalData.userId,
      password: hashedPassword,
      name: principalData.name,
      phoneNumber: principalData.phoneNumber,
      academyId: academy.id,
    },
  });

  // JWT 토큰 생성 (동일한 시크릿 사용)
  const jwt = require('jsonwebtoken');
  const token = jwt.sign(
    {
      sub: principal.id,
      userId: principal.userId,
      role: 'PRINCIPAL',
    },
    'test-jwt-secret-key-for-testing-only',
    { expiresIn: '24h' },
  );

  return {
    user: {
      id: principal.id,
      userId: principal.userId,
      name: principal.name,
      role: 'PRINCIPAL',
    },
    token,
    userData: principalData,
    academy,
  };
};

export const createTestTeacher = async (academyId: number) => {
  const testApp = getTestApp();
  const testData = getTestData();

  // 강사 데이터 생성
  const teacherData = testData.users.teacher();

  // 비밀번호 해싱
  const bcrypt = require('bcrypt');
  const hashedPassword = await bcrypt.hash(teacherData.password, 10);

  // 강사 직접 생성 (회원가입 API 우회)
  const teacher = await testApp.prisma.teacher.create({
    data: {
      userId: teacherData.userId,
      password: hashedPassword,
      name: teacherData.name,
      phoneNumber: teacherData.phoneNumber,
      academyId: academyId,
    },
  });

  return teacher;
};

// 학원 생성 헬퍼
export const createAcademyWithPrincipal = async () => {
  const testApp = getTestApp();
  const testData = getTestData();

  // 원장 생성 및 로그인
  const { user: principal, token: principalToken } =
    await createAuthenticatedUser('PRINCIPAL');

  // 학원 생성
  const academyData = testData.academy();
  const academyResponse = await testApp
    .authenticatedRequest(principalToken)
    .post('/academy')
    .send(academyData);

  return {
    academy: academyResponse.body,
    principal,
    principalToken,
  };
};

// 클래스 생성 헬퍼
export const createClassWithSessions = async (
  academyId: number,
  teacherId: number,
) => {
  const testApp = getTestApp();
  const testData = getTestData();

  // 클래스 생성
  const classData = testData.class();
  const classResponse = await testApp
    .request()
    .post('/class')
    .send({
      ...classData,
      academyId,
      teacherId,
    });

  return {
    class: classResponse.body,
    classData,
  };
};
