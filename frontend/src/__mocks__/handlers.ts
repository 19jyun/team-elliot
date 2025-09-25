import { http, HttpResponse } from "msw";

// API 모킹 핸들러들
export const handlers = [
  // 인증 관련 API (백엔드 엔드포인트로 변경)
  http.post("*/auth/login", () => {
    return HttpResponse.json({
      access_token: "mock-access-token",
      user: {
        id: 1,
        userId: "testuser",
        name: "Test User",
        role: "STUDENT",
      },
    });
  }),

  http.post("*/auth/logout", () => {
    return HttpResponse.json({ message: "로그아웃되었습니다" });
  }),

  // 토큰 갱신 API
  http.post("*/auth/refresh", () => {
    return HttpResponse.json({
      access_token: "new-refreshed-token",
      expires_in: 3600,
      token_type: "Bearer",
      user: {
        id: 1,
        userId: "1",
        name: "Test User",
        role: "STUDENT",
      },
    });
  }),

  // 학생 관련 API
  http.get("/api/students/profile", () => {
    return HttpResponse.json({
      id: "1",
      userId: "testuser",
      name: "Test Student",
      role: "STUDENT",
      academyId: "1",
      academyName: "Test Academy",
    });
  }),

  http.get("/api/students/classes", () => {
    return HttpResponse.json([
      {
        id: "1",
        name: "Ballet Class 1",
        description: "Beginner ballet class",
        teacherName: "Teacher 1",
        schedule: "Monday 10:00-11:00",
        status: "ACTIVE",
      },
    ]);
  }),

  // 선생님 관련 API
  http.get("/api/teachers/profile", () => {
    return HttpResponse.json({
      id: "1",
      userId: "teacher1",
      name: "Test Teacher",
      role: "TEACHER",
      academyId: "1",
      academyName: "Test Academy",
    });
  }),

  http.get("/api/teachers/classes", () => {
    return HttpResponse.json([
      {
        id: "1",
        name: "Ballet Class 1",
        description: "Beginner ballet class",
        studentCount: 10,
        schedule: "Monday 10:00-11:00",
        status: "ACTIVE",
      },
    ]);
  }),

  // 학생 학원 목록 API
  http.get("/api/academy/my/list", () => {
    return HttpResponse.json([
      {
        id: 1,
        name: "Test Academy",
        address: "Test Address",
        phoneNumber: "010-1234-5678",
        description: "Test Academy Description",
        isJoined: true,
      },
    ]);
  }),

  // 원장 관련 API
  http.get("/api/principals/profile", () => {
    return HttpResponse.json({
      id: "1",
      userId: "principal1",
      name: "Test Principal",
      role: "PRINCIPAL",
      academyId: "1",
      academyName: "Test Academy",
    });
  }),

  http.get("/api/principals/dashboard", () => {
    return HttpResponse.json({
      totalStudents: 50,
      totalTeachers: 5,
      totalClasses: 10,
      pendingEnrollments: 3,
      recentActivities: [
        {
          id: "1",
          type: "ENROLLMENT",
          message: "New student enrolled",
          timestamp: "2024-01-15T10:00:00Z",
        },
      ],
    });
  }),

  // 클래스 관련 API
  http.get("/api/classes", () => {
    return HttpResponse.json([
      {
        id: "1",
        name: "Ballet Class 1",
        description: "Beginner ballet class",
        teacherId: "1",
        teacherName: "Teacher 1",
        schedule: "Monday 10:00-11:00",
        maxStudents: 15,
        currentStudents: 10,
        status: "ACTIVE",
      },
    ]);
  }),

  // 클래스 세션 관련 API
  http.get("/api/class-sessions", () => {
    return HttpResponse.json([
      {
        id: "1",
        class: {
          id: "1",
          className: "Ballet Class 1",
          level: "BEGINNER",
          description: "Beginner ballet class",
        },
        schedule: "Monday 10:00-11:00",
        status: "ACTIVE",
      },
      {
        id: "2",
        class: {
          id: "2",
          className: "Ballet Class 2",
          level: "INTERMEDIATE",
          description: "Intermediate ballet class",
        },
        schedule: "Wednesday 14:00-15:00",
        status: "ACTIVE",
      },
    ]);
  }),

  // 학생 수강신청 가능한 클래스 세션 API (백엔드 엔드포인트로 변경)
  http.get("*/class-sessions/student/available-enrollment", () => {
    return HttpResponse.json({
      sessions: [
        {
          id: 1,
          classId: 1,
          date: "2024-01-15",
          startTime: "10:00",
          endTime: "11:00",
          maxStudents: 15,
          currentStudents: 10,
          isEnrollable: true,
          isFull: false,
          isPastStartTime: false,
          isAlreadyEnrolled: false,
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z",
          class: {
            id: 1,
            className: "Ballet Class 1",
            level: "BEGINNER",
            tuitionFee: "100000",
            teacher: {
              id: 1,
              name: "Teacher 1",
            },
            academy: {
              id: 1,
              name: "Test Academy",
            },
          },
        },
        {
          id: 2,
          classId: 2,
          date: "2024-01-17",
          startTime: "14:00",
          endTime: "15:00",
          maxStudents: 12,
          currentStudents: 8,
          isEnrollable: true,
          isFull: false,
          isPastStartTime: false,
          isAlreadyEnrolled: false,
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z",
          class: {
            id: 2,
            className: "Ballet Class 2",
            level: "INTERMEDIATE",
            tuitionFee: "120000",
            teacher: {
              id: 2,
              name: "Teacher 2",
            },
            academy: {
              id: 1,
              name: "Test Academy",
            },
          },
        },
      ],
      calendarRange: {
        startDate: "2024-01-01",
        endDate: "2024-12-31",
      },
    });
  }),

  // 학생 등록 관련 API
  http.post("/api/students/enroll", () => {
    return HttpResponse.json({
      success: true,
      enrollmentId: "enrollment-123",
      message: "Enrollment successful",
    });
  }),

  // 에러 응답 예시
  http.get("/api/error", () => {
    return HttpResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }),

  // 네트워크 에러 예시
  http.get("/api/network-error", () => {
    return new Response(null, { status: 0 });
  }),
];
