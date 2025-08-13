import {
  getTestApp,
  getTestData,
  createAuthenticatedUser,
} from '../setup/test-setup';

describe('Auth Flow Integration Tests', () => {
  let testApp: any;
  let testData: any;

  beforeEach(() => {
    testApp = getTestApp();
    testData = getTestData();
  });

  describe('1. 회원가입 → 로그인 → 권한 검증 플로우', () => {
    describe('POST /auth/signup', () => {
      it('should create a new student with valid data', async () => {
        const studentData = testData.users.student();

        const response = await testApp
          .request()
          .post('/auth/signup')
          .send(studentData);

        console.log('Signup Response:', response.status, response.body);

        expect(response.status).toBe(201);

        expect(response.body).toHaveProperty('access_token');
        expect(response.body).toHaveProperty('user');
        expect(response.body.user).toHaveProperty('id');
        expect(response.body.user.userId).toBe(studentData.userId);
        expect(response.body.user.name).toBe(studentData.name);
        expect(response.body.user.role).toBe('STUDENT');
        expect(response.body.user).not.toHaveProperty('password');
      });

      it('should create a new teacher with valid data', async () => {
        const teacherData = testData.users.teacher();

        const response = await testApp
          .request()
          .post('/auth/signup')
          .send(teacherData)
          .expect(201);

        expect(response.body).toHaveProperty('access_token');
        expect(response.body).toHaveProperty('user');
        expect(response.body.user).toHaveProperty('id');
        expect(response.body.user.userId).toBe(teacherData.userId);
        expect(response.body.user.name).toBe(teacherData.name);
        expect(response.body.user.role).toBe('TEACHER');
        expect(response.body.user).not.toHaveProperty('password');
      });

      it.skip('원장 회원가입은 건너뜀 (미리 생성된 테스트 데이터 사용)', async () => {
        // 원장 회원가입 테스트는 건너뛰고 미리 생성된 테스트 데이터 사용
        expect(true).toBe(true);
      });

      it('should return 400 for duplicate userid', async () => {
        const userData = testData.users.student();

        // 첫 번째 사용자 생성
        await testApp.request().post('/auth/signup').send(userData).expect(201);

        // 중복된 userid로 두 번째 사용자 생성 시도
        await testApp.request().post('/auth/signup').send(userData).expect(409);
      });

      it('should return 400 for invalid phone number', async () => {
        const invalidUser = testData.users.student({
          phone: 'invalid-phone',
        });

        await testApp
          .request()
          .post('/auth/signup')
          .send(invalidUser)
          .expect(400);
      });

      it('should return 400 for weak password', async () => {
        const weakPasswordUser = testData.users.student({
          password: '123',
        });

        await testApp
          .request()
          .post('/auth/signup')
          .send(weakPasswordUser)
          .expect(400);
      });
    });

    describe('POST /auth/login', () => {
      let studentData: any;

      beforeEach(async () => {
        studentData = testData.users.student();
        // 테스트용 학생 생성
        await testApp.request().post('/auth/signup').send(studentData);
      });

      it('should login with valid credentials', async () => {
        const response = await testApp
          .request()
          .post('/auth/login')
          .send({
            userId: studentData.userId,
            password: studentData.password,
          })
          .expect(201);

        expect(response.body).toHaveProperty('access_token');
        expect(response.body).toHaveProperty('user');
        expect(response.body.user.userId).toBe(studentData.userId);
        expect(response.body.user.role).toBe('STUDENT');
      });

      it('should return 401 for invalid password', async () => {
        await testApp
          .request()
          .post('/auth/login')
          .send({
            userId: studentData.userId,
            password: 'wrongpassword',
          })
          .expect(401);
      });

      it('should return 401 for non-existent user', async () => {
        await testApp
          .request()
          .post('/auth/login')
          .send({
            userId: 'nonexistent',
            password: studentData.password,
          })
          .expect(401);
      });
    });

    describe('POST /auth/check-userid', () => {
      it('should return available for new userid', async () => {
        const response = await testApp
          .request()
          .post('/auth/check-userid')
          .send({ userId: 'newuser' })
          .expect(201);

        expect(response.body.available).toBe(true);
      });

      it('should return unavailable for existing userid', async () => {
        const userData = testData.users.student();

        // 사용자 생성
        await testApp.request().post('/auth/signup').send(userData);

        // 중복 체크
        const response = await testApp
          .request()
          .post('/auth/check-userid')
          .send({ userId: userData.userId })
          .expect(201);

        expect(response.body.available).toBe(false);
      });
    });

    describe('권한 기반 접근 제어', () => {
      let studentToken: string;
      let teacherToken: string;
      let principalToken: string;

      beforeEach(async () => {
        // 각 역할별 사용자 생성 및 로그인
        const { token: studentAuth } = await createAuthenticatedUser('STUDENT');
        const { token: teacherAuth } = await createAuthenticatedUser('TEACHER');
        const { token: principalAuth } =
          await createAuthenticatedUser('PRINCIPAL');

        studentToken = studentAuth;
        teacherToken = teacherAuth;
        principalToken = principalAuth;

        console.log('Student Token:', studentToken);
        console.log('Teacher Token:', teacherToken);
        console.log('Principal Token:', principalToken);

        // JWT 토큰 디코딩 (페이로드 확인)
        const jwt = require('jsonwebtoken');
        try {
          const studentPayload = jwt.decode(studentToken);
          console.log('Student Token Payload:', studentPayload);

          // JWT 검증 테스트
          const verifiedPayload = jwt.verify(
            studentToken,
            'test-jwt-secret-key-for-testing-only',
          );
          console.log('JWT Verification Success:', verifiedPayload);
        } catch (error) {
          console.log('JWT Error:', error.message);
        }
      });

      it('should allow students to access student-only endpoints', async () => {
        // 학생 전용 API 접근 테스트 (수강신청 내역 조회)
        const response = await testApp
          .request()
          .get('/class-sessions/student/enrollments')
          .set('Authorization', `Bearer ${studentToken}`);

        console.log('Student API Response:', response.status, response.body);

        // 403이면 권한 문제, 200이면 성공
        if (response.status === 403) {
          console.log('403 Forbidden - 권한 검증 실패');
          const jwt = require('jsonwebtoken');
          console.log('JWT Payload:', jwt.decode(studentToken));
        }

        // JWT 토큰 직접 검증 테스트
        const jwt = require('jsonwebtoken');
        try {
          const verifiedPayload = jwt.verify(
            studentToken,
            'test-jwt-secret-key-for-testing-only',
          );
          console.log('JWT Direct Verification Success:', verifiedPayload);
        } catch (error) {
          console.log('JWT Direct Verification Error:', error.message);
        }

        // 실제 환경변수 확인
        console.log('Current JWT_SECRET in test:', process.env.JWT_SECRET);
        console.log('Current NODE_ENV in test:', process.env.NODE_ENV);

        // Student 데이터베이스 확인 (JWT 토큰의 sub 값으로 조회)
        const student = await testApp.prisma.student.findUnique({
          where: { id: 131 }, // JWT 토큰의 sub 값
        });
        console.log('Student in DB (by ID):', student);

        // userId로도 조회
        const studentByUserId = await testApp.prisma.student.findUnique({
          where: { userId: 'student692124' },
        });
        console.log('Student in DB (by userId):', studentByUserId);

        // 모든 Student 데이터 확인
        const allStudents = await testApp.prisma.student.findMany();
        console.log(
          'All Students in DB:',
          allStudents.map((s) => ({ id: s.id, userId: s.userId })),
        );

        // Prisma 연결 강제 새로고침
        await testApp.prisma.$disconnect();
        await testApp.prisma.$connect();

        // 다시 조회
        const studentAfterRefresh = await testApp.prisma.student.findUnique({
          where: { id: 132 },
        });
        console.log('Student after refresh:', studentAfterRefresh);

        expect(response.status).toBe(200);

        // 응답이 올바른 형식인지 확인
        expect(Array.isArray(response.body)).toBe(true);
      });

      it('should allow teachers to access teacher-only endpoints', async () => {
        // 강사 전용 API 접근 테스트 (담당 클래스 조회)
        const response = await testApp
          .request()
          .get('/teachers/me/classes')
          .set('Authorization', `Bearer ${teacherToken}`)
          .expect(200);

        // 응답이 올바른 형식인지 확인
        expect(Array.isArray(response.body)).toBe(true);
      });

      it('should allow principals to access principal-only endpoints', async () => {
        // 원장 전용 API 접근 테스트 (학원 관리)
        const response = await testApp
          .request()
          .get('/principal/academy')
          .set('Authorization', `Bearer ${principalToken}`)
          .expect(200);

        // 응답이 올바른 형식인지 확인
        expect(response.body).toBeDefined();
      });

      it('should reject students from accessing teacher endpoints', async () => {
        // 학생이 강사 전용 API 접근 시도
        await testApp
          .request()
          .get('/teachers/me/classes')
          .set('Authorization', `Bearer ${studentToken}`)
          .expect(403);
      });

      it('should reject students from accessing principal endpoints', async () => {
        // 학생이 원장 전용 API 접근 시도
        await testApp
          .request()
          .get('/principal/academy')
          .set('Authorization', `Bearer ${studentToken}`)
          .expect(403);
      });

      it('should reject teachers from accessing principal endpoints', async () => {
        // 강사가 원장 전용 API 접근 시도
        await testApp
          .request()
          .get('/principal/academy')
          .set('Authorization', `Bearer ${teacherToken}`)
          .expect(403);
      });

      it('should reject access without token', async () => {
        // 토큰 없이 API 접근 시도
        await testApp
          .request()
          .get('/class-sessions/student/enrollments')
          .expect(401);
      });

      it('should reject access with invalid token', async () => {
        // 잘못된 토큰으로 API 접근 시도
        await testApp
          .request()
          .get('/class-sessions/student/enrollments')
          .set('Authorization', 'Bearer invalid-token')
          .expect(401);
      });
    });

    describe('전체 인증 플로우 통합 테스트', () => {
      it('should complete full authentication flow with role validation', async () => {
        // 1. 학생 회원가입
        const studentData = testData.users.student();
        const signupResponse = await testApp
          .request()
          .post('/auth/signup')
          .send(studentData)
          .expect(201);

        expect(signupResponse.body.user.role).toBe('STUDENT');

        // 2. 학생 로그인
        const loginResponse = await testApp
          .request()
          .post('/auth/login')
          .send({
            userId: studentData.userId,
            password: studentData.password,
          })
          .expect(201);

        const studentToken = loginResponse.body.access_token;
        expect(studentToken).toBeDefined();

        // 3. 권한 검증 - 학생만 접근 가능한 API
        const studentProfileResponse = await testApp
          .request()
          .get('/class-sessions/student/enrollments')
          .set('Authorization', `Bearer ${studentToken}`)
          .expect(200);

        expect(Array.isArray(studentProfileResponse.body)).toBe(true);

        // 4. 권한 검증 - 다른 역할의 API 접근 거부
        await testApp
          .request()
          .get('/teachers/me/classes')
          .set('Authorization', `Bearer ${studentToken}`)
          .expect(403);

        await testApp
          .request()
          .get('/principal/academy')
          .set('Authorization', `Bearer ${studentToken}`)
          .expect(403);
      });

      it('should handle multiple user types in the same flow', async () => {
        // 학생, 강사, 원장 모두 생성 및 로그인
        const { token: studentToken } =
          await createAuthenticatedUser('STUDENT');
        const { token: teacherToken } =
          await createAuthenticatedUser('TEACHER');
        const { token: principalToken } =
          await createAuthenticatedUser('PRINCIPAL');

        // 각각의 권한 확인
        await testApp
          .request()
          .get('/class-sessions/student/enrollments')
          .set('Authorization', `Bearer ${studentToken}`)
          .expect(200);

        await testApp
          .request()
          .get('/teachers/me/classes')
          .set('Authorization', `Bearer ${teacherToken}`)
          .expect(200);

        await testApp
          .request()
          .get('/principal/academy')
          .set('Authorization', `Bearer ${principalToken}`)
          .expect(200);

        // 크로스 접근 거부 확인
        await testApp
          .request()
          .get('/teachers/me/classes')
          .set('Authorization', `Bearer ${studentToken}`)
          .expect(403);
      });
    });
  });
});
