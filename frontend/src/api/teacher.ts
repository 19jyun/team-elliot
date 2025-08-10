import axiosInstance from "@/lib/axios";
import {
  TeacherProfileResponse,
  UpdateProfileRequest,
  UpdateProfileResponse,
  TeacherClassesWithSessionsResponse,
  SessionEnrollmentsResponse,
  UpdateEnrollmentStatusRequest,
  UpdateEnrollmentStatusResponse,
  BatchUpdateEnrollmentStatusRequest,
  BatchUpdateEnrollmentStatusResponse,
} from "@/types/api/teacher";

// 프로필 관련 API
export const getTeacherProfile = async (): Promise<TeacherProfileResponse> => {
  const response = await axiosInstance.get("/teachers/me");
  return response.data;
};

// ID 기반 조회는 백엔드 미지원 → 제거

export const updateTeacherProfile = async (
  data: UpdateProfileRequest
): Promise<UpdateProfileResponse> => {
  const response = await axiosInstance.put("/teachers/me/profile", data);
  return response.data;
};

export const updateTeacherProfilePhoto = async (
  photo: File
): Promise<UpdateProfileResponse> => {
  const formData = new FormData();
  formData.append("photo", photo);

  const response = await axiosInstance.put(
    "/teachers/me/profile/photo",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};

// 클래스 관련 API
// 교사용: 내 클래스 및 세션 묶음 조회

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

// 클래스 상세 수정은 원장 전용 → 제거

// 학원 관련 API (교사용)
export const getMyAcademy = async (): Promise<any | null> => {
  const response = await axiosInstance.get("/teachers/me/academy");
  return response.data;
};

export const changeAcademy = async (data: { code: string }): Promise<any> => {
  const response = await axiosInstance.post(
    "/teachers/me/change-academy",
    data
  );
  return response.data;
};

// 백엔드 미지원: 학원 생성/생성+가입 API 제거

// 백엔드 미지원: 학원 수정 제거

export const leaveAcademy = async (): Promise<any> => {
  const response = await axiosInstance.post("/teachers/me/leave-academy");
  return response.data;
};

export const requestJoinAcademy = async (data: {
  code: string;
}): Promise<any> => {
  const response = await axiosInstance.post(
    "/teachers/me/request-join-academy",
    data
  );
  return response.data;
};
// 백엔드 미지원: 학원 선생 목록/원장 정보/Redux 초기화 API 제거
