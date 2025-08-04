import { usePrincipalCalendarApi } from "./usePrincipalCalendarApi";
import { useTeacherCalendarApi } from "./useTeacherCalendarApi";
import { useStudentCalendarApi } from "./useStudentCalendarApi";

// Role별 Calendar API Hook Factory
export function useRoleCalendarApi(role: "STUDENT" | "TEACHER" | "PRINCIPAL") {
  switch (role) {
    case "PRINCIPAL":
      return usePrincipalCalendarApi();
    case "TEACHER":
      return useTeacherCalendarApi();
    case "STUDENT":
      return useStudentCalendarApi();
    default:
      throw new Error(`Unknown role: ${role}`);
  }
}
