import { get, post, put, del } from "./apiClient";
import type { ApiResponse } from "@/types/api";

// PrincipalData 전체 초기화 (Redux용)
export const getPrincipalData = (): Promise<ApiResponse<any>> => {
  return get<ApiResponse<any>>("/principal/me/data");
};

// Principal 전용 API 함수들

// 1. Principal의 학원 정보 조회
export const getPrincipalAcademy = (): Promise<ApiResponse<any>> => {
  return get<ApiResponse<any>>("/principal/academy");
};

// 2. Principal의 학원에 속한 모든 세션 조회 (캘린더용)
export const getPrincipalAllSessions = (): Promise<ApiResponse<any>> => {
  return get<ApiResponse<any>>("/principal/sessions");
};

// 3. Principal의 학원에 속한 모든 클래스 조회
export const getPrincipalAllClasses = (): Promise<ApiResponse<any>> => {
  return get<ApiResponse<any>>("/principal/classes");
};

// Principal의 클래스 생성
export const createPrincipalClass = (data: {
  className: string;
  description: string;
  maxStudents: number;
  tuitionFee: number;
  teacherId: number;
  dayOfWeek: string;
  level: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  backgroundColor?: string;
}): Promise<ApiResponse<any>> => {
  return post<ApiResponse<any>>("/principal/classes", data);
};

// 4. Principal의 학원에 속한 모든 선생님 조회
export const getPrincipalAllTeachers = (): Promise<ApiResponse<any>> => {
  return get<ApiResponse<any>>("/principal/teachers");
};

// 5. Principal의 학원에 속한 모든 수강생 조회
export const getPrincipalAllStudents = (): Promise<ApiResponse<any>> => {
  return get<ApiResponse<any>>("/principal/students");
};

// 6. Principal의 학원에 속한 모든 수강신청 조회 (Redux store용)
export const getPrincipalAllEnrollments = (): Promise<ApiResponse<any>> => {
  return get<ApiResponse<any>>("/principal/enrollments");
};

// 7. Principal의 학원에 속한 모든 환불요청 조회 (Redux store용)
export const getPrincipalAllRefundRequests = (): Promise<ApiResponse<any>> => {
  return get<ApiResponse<any>>("/principal/refund-requests");
};

// Principal의 세션 수강생 조회
export const getPrincipalSessionEnrollments = (
  sessionId: number
): Promise<ApiResponse<any>> => {
  return get<ApiResponse<any>>(`/principal/sessions/${sessionId}/enrollments`);
};

// === Principal 세션 컨텐츠 관리 API ===
export const getSessionContents = (
  sessionId: number
): Promise<ApiResponse<any>> => {
  return get<ApiResponse<any>>(`/principal/sessions/${sessionId}/contents`);
};

export const addSessionContent = (
  sessionId: number,
  data: { poseId: number; note?: string }
): Promise<ApiResponse<any>> => {
  return post<ApiResponse<any>>(
    `/principal/sessions/${sessionId}/contents`,
    data
  );
};

export const updateSessionContent = (
  sessionId: number,
  contentId: number,
  data: { poseId?: number; note?: string }
): Promise<ApiResponse<any>> => {
  return put<ApiResponse<any>>(
    `/principal/sessions/${sessionId}/contents/${contentId}`,
    data
  );
};

export const deleteSessionContent = (
  sessionId: number,
  contentId: number
): Promise<ApiResponse<any>> => {
  return del<ApiResponse<any>>(
    `/principal/sessions/${sessionId}/contents/${contentId}`
  );
};

export const reorderSessionContents = (
  sessionId: number,
  data: { orderedContentIds: number[] }
): Promise<ApiResponse<any>> => {
  return put<ApiResponse<any>>(
    `/principal/sessions/${sessionId}/contents/reorder`,
    data
  );
};

// Principal의 학원 정보 수정
export const updatePrincipalAcademy = (data: {
  name?: string;
  phoneNumber?: string;
  address?: string;
  description?: string;
}): Promise<ApiResponse<any>> => {
  return put<ApiResponse<any>>("/principal/academy", data);
};

