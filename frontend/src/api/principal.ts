import axiosInstance from "@/lib/axios";

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
}) => {
  const response = await axiosInstance.put("/principal/profile", data);
  return response.data;
};
