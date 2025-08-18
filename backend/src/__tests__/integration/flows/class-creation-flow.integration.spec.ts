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
      const { user: teacher } = await createAuthenticatedUser('TEACHER');

      // 2. Principal이 클래스 생성
      const classData = testData.classes.basic({
        className: '초급 발레 클래스',
        level: 'BEGINNER',
        maxStudents: 10,
        tuitionFee: 150000,
        startDate: new Date('2025-12-01'),
        endDate: new Date('2025-12-31'),
        registrationStartDate: new Date('2025-11-15'),
        registrationEndDate: new Date('2025-11-30'),
        teacherId: teacher.id,
        academyId: academy.id,
      });

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
