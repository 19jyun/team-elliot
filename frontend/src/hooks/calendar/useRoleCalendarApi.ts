import { usePrincipalCalendarApi } from "./usePrincipalCalendarApi";
import { useTeacherCalendarApi } from "./useTeacherCalendarApi";
import { useStudentCalendarApi } from "./useStudentCalendarApi";
import type { Session } from "@/lib/auth/AuthProvider";

// Role별 Calendar API Hook Factory
export function useRoleCalendarApi(
  role: "STUDENT" | "TEACHER" | "PRINCIPAL",
  session: Session | null
) {
  // 모든 Hook을 최상위에서 호출 (조건부 Hook 호출 문제 해결)
  const principalCalendarApi = usePrincipalCalendarApi(session);
  const teacherCalendarApi = useTeacherCalendarApi(session);
  const studentCalendarApi = useStudentCalendarApi();

  // 조건부로 적절한 API 반환
  switch (role) {
    case "PRINCIPAL":
      return principalCalendarApi;
    case "TEACHER":
      return teacherCalendarApi;
    case "STUDENT":
      return studentCalendarApi;
    default:
      throw new Error(`Unknown role: ${role}`);
  }
}
