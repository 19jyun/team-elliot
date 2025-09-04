import { useAppSelector } from "@/store/hooks";
import { useMemo } from "react";
import type { PrincipalData, StudentData, TeacherData } from "@/store/types";

// 역할별 데이터를 동적으로 가져오는 범용 훅
export function useRoleData() {
  const { user, isLoading, error } = useAppSelector((state) => state.common);
  const principalData = useAppSelector((state) => state.principal.data);
  const studentData = useAppSelector((state) => state.student.data);
  const teacherData = useAppSelector((state) => state.teacher.data);

  const roleData = useMemo(() => {
    switch (user?.role) {
      case "PRINCIPAL":
        return principalData;
      case "STUDENT":
        return studentData;
      case "TEACHER":
        return teacherData;
      default:
        return null;
    }
  }, [user?.role, principalData, studentData, teacherData]);

  return {
    roleData,
    user,
    isLoading,
    error,
  };
}

// 타입 가드 함수들
export function isPrincipalData(data: unknown): data is PrincipalData {
  return (
    data !== null &&
    typeof data === "object" &&
    "userProfile" in data &&
    "academy" in data &&
    "enrollments" in data
  );
}

export function isStudentData(data: unknown): data is StudentData {
  return data !== null && typeof data === "object" && "profile" in data;
}

export function isTeacherData(data: unknown): data is TeacherData {
  return data !== null && typeof data === "object" && "profile" in data;
}

// ADMIN 제거됨
