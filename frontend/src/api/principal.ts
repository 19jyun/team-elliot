import axiosInstance from "@/lib/axios";

// === Principal Dashboard Redux 데이터 초기화용 API ===

// PrincipalData 전체 초기화 (Redux용)
export const getPrincipalData = async () => {
  const response = await axiosInstance.get("/principal/me/data");
  return response.data;
};

// Principal 전용 API 함수들

// 1. Principal의 학원 정보 조회
export const getPrincipalAcademy = async () => {
  const response = await axiosInstance.get("/principal/academy");
  return response.data;
};

// 2. Principal의 학원에 속한 모든 세션 조회 (캘린더용)
export const getPrincipalAllSessions = async () => {
  const response = await axiosInstance.get("/principal/sessions");
  return response.data;
};

// 3. Principal의 학원에 속한 모든 클래스 조회
export const getPrincipalAllClasses = async () => {
  const response = await axiosInstance.get("/principal/classes");
  return response.data;
};

// 4. Principal의 학원에 속한 모든 선생님 조회
export const getPrincipalAllTeachers = async () => {
  const response = await axiosInstance.get("/principal/teachers");
  return response.data;
};

// 5. Principal의 학원에 속한 모든 수강생 조회
export const getPrincipalAllStudents = async () => {
  const response = await axiosInstance.get("/principal/students");
  return response.data;
};

// 6. Principal의 학원에 속한 모든 수강신청 조회 (Redux store용)
export const getPrincipalAllEnrollments = async () => {
  const response = await axiosInstance.get("/principal/enrollments");
  return response.data;
};

// 7. Principal의 학원에 속한 모든 환불요청 조회 (Redux store용)
export const getPrincipalAllRefundRequests = async () => {
  const response = await axiosInstance.get("/principal/refund-requests");
  return response.data;
};

// Principal의 세션 수강생 조회
export const getPrincipalSessionEnrollments = async (sessionId: number) => {
  const response = await axiosInstance.get(
    `/principal/sessions/${sessionId}/enrollments`
  );
  return response.data;
};

// Principal의 학원 정보 수정
export const updatePrincipalAcademy = async (data: {
  name?: string;
  phoneNumber?: string;
  address?: string;
  description?: string;
}) => {
  const response = await axiosInstance.put("/principal/academy", data);
  return response.data;
};

// Principal의 프로필 정보 조회
export const getPrincipalProfile = async (principalId?: number) => {
  const url = principalId
    ? `/principal/${principalId}/profile`
    : "/principal/profile";
  const response = await axiosInstance.get(url);
  return response.data;
};

// Principal의 프로필 정보 수정
export const updatePrincipalProfile = async (data: {
  name?: string;
  phoneNumber?: string;
  introduction?: string;
  education?: string[];
  certifications?: string[];
  bankName?: string;
  accountNumber?: string;
  accountHolder?: string;
}) => {
  const response = await axiosInstance.put("/principal/profile", data);
  return response.data;
};

// Principal의 프로필 사진 업로드
export const updatePrincipalProfilePhoto = async (photo: File) => {
  const formData = new FormData();
  formData.append("photo", photo);

  const response = await axiosInstance.put(
    "/principal/profile/photo",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};

// === Principal 수강 신청/환불 신청 관리 API ===

// 1. Principal의 세션별 요청 목록 조회
export const getPrincipalSessionsWithPendingRequests = async (
  requestType: "enrollment" | "refund"
) => {
  const response = await axiosInstance.get(
    `/principal/sessions-with-${requestType}-requests`
  );
  return response.data;
};

// 2. 특정 세션의 요청 목록 조회
export const getPrincipalSessionRequests = async (
  sessionId: number,
  requestType: "enrollment" | "refund"
) => {
  const response = await axiosInstance.get(
    `/principal/sessions/${sessionId}/${requestType}-requests`
  );
  return response.data;
};

// 3. 수강 신청 승인
export const approvePrincipalEnrollment = async (enrollmentId: number) => {
  const response = await axiosInstance.post(
    `/principal/enrollments/${enrollmentId}/approve`
  );
  return response.data;
};

// 4. 수강 신청 거절
export const rejectPrincipalEnrollment = async (
  enrollmentId: number,
  data: { reason: string; detailedReason?: string }
) => {
  const response = await axiosInstance.post(
    `/principal/enrollments/${enrollmentId}/reject`,
    data
  );
  return response.data;
};

// 5. 환불 요청 승인
export const approvePrincipalRefund = async (refundId: number) => {
  const response = await axiosInstance.post(
    `/principal/refunds/${refundId}/approve`
  );
  return response.data;
};

// 6. 환불 요청 거절
export const rejectPrincipalRefund = async (
  refundId: number,
  data: { reason: string; detailedReason?: string }
) => {
  const response = await axiosInstance.put(
    `/principal/refunds/${refundId}/reject`,
    data
  );
  return response.data;
};

// === Principal 선생님/수강생 관리 API ===

// 1. Principal의 학원 소속 선생님 목록 조회 (기존 API 활용)
export const getPrincipalAcademyTeachers = async () => {
  const response = await axiosInstance.get("/principal/teachers");
  return response.data;
};

// 2. Principal의 학원 소속 수강생 목록 조회 (기존 API 활용)
export const getPrincipalAcademyStudents = async () => {
  const response = await axiosInstance.get("/principal/students");
  return response.data;
};

// 3. 선생님을 학원에서 제거
export const removePrincipalTeacher = async (teacherId: number) => {
  const response = await axiosInstance.delete(
    `/principal/teachers/${teacherId}`
  );
  return response.data;
};

// 6. 수강생을 학원에서 제거
export const removePrincipalStudent = async (studentId: number) => {
  const response = await axiosInstance.delete(
    `/principal/students/${studentId}`
  );
  return response.data;
};

// 7. 수강생의 세션 수강 현황 조회
export const getPrincipalStudentSessionHistory = async (studentId: number) => {
  const response = await axiosInstance.get(
    `/principal/students/${studentId}/sessions`
  );
  return response.data;
};
