"use client";

import { useMemo } from "react";
import type { QueryKey } from "@tanstack/react-query";
import { useSession } from "@/lib/auth/AuthProvider";
import { useCalendarSync } from "@/hooks/useCalendarSync";
import { useStudentCalendarSessions } from "@/hooks/queries/student/useStudentCalendarSessions";
import { useTeacherCalendarSessions } from "@/hooks/queries/teacher/useTeacherCalendarSessions";
import { usePrincipalCalendarSessions } from "@/hooks/queries/principal/usePrincipalCalendarSessions";
import { useCalendarAutoSync } from "@/hooks/calendar/useCalendarAutoSync";
import { queryKeys } from "@/lib/react-query/queryKeys";
import type { UnifiedCalendarSession } from "@/services/calendarSyncService";

export function CalendarSyncManager() {
  const { data: session } = useSession();
  const role = (session?.user?.role ?? "STUDENT") as
    | "STUDENT"
    | "TEACHER"
    | "PRINCIPAL";
  const { syncStatus } = useCalendarSync(role);

  const studentQuery = useStudentCalendarSessions(
    undefined,
    role === "STUDENT" && syncStatus.isEnabled
  );
  const teacherQuery = useTeacherCalendarSessions(
    undefined,
    role === "TEACHER" && syncStatus.isEnabled
  );
  const principalQuery = usePrincipalCalendarSessions(
    undefined,
    role === "PRINCIPAL" && syncStatus.isEnabled
  );

  const { sessions, queryKey } = useMemo<{
    sessions: UnifiedCalendarSession[] | undefined;
    queryKey: QueryKey;
  }>(() => {
    switch (role) {
      case "TEACHER":
        return {
          sessions: teacherQuery.data as UnifiedCalendarSession[] | undefined,
          queryKey: queryKeys.teacher.calendarSessions.list(undefined),
        };
      case "PRINCIPAL":
        return {
          sessions: principalQuery.data as UnifiedCalendarSession[] | undefined,
          queryKey: queryKeys.principal.calendarSessions.list(undefined),
        };
      case "STUDENT":
      default:
        return {
          sessions: studentQuery.data as UnifiedCalendarSession[] | undefined,
          queryKey: queryKeys.student.calendarSessions.list(undefined),
        };
    }
  }, [role, studentQuery.data, teacherQuery.data, principalQuery.data]);

  useCalendarAutoSync({
    sessions,
    isEnabled: syncStatus.isEnabled,
    queryKey,
  });

  return null;
}

