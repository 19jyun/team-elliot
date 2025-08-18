import {
  getTestApp,
  getTestData,
  createAuthenticatedUser,
} from '../setup/test-setup';

describe('Refund Flow Integration Tests', () => {
  let testApp: any;
  let testData: any;

  beforeEach(() => {
    testApp = getTestApp();
    testData = getTestData();
  });

  describe('1. 환불 신청 플로우', () => {
    it('should create a refund request with valid data', async () => {
      // 1. Principal, Teacher, Student 생성
      const { token: principalToken, academy } =
        await createAuthenticatedUser('PRINCIPAL');
      const { user: teacher } = await createAuthenticatedUser('TEACHER');
      const { token: studentToken } = await createAuthenticatedUser('STUDENT');

      // 2. 클래스 생성
      const classData = testData.classes.basic({
        className: '환불 테스트 발레 클래스',
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

      // 3. 자동 생성된 세션들 확인
      const sessionsResponse = await testApp
        .request()
        .get(`/class-sessions/class/${createdClass.id}`)
        .set('Authorization', `Bearer ${principalToken}`)
        .expect(200);

      const createdSessions = sessionsResponse.body;
      expect(createdSessions.length).toBeGreaterThan(0);

      // 4. Student가 첫 번째 세션에 수강신청
      const firstSession = createdSessions[0];
      const enrollmentResponse = await testApp
        .request()
        .post(`/class-sessions/${firstSession.id}/enroll`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(201);

      const enrollment = enrollmentResponse.body;

      // 5. 환불 신청 생성
      const refundData = testData.refundRequest({
        sessionEnrollmentId: enrollment.id,
        reason: 'PERSONAL_SCHEDULE',
        detailedReason: '개인 사정으로 인한 수강 중단',
        refundAmount: 150000,
        bankName: '신한은행',
        accountNumber: '110-123-456789',
        accountHolder: '홍길동',
      });

      const response = await testApp
        .request()
        .post('/refunds/request')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(refundData)
        .expect(201);

      const refundRequest = response.body;
      console.log('Refund Request Created:', refundRequest);

      expect(refundRequest).toHaveProperty('id');
      expect(refundRequest.sessionEnrollmentId).toBe(enrollment.id);
      expect(refundRequest.reason).toBe('PERSONAL_SCHEDULE');
      expect(refundRequest.status).toBe('PENDING');
      expect(refundRequest.refundAmount).toBe('150000');
    });
  });

  describe('2. 원장 환불 승인 플로우', () => {
    it('should allow principal to approve refund request', async () => {
      // 1. Principal, Teacher, Student 생성
      const { token: principalToken, academy } =
        await createAuthenticatedUser('PRINCIPAL');
      const { user: teacher } = await createAuthenticatedUser('TEACHER');
      const { token: studentToken } = await createAuthenticatedUser('STUDENT');

      // 2. 클래스 생성
      const classData = testData.classes.basic({
        className: '환불 승인 테스트 클래스',
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

      // 3. 자동 생성된 세션들 확인
      const sessionsResponse = await testApp
        .request()
        .get(`/class-sessions/class/${createdClass.id}`)
        .set('Authorization', `Bearer ${principalToken}`)
        .expect(200);

      const createdSessions = sessionsResponse.body;

      // 4. Student가 첫 번째 세션에 수강신청
      const firstSession = createdSessions[0];
      const enrollmentResponse = await testApp
        .request()
        .post(`/class-sessions/${firstSession.id}/enroll`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(201);

      const enrollment = enrollmentResponse.body;

      // 5. 환불 신청 생성
      const refundData = testData.refundRequest({
        sessionEnrollmentId: enrollment.id,
        reason: 'HEALTH_ISSUE',
        detailedReason: '건강상의 이유로 수강 중단',
        refundAmount: 200000,
        bankName: '국민은행',
        accountNumber: '123-456-789012',
        accountHolder: '김철수',
      });

      const refundResponse = await testApp
        .request()
        .post('/refunds/request')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(refundData)
        .expect(201);

      const refundRequest = refundResponse.body;

      // 6. Principal이 환불 신청 승인
      const approvalResponse = await testApp
        .request()
        .post(`/principal/refunds/${refundRequest.id}/approve`)
        .set('Authorization', `Bearer ${principalToken}`)
        .expect(201);

      const approvedRefund = approvalResponse.body;
      console.log('Approved Refund:', approvedRefund);

      expect(approvedRefund.status).toBe('APPROVED');
    });
  });

  describe('3. 전체 환불 플로우 통합 테스트', () => {
    it('should complete full refund flow: request → approve → verify', async () => {
      // 1. Principal, Teacher, Student 생성
      const { token: principalToken, academy } =
        await createAuthenticatedUser('PRINCIPAL');
      const { user: teacher } = await createAuthenticatedUser('TEACHER');
      const { token: studentToken } = await createAuthenticatedUser('STUDENT');

      // 2. 클래스 생성
      const classData = testData.classes.basic({
        className: '통합 환불 테스트 클래스',
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
      console.log('Created Class for Refund Test:', createdClass);

      // 3. 자동 생성된 세션들 확인
      const sessionsResponse = await testApp
        .request()
        .get(`/class-sessions/class/${createdClass.id}`)
        .set('Authorization', `Bearer ${principalToken}`)
        .expect(200);

      const createdSessions = sessionsResponse.body;
      console.log('Created Sessions for Refund Test:', createdSessions);

      // 4. Student가 첫 번째 세션에 수강신청
      const firstSession = createdSessions[0];
      const enrollmentResponse = await testApp
        .request()
        .post(`/class-sessions/${firstSession.id}/enroll`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(201);

      const enrollment = enrollmentResponse.body;
      console.log('Student Enrollment:', enrollment);

      // 5. 환불 신청 생성
      const refundData = testData.refundRequest({
        sessionEnrollmentId: enrollment.id,
        reason: 'DISSATISFACTION',
        detailedReason: '수업 품질에 대한 불만으로 인한 환불 요청',
        refundAmount: 250000,
        bankName: '우리은행',
        accountNumber: '1002-123-456789',
        accountHolder: '박영희',
      });

      const refundResponse = await testApp
        .request()
        .post('/refunds/request')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(refundData)
        .expect(201);

      const refundRequest = refundResponse.body;
      console.log('Refund Request:', refundRequest);

      expect(refundRequest.status).toBe('PENDING');
      expect(refundRequest.reason).toBe('DISSATISFACTION');

      // 6. Principal이 환불 신청 승인
      const approvalResponse = await testApp
        .request()
        .post(`/principal/refunds/${refundRequest.id}/approve`)
        .set('Authorization', `Bearer ${principalToken}`)
        .expect(201);

      const approvedRefund = approvalResponse.body;
      console.log('Approved Refund:', approvedRefund);

      expect(approvedRefund.status).toBe('APPROVED');

      // 7. 환불 신청 상태 확인
      const refundStatusResponse = await testApp
        .request()
        .get(`/refunds/${refundRequest.id}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      const refundStatus = refundStatusResponse.body;
      console.log('Refund Status:', refundStatus);

      expect(refundStatus.status).toBe('APPROVED');
    });
  });
});
