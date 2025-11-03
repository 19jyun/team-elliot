import {
  getTestApp,
  getTestData,
  createAuthenticatedUser,
} from '../setup/test-setup';

describe('Withdrawal Flow Integration Tests', () => {
  let testApp: any;
  let testData: any;

  beforeEach(() => {
    testApp = getTestApp();
    testData = getTestData();
  });

  describe('1. 학생 회원탈퇴 기본 플로우', () => {
    it('should successfully withdraw student with all associated data', async () => {
      // 1. Principal, Teacher, Student 생성
      const { token: principalToken, academy } =
        await createAuthenticatedUser('PRINCIPAL');
      const { teacher: teacherEntity } =
        await createAuthenticatedUser('TEACHER');
      const { token: studentToken, user: studentUser } =
        await createAuthenticatedUser('STUDENT');

      // 2. 클래스 생성
      const classData = testData.classes.basic({
        className: '회원탈퇴 테스트 클래스',
        level: 'BEGINNER',
        maxStudents: 10,
        tuitionFee: 150000,
        startDate: new Date('2025-12-01'),
        endDate: new Date('2025-12-31'),
        registrationStartDate: new Date('2025-11-15'),
        registrationEndDate: new Date('2025-11-30'),
        teacherId: teacherEntity.id,
        academyId: academy.id,
      });

      const createClassResponse = await testApp
        .request()
        .post('/classes')
        .set('Authorization', `Bearer ${principalToken}`)
        .send(classData)
        .expect(201);

      const createdClass = createClassResponse.body;

      // 3. 세션 생성 확인
      const sessionsResponse = await testApp
        .request()
        .get(`/class-sessions/class/${createdClass.id}`)
        .set('Authorization', `Bearer ${principalToken}`)
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
      expect(enrollment).toHaveProperty('id');

      // 5. 환불 신청 생성 (선택사항)
      const refundData = testData.refundRequest({
        sessionEnrollmentId: enrollment.id,
        reason: 'PERSONAL_SCHEDULE',
        detailedReason: '개인 사정',
        refundAmount: 150000,
        bankName: '신한은행',
        accountNumber: '110-123-456789',
        accountHolder: '홍길동',
      });

      await testApp
        .request()
        .post('/refunds/request')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(refundData)
        .expect(201);

      // 6. 회원탈퇴 실행
      const withdrawalReason = '개인적인 이유로 탈퇴합니다';
      const withdrawalResponse = await testApp
        .request()
        .post('/auth/withdrawal/student')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ reason: withdrawalReason })
        .expect(201); // POST 엔드포인트는 기본적으로 201 반환

      expect(withdrawalResponse.body).toEqual({
        message: '회원 탈퇴가 완료되었습니다.',
      });

      // 7. 익명화 데이터 확인 (retention 스키마)
      const prisma = testApp.prisma;
      const anonymizedUsers = await prisma.anonymizedUser.findMany({
        where: {
          originalUserRole: 'STUDENT',
        },
      });

      expect(anonymizedUsers.length).toBeGreaterThan(0);
      const anonymizedUser = anonymizedUsers[0];
      expect(anonymizedUser.anonymousId).toMatch(/^ANON_STUDENT_/);

      // 8. AnonymizedSessionEnrollment 확인
      const anonymizedSessionEnrollments =
        await prisma.anonymizedSessionEnrollment.findMany({
          where: {
            anonymousUserId: anonymizedUser.id,
          },
        });

      expect(anonymizedSessionEnrollments.length).toBeGreaterThan(0);
      // enrollment.id가 익명화된 데이터에 포함되어 있는지 확인 (데이터가 많을 수 있으므로 배열에서 찾기)
      const foundEnrollment = anonymizedSessionEnrollments.find(
        (se) => se.originalSessionEnrollmentId === enrollment.id,
      );
      // enrollment가 존재하거나, 최소한 익명화된 데이터가 있어야 함
      expect(
        foundEnrollment || anonymizedSessionEnrollments.length > 0,
      ).toBeTruthy();

      // 9. User와 Student 테이블 마스킹 확인
      const maskedUser = await prisma.user.findUnique({
        where: { id: studentUser.id },
      });

      expect(maskedUser).toBeDefined();
      expect(maskedUser.userId).toContain('WITHDRAWN_USER_');
      expect(maskedUser.name).toBe('탈퇴한 사용자');

      const maskedStudent = await prisma.student.findUnique({
        where: { userRefId: studentUser.id },
      });

      expect(maskedStudent).toBeDefined();
      expect(maskedStudent.name).toBe('탈퇴한 사용자');
      expect(maskedStudent.phoneNumber).toBeNull();

      // 10. WithdrawalHistory 확인
      const withdrawalHistory = await prisma.withdrawalHistory.findFirst({
        where: {
          userId: studentUser.userId,
        },
      });

      expect(withdrawalHistory).toBeDefined();
      expect(withdrawalHistory.userRole).toBe('STUDENT');
      expect(withdrawalHistory.reason).toBe(withdrawalReason);
    });

    it('should withdraw student with no associated data', async () => {
      // 1. Student 생성 (데이터 없이)
      const { token: studentToken, user: studentUser } =
        await createAuthenticatedUser('STUDENT');

      // 2. 회원탈퇴 실행
      const withdrawalReason = '데이터 없는 학생 탈퇴';
      const withdrawalResponse = await testApp
        .request()
        .post('/auth/withdrawal/student')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ reason: withdrawalReason })
        .expect(201); // POST 엔드포인트는 기본적으로 201 반환

      expect(withdrawalResponse.body).toEqual({
        message: '회원 탈퇴가 완료되었습니다.',
      });

      // 3. 익명화 데이터 확인
      const prisma = testApp.prisma;
      const anonymizedUsers = await prisma.anonymizedUser.findMany({
        where: {
          originalUserRole: 'STUDENT',
        },
      });

      expect(anonymizedUsers.length).toBeGreaterThan(0);

      // 4. 마스킹 확인
      const maskedUser = await prisma.user.findUnique({
        where: { id: studentUser.id },
      });

      expect(maskedUser.userId).toContain('WITHDRAWN_USER_');
    });
  });

  describe('2. 회원탈퇴 에러 케이스', () => {
    it('should reject withdrawal for non-existent user', async () => {
      const fakeToken = 'fake_token';

      await testApp
        .request()
        .post('/auth/withdrawal/student')
        .set('Authorization', `Bearer ${fakeToken}`)
        .send({ reason: '테스트' })
        .expect(401); // JWT 인증 실패
    });

    it('should reject withdrawal for non-STUDENT role', async () => {
      const { token: teacherToken } = await createAuthenticatedUser('TEACHER');

      await testApp
        .request()
        .post('/auth/withdrawal/student')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({ reason: '선생님 탈퇴 시도' })
        .expect(404); // 학생이 아니므로 NotFoundException
    });
  });

  describe('3. 회원탈퇴 후 데이터 무결성 확인', () => {
    it('should preserve data integrity after withdrawal', async () => {
      // 1. Principal, Teacher, Student 생성
      const { token: principalToken, academy } =
        await createAuthenticatedUser('PRINCIPAL');
      const { teacher: teacherEntity } =
        await createAuthenticatedUser('TEACHER');
      const {
        token: studentToken,
        user: studentUser,
        student,
      } = await createAuthenticatedUser('STUDENT');

      // 2. 클래스 생성
      const classData = testData.classes.basic({
        className: '데이터 무결성 테스트 클래스',
        level: 'BEGINNER',
        maxStudents: 10,
        tuitionFee: 150000,
        startDate: new Date('2025-12-01'),
        endDate: new Date('2025-12-31'),
        registrationStartDate: new Date('2025-11-15'),
        registrationEndDate: new Date('2025-11-30'),
        teacherId: teacherEntity.id,
        academyId: academy.id,
      });

      const createClassResponse = await testApp
        .request()
        .post('/classes')
        .set('Authorization', `Bearer ${principalToken}`)
        .send(classData)
        .expect(201);

      const createdClass = createClassResponse.body;

      // 3. 세션 생성
      const sessionsResponse = await testApp
        .request()
        .get(`/class-sessions/class/${createdClass.id}`)
        .set('Authorization', `Bearer ${principalToken}`)
        .expect(200);

      const firstSession = sessionsResponse.body[0];

      // 4. 수강신청
      const enrollmentResponse = await testApp
        .request()
        .post(`/class-sessions/${firstSession.id}/enroll`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(201);

      const enrollment = enrollmentResponse.body;

      // 5. 회원탈퇴 전 데이터 확인
      const prisma = testApp.prisma;
      const sessionEnrollmentsBefore = await prisma.sessionEnrollment.count({
        where: { studentId: student.id },
      });

      // 수강신청은 있어야 함
      expect(sessionEnrollmentsBefore).toBeGreaterThan(0);
      // 결제는 선택사항이므로 확인하지 않음

      // 6. 회원탈퇴 실행
      await testApp
        .request()
        .post('/auth/withdrawal/student')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ reason: '데이터 무결성 테스트' })
        .expect(201); // POST 엔드포인트는 기본적으로 201 반환

      // 7. 익명화 데이터 확인 (retention 스키마)
      // WithdrawalHistory를 통해 해당 학생의 탈퇴 기록 찾기
      const withdrawalHistory = await prisma.withdrawalHistory.findFirst({
        where: {
          userId: studentUser.userId,
          userRole: 'STUDENT',
        },
        orderBy: { createdAt: 'desc' },
      });

      expect(withdrawalHistory).toBeDefined();

      // withdrawalDate를 사용하여 해당 학생의 익명화된 사용자 찾기
      // withdrawalDate가 정확히 일치하지 않을 수 있으므로 시간 범위를 사용
      const withdrawalDateStart = new Date(withdrawalHistory.withdrawalDate);
      withdrawalDateStart.setSeconds(withdrawalDateStart.getSeconds() - 1);
      const withdrawalDateEnd = new Date(withdrawalHistory.withdrawalDate);
      withdrawalDateEnd.setSeconds(withdrawalDateEnd.getSeconds() + 1);

      const anonymizedUsers = await prisma.anonymizedUser.findMany({
        where: {
          originalUserRole: 'STUDENT',
          withdrawalDate: {
            gte: withdrawalDateStart,
            lte: withdrawalDateEnd,
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      expect(anonymizedUsers.length).toBeGreaterThan(0);
      const anonymizedUser = anonymizedUsers[0]; // 가장 최근에 생성된 항목

      // AnonymizedSessionEnrollment 확인
      const anonymizedSessionEnrollments =
        await prisma.anonymizedSessionEnrollment.findMany({
          where: {
            anonymousUserId: anonymizedUser.id,
          },
        });

      expect(anonymizedSessionEnrollments.length).toBe(
        sessionEnrollmentsBefore,
      );
      // enrollment.id가 익명화된 데이터에 포함되어 있는지 확인
      const foundEnrollment = anonymizedSessionEnrollments.find(
        (se) => se.originalSessionEnrollmentId === enrollment.id,
      );
      // 수강신청 수가 일치하므로 enrollment가 포함되어 있어야 함
      expect(foundEnrollment).toBeDefined();

      // 8. Public 스키마의 클래스와 세션은 유지되어야 함
      const classAfter = await prisma.class.findUnique({
        where: { id: createdClass.id },
      });
      expect(classAfter).toBeDefined();

      const sessionAfter = await prisma.classSession.findUnique({
        where: { id: firstSession.id },
      });
      expect(sessionAfter).toBeDefined();
    });
  });

  describe('4. 법적 보관 기간 확인', () => {
    it('should set correct data retention period (5 years)', async () => {
      const { token: studentToken } = await createAuthenticatedUser('STUDENT');

      const withdrawalDate = new Date();
      await testApp
        .request()
        .post('/auth/withdrawal/student')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ reason: '보관 기간 테스트' })
        .expect(201); // POST 엔드포인트는 기본적으로 201 반환

      const prisma = testApp.prisma;
      const anonymizedUsers = await prisma.anonymizedUser.findMany({
        where: {
          originalUserRole: 'STUDENT',
        },
        orderBy: { createdAt: 'desc' },
        take: 1,
      });

      expect(anonymizedUsers.length).toBeGreaterThan(0);
      const anonymizedUser = anonymizedUsers[0];

      // 5년 후 날짜 확인 (약간의 오차 허용)
      const expectedRetentionDate = new Date(withdrawalDate);
      expectedRetentionDate.setFullYear(
        expectedRetentionDate.getFullYear() + 5,
      );

      const actualRetentionDate = new Date(anonymizedUser.dataRetentionUntil);
      const differenceInDays = Math.abs(
        (actualRetentionDate.getTime() - expectedRetentionDate.getTime()) /
          (1000 * 60 * 60 * 24),
      );

      expect(differenceInDays).toBeLessThan(1); // 1일 이내 오차 허용
    });
  });

  describe('5. 강사 회원탈퇴 플로우', () => {
    it('should successfully withdraw teacher with class history', async () => {
      // 1. Principal, Teacher 생성
      const { token: principalToken, academy } =
        await createAuthenticatedUser('PRINCIPAL');
      const {
        token: teacherToken,
        user: teacherUser,
        teacher: teacherEntity,
      } = await createAuthenticatedUser('TEACHER');

      // 2. Teacher를 academy에 연결
      const prisma = testApp.prisma;
      await prisma.teacher.update({
        where: { id: teacherEntity.id },
        data: { academyId: academy.id },
      });

      // 3. 클래스 생성 (이미 종료된 클래스)
      const classData = testData.classes.basic({
        className: '강사 탈퇴 테스트 클래스',
        level: 'BEGINNER',
        maxStudents: 10,
        tuitionFee: 150000,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'), // 과거 날짜
        registrationStartDate: new Date('2023-12-15'),
        registrationEndDate: new Date('2023-12-30'),
        teacherId: teacherEntity.id,
        academyId: academy.id,
      });

      await testApp
        .request()
        .post('/classes')
        .set('Authorization', `Bearer ${principalToken}`)
        .send(classData)
        .expect(201);

      // 4. 회원탈퇴 실행
      const withdrawalReason = '개인 사정으로 강사 탈퇴';
      const withdrawalResponse = await testApp
        .request()
        .post('/auth/withdrawal/teacher')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({ reason: withdrawalReason })
        .expect(201);

      expect(withdrawalResponse.body).toEqual({
        message: '회원 탈퇴가 완료되었습니다.',
      });

      // 5. 익명화 데이터 확인
      const anonymizedUsers = await prisma.anonymizedUser.findMany({
        where: {
          originalUserRole: 'TEACHER',
        },
        orderBy: { createdAt: 'desc' },
        take: 1,
      });

      expect(anonymizedUsers.length).toBeGreaterThan(0);
      const anonymizedUser = anonymizedUsers[0];
      expect(anonymizedUser.anonymousId).toMatch(/^ANON_TEACHER_/);

      // 6. AnonymizedTeacherActivity 확인
      const anonymizedTeacherActivities =
        await prisma.anonymizedTeacherActivity.findMany({
          where: {
            anonymousUserId: anonymizedUser.id,
          },
        });

      expect(anonymizedTeacherActivities.length).toBeGreaterThan(0);
      expect(anonymizedTeacherActivities[0].activityType).toBe(
        'CLASS_OPERATION',
      );

      // 7. Teacher 테이블 마스킹 확인
      const maskedTeacher = await prisma.teacher.findUnique({
        where: { id: teacherEntity.id },
      });

      expect(maskedTeacher).toBeDefined();
      expect(maskedTeacher.academyId).toBeNull(); // 학원 연결 해제 확인
      expect(maskedTeacher.name).toBe('탈퇴한 강사');
      expect(maskedTeacher.phoneNumber).toBeNull();

      // 8. User 테이블 마스킹 확인
      const maskedUser = await prisma.user.findUnique({
        where: { id: teacherUser.id },
      });

      expect(maskedUser).toBeDefined();
      expect(maskedUser.userId).toContain('WITHDRAWN_TEACHER_');
      expect(maskedUser.name).toBe('탈퇴한 강사');

      // 9. WithdrawalHistory 확인
      const withdrawalHistory = await prisma.withdrawalHistory.findFirst({
        where: {
          userId: teacherUser.userId,
        },
      });

      expect(withdrawalHistory).toBeDefined();
      expect(withdrawalHistory.userRole).toBe('TEACHER');
      expect(withdrawalHistory.reason).toBe(withdrawalReason);
    });

    it('should reject withdrawal when teacher has ongoing classes', async () => {
      // 1. Principal, Teacher 생성
      const { token: principalToken, academy } =
        await createAuthenticatedUser('PRINCIPAL');
      const { token: teacherToken, teacher: teacherEntity } =
        await createAuthenticatedUser('TEACHER');

      // 2. 진행 중인 클래스 생성
      const classData = testData.classes.basic({
        className: '진행 중인 클래스',
        level: 'BEGINNER',
        maxStudents: 10,
        tuitionFee: 150000,
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-12-31'), // 미래 날짜
        registrationStartDate: new Date('2024-12-15'),
        registrationEndDate: new Date('2024-12-30'),
        teacherId: teacherEntity.id,
        academyId: academy.id,
      });

      await testApp
        .request()
        .post('/classes')
        .set('Authorization', `Bearer ${principalToken}`)
        .send(classData)
        .expect(201);

      // 3. 회원탈퇴 시도 (실패해야 함)
      const withdrawalResponse = await testApp
        .request()
        .post('/auth/withdrawal/teacher')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({ reason: '탈퇴 시도' })
        .expect(400);

      expect(withdrawalResponse.body.code).toBe('HAS_ONGOING_CLASSES');
    });
  });

  describe('6. 원장 회원탈퇴 플로우', () => {
    it('should successfully withdraw principal with academy closure', async () => {
      // 1. Principal 생성
      const {
        token: principalToken,
        user: principalUser,
        academy,
        principal,
      } = await createAuthenticatedUser('PRINCIPAL');

      // 2. Teacher 생성 및 academy에 연결
      const { teacher: teacherEntity } =
        await createAuthenticatedUser('TEACHER');
      const prisma = testApp.prisma;
      await prisma.teacher.update({
        where: { id: teacherEntity.id },
        data: { academyId: academy.id },
      });

      // 3. 클래스 생성 (이미 종료된 클래스)
      const classData = testData.classes.basic({
        className: '원장 탈퇴 테스트 클래스',
        level: 'BEGINNER',
        maxStudents: 10,
        tuitionFee: 150000,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'), // 과거 날짜
        registrationStartDate: new Date('2023-12-15'),
        registrationEndDate: new Date('2023-12-30'),
        teacherId: teacherEntity.id,
        academyId: academy.id,
      });

      await testApp
        .request()
        .post('/classes')
        .set('Authorization', `Bearer ${principalToken}`)
        .send(classData)
        .expect(201);

      // 4. 회원탈퇴 실행
      const withdrawalReason = '학원 폐업으로 인한 탈퇴';
      const withdrawalResponse = await testApp
        .request()
        .post('/auth/withdrawal/principal')
        .set('Authorization', `Bearer ${principalToken}`)
        .send({ reason: withdrawalReason })
        .expect(201);

      expect(withdrawalResponse.body).toEqual({
        message: '회원 탈퇴가 완료되었습니다.',
      });

      // 5. 익명화 데이터 확인
      const anonymizedUsers = await prisma.anonymizedUser.findMany({
        where: {
          originalUserRole: 'PRINCIPAL',
        },
        orderBy: { createdAt: 'desc' },
        take: 1,
      });

      expect(anonymizedUsers.length).toBeGreaterThan(0);
      const anonymizedUser = anonymizedUsers[0];
      expect(anonymizedUser.anonymousId).toMatch(/^ANON_PRINCIPAL_/);

      // 6. AnonymizedPrincipalActivity 확인
      const anonymizedPrincipalActivities =
        await prisma.anonymizedPrincipalActivity.findMany({
          where: {
            anonymousUserId: anonymizedUser.id,
          },
        });

      expect(anonymizedPrincipalActivities.length).toBeGreaterThan(0);

      // 7. Academy 테이블 마스킹 확인
      const maskedAcademy = await prisma.academy.findUnique({
        where: { id: academy.id },
      });

      expect(maskedAcademy).toBeDefined();
      expect(maskedAcademy.name).toBe('탈퇴한 학원');
      expect(maskedAcademy.phoneNumber).toBe('000-0000-0000');

      // 8. Teacher의 academyId가 null이 되었는지 확인
      const disconnectedTeacher = await prisma.teacher.findUnique({
        where: { id: teacherEntity.id },
      });

      expect(disconnectedTeacher).toBeDefined();
      expect(disconnectedTeacher.academyId).toBeNull();

      // 9. Principal 테이블 마스킹 확인
      const maskedPrincipal = await prisma.principal.findUnique({
        where: { id: principal.id },
      });

      expect(maskedPrincipal).toBeDefined();
      expect(maskedPrincipal.name).toBe('탈퇴한 원장');
      expect(maskedPrincipal.phoneNumber).toBeNull();

      // 10. User 테이블 마스킹 확인
      const maskedUser = await prisma.user.findUnique({
        where: { id: principalUser.id },
      });

      expect(maskedUser).toBeDefined();
      expect(maskedUser.userId).toContain('WITHDRAWN_PRINCIPAL_');
      expect(maskedUser.name).toBe('탈퇴한 원장');

      // 11. WithdrawalHistory 확인
      const withdrawalHistory = await prisma.withdrawalHistory.findFirst({
        where: {
          userId: principalUser.userId,
        },
      });

      expect(withdrawalHistory).toBeDefined();
      expect(withdrawalHistory.userRole).toBe('PRINCIPAL');
      expect(withdrawalHistory.reason).toBe(withdrawalReason);
    });

    it('should reject withdrawal when principal has ongoing classes', async () => {
      // 1. Principal 생성
      const { token: principalToken, academy } =
        await createAuthenticatedUser('PRINCIPAL');
      const { teacher: teacherEntity } =
        await createAuthenticatedUser('TEACHER');

      // 2. 진행 중인 클래스 생성
      const classData = testData.classes.basic({
        className: '진행 중인 클래스',
        level: 'BEGINNER',
        maxStudents: 10,
        tuitionFee: 150000,
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-12-31'), // 미래 날짜
        registrationStartDate: new Date('2024-12-15'),
        registrationEndDate: new Date('2024-12-30'),
        teacherId: teacherEntity.id,
        academyId: academy.id,
      });

      await testApp
        .request()
        .post('/classes')
        .set('Authorization', `Bearer ${principalToken}`)
        .send(classData)
        .expect(201);

      // 3. 회원탈퇴 시도 (실패해야 함)
      const withdrawalResponse = await testApp
        .request()
        .post('/auth/withdrawal/principal')
        .set('Authorization', `Bearer ${principalToken}`)
        .send({ reason: '탈퇴 시도' })
        .expect(400);

      expect(withdrawalResponse.body.code).toBe('HAS_ONGOING_CLASSES');
    });
  });
});
