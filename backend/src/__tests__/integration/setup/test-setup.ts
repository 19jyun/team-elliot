import { TestApp } from './test-app';
import { TestDataFactory } from './test-data';

// 테스트 환경 변수 로깅
console.log('Test Environment Variables:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DATABASE_URL:', process.env.DATABASE_URL);
console.log('JWT_SECRET:', process.env.JWT_SECRET);

let testApp: TestApp;

export const getTestApp = () => {
  if (!testApp) {
    testApp = new TestApp();
  }
  return testApp;
};

export const getTestData = () => {
  return TestDataFactory;
};

// Jest 전역 설정
beforeAll(async () => {
  // 테스트 환경변수 설정
  process.env.NODE_ENV = 'test';

  // DATABASE_URL이 설정되지 않은 경우에만 기본값 설정
  if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL =
      'postgresql://postgres:postgres@localhost:5432/ballet_class_test_db';
  }

  // JWT_SECRET이 설정되지 않은 경우에만 기본값 설정
  if (!process.env.JWT_SECRET) {
    process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
  }

  // TestApp 초기화
  testApp = new TestApp();
  await testApp.init();
});

afterAll(async () => {
  // TestApp 정리
  if (testApp) {
    await testApp.close();
  }
});

// 각 테스트 전후 정리
beforeEach(async () => {
  if (testApp) {
    await testApp.cleanup();
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
});

afterEach(async () => {
  if (testApp) {
    await testApp.cleanup();
  }
});

// 인증된 사용자 생성 (각 역할별로 완전한 데이터 반환)
export const createAuthenticatedUser = async (
  role: 'STUDENT' | 'TEACHER' | 'PRINCIPAL',
) => {
  const testApp = getTestApp();
  const testData = getTestData();

  let userData;
  let user;
  let token;

  switch (role) {
    case 'STUDENT':
      userData = testData.users.student();

      // Student 회원가입
      const studentResponse = await testApp
        .request()
        .post('/auth/signup')
        .send(userData)
        .expect(201);

      user = studentResponse.body.user;
      token = studentResponse.body.access_token;

      // Student 엔티티 정보 가져오기
      const student = await testApp.prisma.student.findUnique({
        where: { userId: userData.userId },
      });

      return {
        user,
        token,
        student,
        userId: userData.userId,
      };

    case 'TEACHER':
      userData = testData.users.teacher();

      // Teacher 회원가입
      const teacherResponse = await testApp
        .request()
        .post('/auth/signup')
        .send(userData)
        .expect(201);

      user = teacherResponse.body.user;
      token = teacherResponse.body.access_token;

      // Teacher 엔티티 정보 가져오기
      const teacher = await testApp.prisma.teacher.findUnique({
        where: { userId: userData.userId },
      });

      return {
        user,
        token,
        teacher,
        userId: userData.userId,
      };

    case 'PRINCIPAL':
      userData = testData.users.principal();

      // Principal 회원가입 (API가 자동으로 Academy 생성)
      const principalResponse = await testApp
        .request()
        .post('/auth/signup')
        .send(userData);

      console.log(
        'Principal signup response:',
        principalResponse.status,
        principalResponse.body,
      );

      if (principalResponse.status !== 201) {
        console.error('Principal signup failed:', principalResponse.body);
        throw new Error(
          `Principal signup failed with status ${principalResponse.status}`,
        );
      }

      user = principalResponse.body.user;
      token = principalResponse.body.access_token;

      // Principal 회원가입 API가 이미 Academy를 생성했으므로, 생성된 Principal과 Academy 정보 가져오기
      const principal = await testApp.prisma.principal.findUnique({
        where: { userId: userData.userId },
        include: { academy: true },
      });

      console.log('Created Principal with Academy:', principal);

      if (!principal || !principal.academy) {
        throw new Error('Principal 또는 Academy가 생성되지 않았습니다.');
      }

      return {
        user,
        token,
        principal,
        academy: principal.academy,
        userId: userData.userId,
      };

    default:
      throw new Error(`Unsupported role: ${role}`);
  }
};

// 테스트용 Principal 생성 (기존 코드 유지)
export const createTestPrincipal = async () => {
  const testApp = getTestApp();
  const testData = getTestData();

  const principalData = testData.users.principal();
  const bcrypt = await import('bcrypt');
  const hashedPassword = await bcrypt.default.hash(principalData.password, 10);

  // Academy 생성
  const academy = await testApp.prisma.academy.create({
    data: {
      name: `${principalData.name}의 발레 학원`,
      phoneNumber: '02-1234-5678',
      address: '서울시 강남구 테스트로 123',
      description: '전문적인 발레 교육을 제공합니다.',
      code: `ACADEMY_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    },
  });

  // User 테이블에 먼저 생성
  const user = await testApp.prisma.user.create({
    data: {
      userId: principalData.userId,
      password: hashedPassword,
      name: principalData.name,
      role: 'PRINCIPAL',
    },
  });

  // Principal 직접 생성 (회원가입 API 우회)
  const principal = await testApp.prisma.principal.create({
    data: {
      userId: principalData.userId,
      password: hashedPassword,
      name: principalData.name,
      phoneNumber: principalData.phoneNumber,
      academyId: academy.id,
    },
  });

  // JWT 토큰 생성 (User 테이블의 id 사용)
  const token = testApp.jwtService.sign({
    sub: user.id,
    userId: principalData.userId,
    role: 'PRINCIPAL',
  });

  return {
    principal,
    academy,
    user,
    token,
  };
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
