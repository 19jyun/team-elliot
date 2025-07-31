import {
  getPrincipalAcademy,
  getPrincipalAllClasses,
  getPrincipalAllTeachers,
  getPrincipalAllStudents,
  getPrincipalAllEnrollments,
  getPrincipalAllRefundRequests,
  getPrincipalProfile,
  getStudents,
  getTeachers,
  getClasses,
  getMyClasses,
  getTeacherClasses,
  getAcademyTeachers,
} from "@/api";
import type {
  User,
  Academy,
  Class,
  SessionEnrollment,
  RefundRequest,
  Teacher,
  Student,
} from "../types";

// 타입 변환 함수들
const transformAdminStudent = (student: any): Student => ({
  id: student.id,
  name: student.name,
  email: student.email || "",
  phoneNumber: student.phoneNumber,
});

const transformAdminTeacher = (teacher: any): Teacher => ({
  id: teacher.id,
  name: teacher.name,
  email: teacher.email || "",
  phoneNumber: teacher.phoneNumber,
  introduction: teacher.introduction,
  photoUrl: teacher.photoUrl,
});

const transformAdminClass = (cls: any): Class => ({
  id: cls.id,
  className: cls.name,
  classCode: cls.code || "",
  description: cls.description || "",
  maxStudents: cls.maxStudents,
  currentStudents: cls.currentStudents || 0,
  tuitionFee: cls.monthlyFee,
  teacherId: cls.teacherId,
  academyId: cls.academyId || 1,
  dayOfWeek: cls.dayOfWeek,
  startTime: cls.startTime,
  endTime: cls.endTime,
  level: cls.level,
  status: "ACTIVE",
  startDate: cls.startDate || "",
  endDate: cls.endDate || "",
  backgroundColor: cls.backgroundColor || "#e3f2fd",
  teacher: {
    id: cls.teacherId,
    name: cls.teacherName || "",
    photoUrl: "",
  },
  academy: {
    id: cls.academyId || 1,
    name: cls.academyName || "",
  },
});

const transformStudentClass = (cls: any): Class => ({
  id: cls.id,
  className: cls.name,
  classCode: cls.code || "",
  description: cls.description || "",
  maxStudents: cls.maxStudents || 0,
  currentStudents: cls.currentStudents || 0,
  tuitionFee: cls.fee || 0,
  teacherId: cls.teacherId || 0,
  academyId: cls.academyId || 1,
  dayOfWeek: cls.dayOfWeek,
  startTime: cls.startTime,
  endTime: cls.endTime,
  level: cls.level || "BEGINNER",
  status: "ACTIVE",
  startDate: cls.startDate || "",
  endDate: cls.endDate || "",
  backgroundColor: cls.backgroundColor || "#e3f2fd",
  teacher: {
    id: cls.teacherId || 0,
    name: cls.teacherName || "",
    photoUrl: "",
  },
  academy: {
    id: cls.academyId || 1,
    name: cls.academyName || "",
  },
});

const transformTeacherClass = (cls: any): Class => ({
  id: cls.id,
  className: cls.className,
  classCode: cls.code || "",
  description: cls.description || "",
  maxStudents: cls.maxStudents,
  currentStudents: cls.currentStudents,
  tuitionFee: cls.tuitionFee,
  teacherId: cls.teacherId || 0,
  academyId: cls.academyId || 1,
  dayOfWeek: cls.dayOfWeek,
  startTime: cls.startTime,
  endTime: cls.endTime,
  level: cls.level,
  status: "ACTIVE",
  startDate: cls.startDate,
  endDate: cls.endDate,
  backgroundColor: cls.backgroundColor || "#e3f2fd",
  teacher: {
    id: cls.teacherId || 0,
    name: cls.teacherName || "",
    photoUrl: "",
  },
  academy: {
    id: cls.academyId || 1,
    name: cls.academyName || "",
  },
});

// 사용자 정보 조회 (역할별로 다른 엔드포인트 사용)
export const fetchUserData = async (userId: number): Promise<User> => {
  // Principal의 경우 프로필 정보를 사용자 정보로 활용
  const profile = await getPrincipalProfile();
  return {
    id: profile.id,
    userId: profile.userId,
    name: profile.name,
    email: profile.email || "",
    role: "PRINCIPAL" as const,
    phoneNumber: profile.phoneNumber,
  };
};

// 학원 정보 조회 (Principal용)
export const fetchAcademyData = async (userId: number): Promise<Academy> => {
  return await getPrincipalAcademy();
};

// 수강신청 목록 조회 (Principal용)
export const fetchEnrollmentsData = async (
  userId: number
): Promise<SessionEnrollment[]> => {
  return await getPrincipalAllEnrollments();
};

// 환불 요청 목록 조회 (Principal용)
export const fetchRefundRequestsData = async (
  userId: number
): Promise<RefundRequest[]> => {
  return await getPrincipalAllRefundRequests();
};

// 클래스 목록 조회 (Principal용)
export const fetchClassesData = async (userId: number): Promise<Class[]> => {
  return await getPrincipalAllClasses();
};

// 선생님 목록 조회 (Principal용)
export const fetchTeachersData = async (userId: number): Promise<Teacher[]> => {
  return await getPrincipalAllTeachers();
};

// 학생 목록 조회 (Principal용)
export const fetchStudentsData = async (userId: number): Promise<Student[]> => {
  return await getPrincipalAllStudents();
};

// 사용자 프로필 정보 조회 (Principal용)
export const fetchUserProfileData = async (userId: number): Promise<any> => {
  return await getPrincipalProfile();
};

// Admin용 API 함수들
export const fetchAdminStudentsData = async (): Promise<Student[]> => {
  const response = await getStudents();
  return response.map(transformAdminStudent);
};

export const fetchAdminTeachersData = async (): Promise<Teacher[]> => {
  const response = await getTeachers();
  return response.map(transformAdminTeacher);
};

export const fetchAdminClassesData = async (): Promise<Class[]> => {
  const response = await getClasses();
  return response.map(transformAdminClass);
};

// Student용 API 함수들
export const fetchStudentClassesData = async (
  userId: number
): Promise<Class[]> => {
  const response = await getMyClasses();
  const allClasses = [
    ...response.enrollmentClasses,
    ...response.sessionClasses,
  ];
  return allClasses.map(transformStudentClass);
};

export const fetchStudentEnrollmentsData = async (
  userId: number
): Promise<SessionEnrollment[]> => {
  // Student용 수강신청 API가 없으므로 빈 배열 반환
  return [];
};

// Teacher용 API 함수들
export const fetchTeacherClassesData = async (
  userId: number
): Promise<Class[]> => {
  const response = await getTeacherClasses();
  return response.map(transformTeacherClass);
};

export const fetchTeacherStudentsData = async (
  userId: number
): Promise<Student[]> => {
  const response = await getAcademyTeachers();
  return response.map(transformAdminStudent);
};
