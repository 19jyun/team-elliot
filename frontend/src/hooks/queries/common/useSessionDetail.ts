import React from "react";
import { useSession } from "@/lib/auth/AuthProvider";
import { useTeacherCalendarSession } from "@/hooks/queries/teacher/useTeacherCalendarSessions";
import { usePrincipalCalendarSession } from "@/hooks/queries/principal/usePrincipalCalendarSessions";
import { toClassSessionForCalendar } from "@/lib/adapters/teacher";
import { convertPrincipalSessionToClassSessionWithCounts } from "@/lib/adapters/principal";
import type { ClassSessionWithCounts } from "@/types/api/class";
import type { TeacherSession } from "@/types/api/teacher";
import type { PrincipalClassSession } from "@/types/api/principal";

/**
 * 공통 세션 상세 조회 훅
 * role에 따라 적절한 캘린더 세션 목록에서 세션을 찾아서 ClassSessionWithCounts로 변환
 */
export function useSessionDetail(sessionId: number | null) {
  const { data: session } = useSession();
  const role = (session?.user?.role ?? "STUDENT") as
    | "STUDENT"
    | "TEACHER"
    | "PRINCIPAL";

  // Teacher용 세션 조회
  const teacherSessionQuery = useTeacherCalendarSession(sessionId || 0);

  // Principal용 세션 조회
  const principalSessionQuery = usePrincipalCalendarSession(sessionId || 0);

  // role에 따라 적절한 쿼리 결과 사용
  const sessionData =
    role === "TEACHER"
      ? teacherSessionQuery.data
      : role === "PRINCIPAL"
      ? principalSessionQuery.data
      : null;

  const isLoading =
    role === "TEACHER"
      ? teacherSessionQuery.isLoading
      : role === "PRINCIPAL"
      ? principalSessionQuery.isLoading
      : false;

  const error =
    role === "TEACHER"
      ? teacherSessionQuery.error
      : role === "PRINCIPAL"
      ? principalSessionQuery.error
      : null;

  // 세션 데이터를 ClassSessionWithCounts로 변환
  const convertedSession: ClassSessionWithCounts | null = React.useMemo(() => {
    if (!sessionData || !sessionId) return null;

    if (role === "TEACHER") {
      const teacherSession = sessionData as TeacherSession;
      // TeacherSession을 ClassSessionWithCounts로 변환
      const classSession = toClassSessionForCalendar(teacherSession);
      return {
        ...classSession,
        enrollmentCount: teacherSession.enrollmentCount || 0,
        confirmedCount: teacherSession.confirmedCount || 0,
        sessionSummary: teacherSession.sessionSummary || null,
      } as ClassSessionWithCounts;
    } else if (role === "PRINCIPAL") {
      const principalSession = sessionData as PrincipalClassSession;
      return convertPrincipalSessionToClassSessionWithCounts(principalSession);
    }

    return null;
  }, [sessionData, role, sessionId]);

  return {
    data: convertedSession,
    isLoading,
    error,
  };
}
