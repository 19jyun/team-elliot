import {
  getTestApp,
  getTestData,
  createAuthenticatedUser,
} from '../setup/test-setup';

describe('Class Enrollment Flow Integration Tests', () => {
  let testApp: any;
  let testData: any;

  beforeEach(() => {
    testApp = getTestApp();
    testData = getTestData();
  });

  describe('1. 수강신청 플로우', () => {
    it('should allow students to enroll in sessions', async () => {
      // 1. Principal, Teacher, Student 생성
      const { token: principalToken, academy } =
        await createAuthenticatedUser('PRINCIPAL');
      const { user: teacher } = await createAuthenticatedUser('TEACHER');
      const { token: studentToken } = await createAuthenticatedUser('STUDENT');

      // 2. 클래스 생성
      const classData = testData.classes.basic({
        className: '중급 발레 클래스',
        level: 'INTERMEDIATE',
        maxStudents: 8,
        tuitionFee: 200000,
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

      // 3. 생성된 세션들 조회
      const sessionsResponse = await testApp
        .request()
        .get(`/class-sessions/class/${createdClass.id}`)
        .set('Authorization', `Bearer ${principalToken}`)
        .expect(200);

      const createdSessions = sessionsResponse.body;
      expect(createdSessions.length).toBeGreaterThan(0);

      const firstSession = createdSessions[0];

      // 4. Student가 첫 번째 세션에 수강신청
      const enrollmentResponse = await testApp
        .request()
        .post(`/class-sessions/${firstSession.id}/enroll`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(201);

      const enrollment = enrollmentResponse.body;
      console.log('Enrollment Response:', enrollment);

      expect(enrollment).toHaveProperty('id');
      expect(enrollment.sessionId).toBe(firstSession.id);
      expect(enrollment.status).toBe('PENDING');
    });

    it('should prevent duplicate enrollments', async () => {
      // 1. Principal, Teacher, Student 생성
      const { token: principalToken, academy } =
        await createAuthenticatedUser('PRINCIPAL');
      const { user: teacher } = await createAuthenticatedUser('TEACHER');
      const { token: studentToken } = await createAuthenticatedUser('STUDENT');

      // 2. 클래스 생성
      const classData = testData.classes.basic({
        className: '고급 발레 클래스',
        level: 'ADVANCED',
        maxStudents: 6,
        tuitionFee: 250000,
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

      // 3. 생성된 세션들 조회
      const sessionsResponse = await testApp
        .request()
        .get(`/class-sessions/class/${createdClass.id}`)
        .set('Authorization', `Bearer ${principalToken}`)
        .expect(200);

      const createdSessions = sessionsResponse.body;
      const firstSession = createdSessions[0];

      // 4. 첫 번째 수강신청 (성공)
      await testApp
        .request()
        .post(`/class-sessions/${firstSession.id}/enroll`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(201);

      // 5. 같은 세션에 중복 수강신청 시도 (실패)
      await testApp
        .request()
        .post(`/class-sessions/${firstSession.id}/enroll`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(400);
    });
  });

  describe('2. 전체 플로우 통합 테스트', () => {
    it('should complete full enrollment flow', async () => {
      // 1. Principal, Teacher, Student 생성
      const { token: principalToken, academy } =
        await createAuthenticatedUser('PRINCIPAL');
      const { user: teacher } = await createAuthenticatedUser('TEACHER');
      const { token: studentToken } = await createAuthenticatedUser('STUDENT');

      // 2. 클래스 생성
      const classData = testData.classes.basic({
        className: '통합 테스트 발레 클래스',
        level: 'BEGINNER',
        maxStudents: 12,
        tuitionFee: 180000,
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
      console.log('Created Class for Integration Test:', createdClass);

      // 3. 자동 생성된 세션들 확인
      const sessionsResponse = await testApp
        .request()
        .get(`/class-sessions/class/${createdClass.id}`)
        .set('Authorization', `Bearer ${principalToken}`)
        .expect(200);

      const createdSessions = sessionsResponse.body;
      console.log('Created Sessions for Integration Test:', createdSessions);

      expect(createdSessions.length).toBeGreaterThan(0);

      // 4. Student가 첫 번째 세션에 수강신청
      const firstSession = createdSessions[0];
      const enrollmentResponse = await testApp
        .request()
        .post(`/class-sessions/${firstSession.id}/enroll`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(201);

      const enrollment = enrollmentResponse.body;
      console.log('Enrollment for Integration Test:', enrollment);

      expect(enrollment.sessionId).toBe(firstSession.id);
      expect(enrollment.status).toBe('PENDING');

      // 5. Student의 수강신청 목록 확인
      const studentEnrollmentsResponse = await testApp
        .request()
        .get('/class-sessions/student/enrollments')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      const studentEnrollments = studentEnrollmentsResponse.body;
      console.log('Student Enrollments:', studentEnrollments);

      expect(Array.isArray(studentEnrollments)).toBe(true);
      expect(studentEnrollments.length).toBeGreaterThan(0);

      // 수강신청한 세션이 목록에 있는지 확인
      const foundEnrollment = studentEnrollments.find(
        (enrollment: any) => enrollment.sessionId === firstSession.id,
      );
      expect(foundEnrollment).toBeDefined();
    });
  });
});
