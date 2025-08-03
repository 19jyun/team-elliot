import { useAppSelector } from "@/store/hooks";
import { useMemo } from "react";
import type {
  PrincipalData,
  StudentData,
  TeacherData,
  AdminData,
} from "@/store/types";

// 역할별 데이터를 동적으로 가져오는 범용 훅
export function useRoleData() {
  const {
    user,
    principalData,
    studentData,
    teacherData,
    adminData,
    isLoading,
    error,
  } = useAppSelector((state) => state.appData);

  const roleData = useMemo(() => {
    switch (user?.role) {
      case "PRINCIPAL":
        return principalData;
      case "STUDENT":
        return studentData;
      case "TEACHER":
        return teacherData;
      case "ADMIN":
        return adminData;
      default:
        return null;
    }
  }, [user?.role, principalData, studentData, teacherData, adminData]);

  return {
    roleData,
    user,
    isLoading,
    error,
  };
}

// 타입 가드 함수들
export function isPrincipalData(data: any): data is PrincipalData {
  return (
    data && "userProfile" in data && "academy" in data && "enrollments" in data
  );
}

export function isStudentData(data: any): data is StudentData {
  return data && "profile" in data;
}

export function isTeacherData(data: any): data is TeacherData {
  return data && "profile" in data;
}

export function isAdminData(data: any): data is AdminData {
  return data && "students" in data && "teachers" in data;
}
