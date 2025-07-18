import axiosInstance from "@/lib/axios";
import {
  TeacherProfileResponse,
  UpdateProfileRequest,
  UpdateProfileResponse,
  TeacherClassesResponse,
  TeacherClassesWithSessionsResponse,
  SessionEnrollmentsResponse,
  UpdateEnrollmentStatusRequest,
  UpdateEnrollmentStatusResponse,
  BatchUpdateEnrollmentStatusRequest,
  BatchUpdateEnrollmentStatusResponse,
  UpdateClassDetailsRequest,
  UpdateClassDetailsResponse,
  Academy,
  CreateAcademyRequest,
  ChangeAcademyRequest,
  CreateAndJoinAcademyRequest,
  CreateAndJoinAcademyResponse,
  UpdateAcademyRequest,
  LeaveAcademyResponse,
} from "@/types/api/teacher";

// 프로필 관련 API
export const getTeacherProfile = async (): Promise<TeacherProfileResponse> => {
  const response = await axiosInstance.get("/teachers/me");
  return response.data;
};

export const getTeacherProfileById = async (
  teacherId?: number
): Promise<TeacherProfileResponse> => {
  if (teacherId) {
    const response = await axiosInstance.get(`/teachers/${teacherId}/profile`);
    return response.data;
  } else {
    const response = await axiosInstance.get("/teachers/me");
    return response.data;
  }
};

export const updateTeacherProfile = async (
  data: UpdateProfileRequest
): Promise<UpdateProfileResponse> => {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (key === "photo" && value instanceof File) {
        formData.append(key, value);
      } else if (Array.isArray(value)) {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, String(value));
      }
    }
  });

  const response = await axiosInstance.put("/teachers/me/profile", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

// 클래스 관련 API
export const getTeacherClasses = async (): Promise<TeacherClassesResponse> => {
  const response = await axiosInstance.get("/teachers/me/classes");
  return response.data;
};

export const getTeacherClassesWithSessions =
  async (): Promise<TeacherClassesWithSessionsResponse> => {
    const response = await axiosInstance.get(
      "/teachers/me/classes-with-sessions"
    );
    return response.data;
  };

// 세션 관련 API
export const getSessionEnrollments = async (
  sessionId: number
): Promise<SessionEnrollmentsResponse> => {
  const response = await axiosInstance.get(
    `/class-sessions/${sessionId}/enrollments`
  );
  return response.data;
};

export const updateEnrollmentStatus = async (
  enrollmentId: number,
  data: UpdateEnrollmentStatusRequest
): Promise<UpdateEnrollmentStatusResponse> => {
  const response = await axiosInstance.put(
    `/class-sessions/enrollments/${enrollmentId}/status`,
    data
  );
  return response.data;
};

export const batchUpdateEnrollmentStatus = async (
  data: BatchUpdateEnrollmentStatusRequest
): Promise<BatchUpdateEnrollmentStatusResponse> => {
  const response = await axiosInstance.put(
    "/class-sessions/enrollments/batch-status",
    data
  );
  return response.data;
};

// 클래스 상세 정보 업데이트
export const updateClassDetails = async (
  classId: number,
  data: UpdateClassDetailsRequest
): Promise<UpdateClassDetailsResponse> => {
  const response = await axiosInstance.put(`/classes/${classId}/details`, data);
  return response.data;
};

// 학원 관리 API
export const getMyAcademy = async (): Promise<Academy | null> => {
  const response = await axiosInstance.get("/teachers/me/academy");
  return response.data;
};

export const changeAcademy = async (
  data: ChangeAcademyRequest
): Promise<Academy> => {
  const response = await axiosInstance.post(
    "/teachers/me/change-academy",
    data
  );
  return response.data;
};

export const createAcademy = async (
  data: CreateAcademyRequest
): Promise<Academy> => {
  const response = await axiosInstance.post(
    "/teachers/me/create-academy",
    data
  );
  return response.data;
};

export const createAndJoinAcademy = async (
  data: CreateAndJoinAcademyRequest
): Promise<CreateAndJoinAcademyResponse> => {
  const response = await axiosInstance.post(
    "/teachers/me/create-and-join-academy",
    data
  );
  return response.data;
};

// 학원 정보 수정 (관리자만)
export const updateAcademy = async (
  data: UpdateAcademyRequest
): Promise<Academy> => {
  const response = await axiosInstance.put("/teachers/me/academy", data);
  return response.data;
};

// 학원 탈퇴 (관리자 불가)
export const leaveAcademy = async (): Promise<LeaveAcademyResponse> => {
  const response = await axiosInstance.post("/teachers/me/leave-academy");
  return response.data;
};

// 수강 신청/환불 신청 관리 API
export const getTeacherSessionsWithPendingRequests = async (
  requestType: "enrollment" | "refund"
) => {
  const response = await axiosInstance.get(
    `/teachers/me/sessions-with-${requestType}-requests`
  );
  return response.data;
};

export const getSessionRequests = async (
  sessionId: number,
  requestType: "enrollment" | "refund"
) => {
  const response = await axiosInstance.get(
    `/class-sessions/${sessionId}/${requestType}-requests`
  );
  return response.data;
};

export const approveEnrollment = async (enrollmentId: number) => {
  const response = await axiosInstance.post(
    `/class-sessions/enrollments/${enrollmentId}/approve`
  );
  return response.data;
};

export const rejectEnrollment = async (
  enrollmentId: number,
  data: { reason: string; detailedReason?: string }
) => {
  const response = await axiosInstance.post(
    `/class-sessions/enrollments/${enrollmentId}/reject`,
    data
  );
  return response.data;
};

export const approveRefund = async (refundId: number) => {
  const response = await axiosInstance.post(`/refunds/${refundId}/approve`);
  return response.data;
};

export const rejectRefund = async (
  refundId: number,
  data: { reason: string; detailedReason?: string }
) => {
  const response = await axiosInstance.post(
    `/refunds/${refundId}/reject`,
    data
  );
  return response.data;
};
