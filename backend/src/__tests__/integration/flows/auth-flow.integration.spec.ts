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

  describe('1. 회원가입 테스트', () => {
    describe('POST /auth/signup', () => {
      it('should create a new student with valid data', async () => {
        const studentData = testData.users.student();

        const response = await testApp
          .request()
          .post('/auth/signup')
          .send(studentData);

        console.log('Student Signup Response:', response.status, response.body);

        expect(response.status).toBe(201);

        expect(response.body).toHaveProperty('access_token');
        expect(response.body).toHaveProperty('user');
        expect(response.body.user).toHaveProperty('id');
        expect(response.body.user.userId).toBe(studentData.userId);
        expect(response.body.user.name).toBe(studentData.name);
        expect(response.body.user.role).toBe('STUDENT');
        expect(response.body.user).not.toHaveProperty('password');

        // 데이터베이스 검증
        const student = await testApp.prisma.student.findUnique({
          where: { userId: studentData.userId },
        });

        expect(student).toBeDefined();
        expect(student.name).toBe(studentData.name);
        expect(student.userId).toBe(studentData.userId);
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

        // 데이터베이스 검증
        const teacher = await testApp.prisma.teacher.findUnique({
          where: { userId: teacherData.userId },
        });

        expect(teacher).toBeDefined();
        expect(teacher.name).toBe(teacherData.name);
        expect(teacher.userId).toBe(teacherData.userId);
      });

      it('should create a new principal with academy and user record', async () => {
        const principalData = testData.users.principal();

        const response = await testApp
          .request()
          .post('/auth/signup')
          .send(principalData)
          .expect(201);

        const result = response.body;

        // 응답 검증
        expect(result).toHaveProperty('access_token');
        expect(result).toHaveProperty('user');
        expect(result.user.role).toBe('PRINCIPAL');
        expect(result.user.userId).toBe(principalData.userId);
        expect(result.user.name).toBe(principalData.name);

        // 데이터베이스 검증
        const principal = await testApp.prisma.principal.findUnique({
          where: { userId: principalData.userId },
          include: { academy: true },
        });

        expect(principal).toBeDefined();
        expect(principal.name).toBe(principalData.name);
        expect(principal.academy).toBeDefined();
        expect(principal.academy.name).toBe(
          `${principalData.name}의 발레 학원`,
        );

        // User 테이블 검증
        const user = await testApp.prisma.user.findUnique({
          where: { userId: principalData.userId },
        });

        expect(user).toBeDefined();
        expect(user.role).toBe('PRINCIPAL');
        expect(user.name).toBe(principalData.name);
      });

      it('should return 409 for duplicate userid', async () => {
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
  });

  describe('2. 로그인 테스트', () => {
    describe('POST /auth/login', () => {
      it('should login student with valid credentials', async () => {
        const studentData = testData.users.student();

        // Student 회원가입
        await testApp.request().post('/auth/signup').send(studentData);

        // Student 로그인
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

      it('should login teacher with valid credentials', async () => {
        const teacherData = testData.users.teacher();

        // Teacher 회원가입
        await testApp.request().post('/auth/signup').send(teacherData);

        // Teacher 로그인
        const response = await testApp
          .request()
          .post('/auth/login')
          .send({
            userId: teacherData.userId,
            password: teacherData.password,
          })
          .expect(201);

        expect(response.body).toHaveProperty('access_token');
        expect(response.body).toHaveProperty('user');
        expect(response.body.user.userId).toBe(teacherData.userId);
        expect(response.body.user.role).toBe('TEACHER');
      });

      it('should login principal with valid credentials', async () => {
        const principalData = testData.users.principal();

        // Principal 회원가입
        await testApp.request().post('/auth/signup').send(principalData);

        // Principal 로그인
        const response = await testApp
          .request()
          .post('/auth/login')
          .send({
            userId: principalData.userId,
            password: principalData.password,
          })
          .expect(201);

        expect(response.body).toHaveProperty('access_token');
        expect(response.body).toHaveProperty('user');
        expect(response.body.user.userId).toBe(principalData.userId);
        expect(response.body.user.role).toBe('PRINCIPAL');
      });

      it('should return 401 for invalid password', async () => {
        const studentData = testData.users.student();

        // Student 회원가입
        await testApp.request().post('/auth/signup').send(studentData);

        // 잘못된 비밀번호로 로그인 시도
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
            password: 'password123',
          })
          .expect(401);
      });
    });
  });

  describe('3. JWT 토큰 검증 테스트', () => {
    it('should generate valid JWT token for student', async () => {
      const studentData = testData.users.student();

      // Student 회원가입
      const signupResponse = await testApp
        .request()
        .post('/auth/signup')
        .send(studentData)
        .expect(201);

      const token = signupResponse.body.access_token;

      // JWT 토큰 검증
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, 'test-jwt-secret-key-for-testing-only');

      expect(decoded).toHaveProperty('sub');
      expect(decoded).toHaveProperty('userId', studentData.userId);
      expect(decoded).toHaveProperty('role', 'STUDENT');
    });

    it('should generate valid JWT token for teacher', async () => {
      const teacherData = testData.users.teacher();

      // Teacher 회원가입
      const signupResponse = await testApp
        .request()
        .post('/auth/signup')
        .send(teacherData)
        .expect(201);

      const token = signupResponse.body.access_token;

      // JWT 토큰 검증
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, 'test-jwt-secret-key-for-testing-only');

      expect(decoded).toHaveProperty('sub');
      expect(decoded).toHaveProperty('userId', teacherData.userId);
      expect(decoded).toHaveProperty('role', 'TEACHER');
    });

    it('should generate valid JWT token for principal', async () => {
      const principalData = testData.users.principal();

      // Principal 회원가입
      const signupResponse = await testApp
        .request()
        .post('/auth/signup')
        .send(principalData)
        .expect(201);

      const token = signupResponse.body.access_token;

      // JWT 토큰 검증
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, 'test-jwt-secret-key-for-testing-only');

      expect(decoded).toHaveProperty('sub');
      expect(decoded).toHaveProperty('userId', principalData.userId);
      expect(decoded).toHaveProperty('role', 'PRINCIPAL');
    });
  });

  describe('4. 사용자 ID 중복 체크 테스트', () => {
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
  });
});
