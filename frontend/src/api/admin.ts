import { post } from "./apiClient";

// 임시 호환용: 관리자 기능 제거 후 남은 호출을 /auth/signup으로 위임
// 새 흐름에서는 선생님이 직접 회원가입하거나(역할: TEACHER), 원장은 코드를 공유해 초대합니다.

type CreateTeacherRequest = {
  name: string;
  userId: string;
  password: string;
  phoneNumber?: string;
  introduction?: string;
};

export const createTeacher = (data: CreateTeacherRequest) =>
  post("/auth/signup", { ...data, role: "TEACHER" });