// Principal의 프로필 정보 조회
export const getPrincipalProfile = (
  principalId?: number
): Promise<ApiResponse<any>> => {
  const url = principalId
    ? `/principal/${principalId}/profile`
    : "/principal/profile";
  return get<ApiResponse<any>>(url);
};

// Principal의 프로필 정보 수정
export const updatePrincipalProfile = (data: {
  name?: string;
  phoneNumber?: string;
  introduction?: string;
  education?: string[];
  certifications?: string[];
  bankName?: string;
  accountNumber?: string;
  accountHolder?: string;
}): Promise<ApiResponse<any>> => {
  return put<ApiResponse<any>>("/principal/profile", data);
};

// Principal의 프로필 사진 업로드
export const updatePrincipalProfilePhoto = (
  photo: File
): Promise<ApiResponse<any>> => {
  const formData = new FormData();
  formData.append("photo", photo);

  return put<ApiResponse<any>>("/principal/profile/photo", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// === Principal 수강 신청/환불 신청 관리 API ===

// 1. Principal의 세션별 요청 목록 조회
export const getPrincipalSessionsWithPendingRequests = (
  requestType: "enrollment" | "refund"
): Promise<ApiResponse<any>> => {
  return get<ApiResponse<any>>(
    `/principal/sessions-with-${requestType}-requests`
  );
};

// 2. 특정 세션의 요청 목록 조회
export const getPrincipalSessionRequests = (
  sessionId: number,
  requestType: "enrollment" | "refund"
): Promise<ApiResponse<any>> => {
  return get<ApiResponse<any>>(
    `/principal/sessions/${sessionId}/${requestType}-requests`
  );
};

// 3. 수강 신청 승인
export const approvePrincipalEnrollment = (
  enrollmentId: number
): Promise<ApiResponse<any>> => {
  return post<ApiResponse<any>>(
    `/principal/enrollments/${enrollmentId}/approve`
  );
};

// 4. 수강 신청 거절
export const rejectPrincipalEnrollment = (
  enrollmentId: number,
  data: { reason: string; detailedReason?: string }
): Promise<ApiResponse<any>> => {
  return post<ApiResponse<any>>(
    `/principal/enrollments/${enrollmentId}/reject`,
    data
  );
};

// 5. 환불 요청 승인
export const approvePrincipalRefund = (
  refundId: number
): Promise<ApiResponse<any>> => {
  return post<ApiResponse<any>>(`/principal/refunds/${refundId}/approve`);
};

// 6. 환불 요청 거절
export const rejectPrincipalRefund = (
  refundId: number,
  data: { reason: string; detailedReason?: string }
): Promise<ApiResponse<any>> => {
  return put<ApiResponse<any>>(`/principal/refunds/${refundId}/reject`, data);
};

// === Principal 선생님/수강생 관리 API ===

// 1. Principal의 학원 소속 선생님 목록 조회 (기존 API 활용)
export const getPrincipalAcademyTeachers = (): Promise<ApiResponse<any>> => {
  return get<ApiResponse<any>>("/principal/teachers");
};

// 2. Principal의 학원 소속 수강생 목록 조회 (기존 API 활용)
export const getPrincipalAcademyStudents = (): Promise<ApiResponse<any>> => {
  return get<ApiResponse<any>>("/principal/students");
};

// 3. 선생님을 학원에서 제거
export const removePrincipalTeacher = (
  teacherId: number
): Promise<ApiResponse<any>> => {
  return del<ApiResponse<any>>(`/principal/teachers/${teacherId}`);
};

// 6. 수강생을 학원에서 제거
export const removePrincipalStudent = (
  studentId: number
): Promise<ApiResponse<any>> => {
  return del<ApiResponse<any>>(`/principal/students/${studentId}`);
};

// 7. 수강생의 세션 수강 현황 조회
export const getPrincipalStudentSessionHistory = (
  studentId: number
): Promise<ApiResponse<any>> => {
  return get<ApiResponse<any>>(`/principal/students/${studentId}/sessions`);
};
