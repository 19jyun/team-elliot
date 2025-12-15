import {
  getTestApp,
  getTestData,
  createAuthenticatedUser,
} from '../setup/test-setup';

describe('Class Creation Flow Integration Tests', () => {
  let testApp: any;
  let testData: any;

  beforeEach(() => {
    testApp = getTestApp();
    testData = getTestData();
  });

  describe('1. Principal의 클래스 생성 및 세션 자동 생성', () => {
    it('should create a class and automatically generate sessions', async () => {
      // 1. Principal과 Teacher 생성
      const { token: principalToken, academy } =
        await createAuthenticatedUser('PRINCIPAL');
      const { teacher } = await createAuthenticatedUser('TEACHER');

      // 라우트 확인을 위한 간단한 GET 요청
      console.log('Testing basic route availability...');
      try {
        const testResponse = await testApp
          .request()
          .get('/classes')
          .set('Authorization', `Bearer ${principalToken}`);
        console.log('GET /classes response status:', testResponse.status);
      } catch (error) {
        console.error('GET /classes failed:', error.message);
      }

      // 실제 등록된 라우트 확인
      console.log('=== 등록된 라우트 확인 ===');
      const app = testApp.app;

      // Express 라우터 확인
      const expressApp = app.getHttpAdapter().getInstance();
      if (expressApp._router && expressApp._router.stack) {
        console.log(
          'Express router stack length:',
          expressApp._router.stack.length,
        );
        expressApp._router.stack.forEach((layer, index) => {
          if (layer.route) {
            const methods = Object.keys(layer.route.methods);
            const path = layer.route.path;
            console.log(
              `Route ${index}: ${methods.join(',').toUpperCase()} ${path}`,
            );
          }
        });
      }

      // 2. Principal이 클래스 생성
      const classData = testData.classes.basic({
        className: '초급 발레 클래스',
        level: 'BEGINNER',
        maxStudents: 10,
        tuitionFee: 150000,
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-01-31'),
        registrationStartDate: new Date('2025-12-15'),
        registrationEndDate: new Date('2025-12-31'),
        teacherId: teacher.id,
        academyId: academy.id,
      });

      console.log('Sending POST request to /classes with data:', classData);
      console.log('Principal token:', principalToken);

      const createClassResponse = await testApp
        .request()
        .post('/classes')
        .set('Authorization', `Bearer ${principalToken}`)
        .send(classData)
        .expect(201);

      const createdClass = createClassResponse.body;
      console.log('Created Class:', createdClass);

      expect(createdClass).toHaveProperty('id');
      expect(createdClass.className).toBe(classData.className);
      expect(createdClass.level).toBe(classData.level);
      expect(createdClass.maxStudents).toBe(classData.maxStudents);
      expect(createdClass.tuitionFee).toBe(classData.tuitionFee.toString());

      // 3. 자동 생성된 세션들 확인
      const sessionsResponse = await testApp
        .request()
        .get(`/class-sessions/class/${createdClass.id}`)
        .set('Authorization', `Bearer ${principalToken}`)
        .expect(200);

      const createdSessions = sessionsResponse.body;
      console.log('Created Sessions:', createdSessions);

      // 세션이 생성되었는지 확인
      expect(Array.isArray(createdSessions)).toBe(true);
      expect(createdSessions.length).toBeGreaterThan(0);

      // 각 세션의 기본 정보 확인
      createdSessions.forEach((session: any) => {
        expect(session).toHaveProperty('id');
        expect(session).toHaveProperty('classId');
        expect(session).toHaveProperty('date');
        expect(session).toHaveProperty('startTime');
        expect(session).toHaveProperty('endTime');
        expect(session.classId).toBe(createdClass.id);
      });
    });
  });
});
