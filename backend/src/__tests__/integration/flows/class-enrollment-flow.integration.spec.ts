import {
  getTestApp,
  getTestData,
  createAuthenticatedUser,
  createTestPrincipal,
  createTestTeacher,
} from '../setup/test-setup';

describe('Class Enrollment Flow Integration Tests', () => {
  let testApp: any;
  let testData: any;

  beforeEach(() => {
    testApp = getTestApp();
    testData = getTestData();
  });

  describe('2. 강의(클래스) 생성 → 자동 세션 생성 → 수강생 수강신청 플로우', () => {
    describe('클래스 생성 및 세션 자동 생성', () => {
      let principalToken: string;
      let studentToken: string;
      let createdClass: any;
      let createdSessions: any[];

      beforeEach(async () => {
        // Principal과 Student 생성
        const { token: principalAuth } =
          await createAuthenticatedUser('PRINCIPAL');
        const { token: studentAuth } = await createAuthenticatedUser('STUDENT');

        principalToken = principalAuth;
        studentToken = studentAuth;

        console.log('Principal Token:', principalToken);
        console.log('Student Token:', studentToken);
      });

      it('should create a class and automatically generate sessions', async () => {
        // 1. Principal과 Teacher 생성
        const principalResult = await createTestPrincipal();
        const teacher = await createTestTeacher(principalResult.academy.id);

        // 2. Principal이 클래스 생성
        const classData = testData.classes.basic({
          className: '초급 발레 클래스',
          level: 'BEGINNER',
          maxStudents: 10,
          tuitionFee: 150000,
          startDate: new Date('2024-02-01'),
          endDate: new Date('2024-02-29'),
          registrationStartDate: new Date('2024-01-15'),
          registrationEndDate: new Date('2024-01-31'),
          teacherId: teacher.id,
          academyId: principalResult.academy.id,
        });

        const createClassResponse = await testApp
          .request()
          .post('/classes')
          .set('Authorization', `Bearer ${principalResult.token}`)
          .send(classData)
          .expect(201);

        createdClass = createClassResponse.body;
        console.log('Created Class:', createdClass);

        expect(createdClass).toHaveProperty('id');
        expect(createdClass.className).toBe(classData.className);
        expect(createdClass.level).toBe(classData.level);
        expect(createdClass.maxStudents).toBe(classData.maxStudents);
        expect(createdClass.tuitionFee).toBe(classData.tuitionFee.toString());

        // 2. 자동 생성된 세션들 확인 (Teacher로 조회)
        const teacherToken = await createAuthenticatedUser('TEACHER');
        const sessionsResponse = await testApp
          .request()
          .get(`/class-sessions/class/${createdClass.id}`)
          .set('Authorization', `Bearer ${teacherToken.token}`)
          .expect(200);

        createdSessions = sessionsResponse.body;
        console.log('Created Sessions:', createdSessions);

        // 2월에는 보통 4주차가 있으므로 4개의 세션이 생성되어야 함
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

      it('should reject non-principal users from creating classes', async () => {
        // Student가 클래스 생성 시도
        const classData = testData.classes.basic();

        await testApp
          .request()
          .post('/classes')
          .set('Authorization', `Bearer ${studentToken}`)
          .send(classData)
          .expect(403);
      });
    });

    describe('수강신청 플로우', () => {
      let principalToken: string;
      let studentToken: string;
      let createdClass: any;
      let createdSessions: any[];

      beforeEach(async () => {
        // Principal과 Student 생성
        const { token: principalAuth } =
          await createAuthenticatedUser('PRINCIPAL');
        const { token: studentAuth } = await createAuthenticatedUser('STUDENT');

        principalToken = principalAuth;
        studentToken = studentAuth;

        // Principal과 Teacher 생성
        const principalResult = await createTestPrincipal();
        const teacher = await createTestTeacher(principalResult.academy.id);

        // 클래스 생성
        const classData = testData.classes.basic({
          className: '중급 발레 클래스',
          level: 'INTERMEDIATE',
          maxStudents: 8,
          tuitionFee: 200000,
          teacherId: teacher.id,
          academyId: principalResult.academy.id,
        });

        const createClassResponse = await testApp
          .request()
          .post('/classes')
          .set('Authorization', `Bearer ${principalResult.token}`)
          .send(classData);

        createdClass = createClassResponse.body;

        // 세션들 조회 (Teacher로 조회)
        const teacherToken = await createAuthenticatedUser('TEACHER');
        const sessionsResponse = await testApp
          .request()
          .get(`/class-sessions/class/${createdClass.id}`)
          .set('Authorization', `Bearer ${teacherToken.token}`);

        createdSessions = sessionsResponse.body;
      });

      it('should allow students to enroll in sessions', async () => {
        // 1. Student가 수강 가능한 세션들 조회
        const availableSessionsResponse = await testApp
          .request()
          .get(`/class-sessions/class/${createdClass.id}`)
          .set('Authorization', `Bearer ${studentToken}`)
          .expect(200);

        const availableSessions = availableSessionsResponse.body;
        console.log('Available Sessions for Student:', availableSessions);

        expect(Array.isArray(availableSessions)).toBe(true);
        expect(availableSessions.length).toBeGreaterThan(0);

        // 2. Student가 첫 번째 세션에 수강신청
        const firstSession = availableSessions[0];
        const enrollmentResponse = await testApp
          .request()
          .post(`/class-sessions/${firstSession.id}/enroll`)
          .set('Authorization', `Bearer ${studentToken}`)
          .expect(201);

        const enrollment = enrollmentResponse.body;
        console.log('Enrollment Response:', enrollment);

        expect(enrollment).toHaveProperty('id');
        expect(enrollment).toHaveProperty('sessionId');
        expect(enrollment).toHaveProperty('studentId');
        expect(enrollment).toHaveProperty('status');
        expect(enrollment.sessionId).toBe(firstSession.id);
        expect(enrollment.status).toBe('PENDING');

        // 3. Student의 수강신청 내역 확인
        const enrollmentsResponse = await testApp
          .request()
          .get('/class-sessions/student/enrollments')
          .set('Authorization', `Bearer ${studentToken}`)
          .expect(200);

        const studentEnrollments = enrollmentsResponse.body;
        console.log('Student Enrollments:', studentEnrollments);

        expect(Array.isArray(studentEnrollments)).toBe(true);
        expect(studentEnrollments.length).toBe(1);
        expect(studentEnrollments[0].sessionId).toBe(firstSession.id);
      });

      it('should reject non-student users from enrolling in sessions', async () => {
        // Principal이 수강신청 시도
        const firstSession = createdSessions[0];

        await testApp
          .request()
          .post(`/class-sessions/${firstSession.id}/enroll`)
          .set('Authorization', `Bearer ${principalToken}`)
          .expect(403);
      });

      it('should prevent duplicate enrollments', async () => {
        // 1. 첫 번째 수강신청
        const firstSession = createdSessions[0];
        await testApp
          .request()
          .post(`/class-sessions/${firstSession.id}/enroll`)
          .set('Authorization', `Bearer ${studentToken}`)
          .expect(201);

        // 2. 같은 세션에 중복 수강신청 시도
        await testApp
          .request()
          .post(`/class-sessions/${firstSession.id}/enroll`)
          .set('Authorization', `Bearer ${studentToken}`)
          .expect(409); // Conflict
      });

      it('should allow batch enrollment for multiple sessions', async () => {
        // 여러 세션에 배치 수강신청
        const sessionIds = createdSessions
          .slice(0, 3)
          .map((session: any) => session.id);

        const batchEnrollmentResponse = await testApp
          .request()
          .post('/class-sessions/batch-enroll')
          .set('Authorization', `Bearer ${studentToken}`)
          .send({
            sessionIds,
            reason: '정기 수강 신청',
          })
          .expect(201);

        const batchEnrollment = batchEnrollmentResponse.body;
        console.log('Batch Enrollment Response:', batchEnrollment);

        expect(batchEnrollment).toHaveProperty('enrollments');
        expect(Array.isArray(batchEnrollment.enrollments)).toBe(true);
        expect(batchEnrollment.enrollments.length).toBe(sessionIds.length);

        // 각 수강신청 상태 확인
        batchEnrollment.enrollments.forEach((enrollment: any) => {
          expect(enrollment).toHaveProperty('id');
          expect(enrollment).toHaveProperty('sessionId');
          expect(enrollment).toHaveProperty('status');
          expect(sessionIds).toContain(enrollment.sessionId);
          expect(enrollment.status).toBe('PENDING');
        });
      });
    });

    describe('전체 플로우 통합 테스트', () => {
      it('should complete full class creation and enrollment flow', async () => {
        // 1. Principal과 Student 생성
        const { token: principalToken } =
          await createAuthenticatedUser('PRINCIPAL');
        const { token: studentToken } =
          await createAuthenticatedUser('STUDENT');

        // 2. Principal과 Teacher 생성
        const principalResult = await createTestPrincipal();
        const teacher = await createTestTeacher(principalResult.academy.id);

        // 3. Principal이 클래스 생성
        const classData = testData.classes.basic({
          className: '고급 발레 클래스',
          level: 'ADVANCED',
          maxStudents: 6,
          tuitionFee: 250000,
          teacherId: teacher.id,
          academyId: principalResult.academy.id,
        });

        const createClassResponse = await testApp
          .request()
          .post('/classes')
          .set('Authorization', `Bearer ${principalResult.token}`)
          .send(classData)
          .expect(201);

        const createdClass = createClassResponse.body;

        // 3. 자동 생성된 세션들 확인 (Teacher로 조회)
        const teacherToken = await createAuthenticatedUser('TEACHER');
        const sessionsResponse = await testApp
          .request()
          .get(`/class-sessions/class/${createdClass.id}`)
          .set('Authorization', `Bearer ${teacherToken.token}`)
          .expect(200);

        const createdSessions = sessionsResponse.body;
        expect(createdSessions.length).toBeGreaterThan(0);

        // 4. Student가 세션에 수강신청
        const firstSession = createdSessions[0];
        const enrollmentResponse = await testApp
          .request()
          .post(`/class-sessions/${firstSession.id}/enroll`)
          .set('Authorization', `Bearer ${studentToken}`)
          .expect(201);

        const enrollment = enrollmentResponse.body;
        expect(enrollment.sessionId).toBe(firstSession.id);

        // 5. Student의 수강신청 내역 확인
        const enrollmentsResponse = await testApp
          .request()
          .get('/class-sessions/student/enrollments')
          .set('Authorization', `Bearer ${studentToken}`)
          .expect(200);

        const studentEnrollments = enrollmentsResponse.body;
        expect(studentEnrollments.length).toBe(1);
        expect(studentEnrollments[0].sessionId).toBe(firstSession.id);

        // 6. Principal이 수강신청 현황 확인
        const sessionEnrollmentsResponse = await testApp
          .request()
          .get(`/principal/sessions/${firstSession.id}/enrollments`)
          .set('Authorization', `Bearer ${principalResult.token}`)
          .expect(200);

        const sessionEnrollments = sessionEnrollmentsResponse.body;
        expect(Array.isArray(sessionEnrollments)).toBe(true);
        expect(sessionEnrollments.length).toBe(1);
      });
    });
  });
});
