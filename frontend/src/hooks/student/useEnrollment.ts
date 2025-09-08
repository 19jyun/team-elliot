import { useCallback } from "react";
import { useAppDispatch } from "@/store/hooks";
import { toast } from "sonner";
import {
  addOptimisticEnrollment,
  replaceOptimisticEnrollment,
  removeOptimisticEnrollment,
  addOptimisticCalendarSession,
  replaceOptimisticCalendarSession,
  removeOptimisticCalendarSession,
} from "@/store/slices/studentSlice";
import { batchEnrollSessions } from "@/api/student";
import type { EnrollmentHistory } from "@/types/api/student";
import type { StudentClass } from "@/types/store/student";
import { extractErrorMessage } from "@/types/api/error";
import type { ClassSession } from "@/types/api/class";

export const useEnrollment = () => {
  const dispatch = useAppDispatch();

  const enrollSessions = useCallback(
    async (sessionIds: number[], availableSessions?: ClassSession[]) => {
      if (!sessionIds.length) {
        toast.error("수강신청할 세션을 선택해주세요.");
        return;
      }

      // 실제 세션 데이터에서 선택된 세션들 찾기
      const selectedSessions =
        availableSessions?.filter((session) =>
          sessionIds.includes(session.id)
        ) || [];

      // 낙관적 업데이트를 위한 실제 세션 데이터 기반 생성
      const optimisticEnrollments: (Omit<EnrollmentHistory, "id"> & {
        id: string;
        isOptimistic: boolean;
      })[] = selectedSessions.map((session, index) => ({
        id: `temp_${Date.now()}_${index}`,
        sessionId: session.id,
        session: {
          id: session.id,
          date: session.date,
          startTime: session.startTime,
          endTime: session.endTime,
          class: {
            id: session.class?.id || 0,
            className: session.class?.className || "수강신청 중...",
            teacherName: session.class?.teacher?.name || "선생님",
          },
        },
        enrolledAt: new Date().toISOString(),
        status: "PENDING" as const,
        isOptimistic: true,
      }));

      // 낙관적 캘린더 세션 데이터 생성 (실제 세션 데이터 기반)
      const optimisticCalendarSessions: (Omit<StudentClass, "id"> & {
        id: string;
        isOptimistic: boolean;
      })[] = selectedSessions.map((session, index) => ({
        id: `temp_calendar_${Date.now()}_${index}`,
        name: session.class?.className || "수강신청 중...",
        teacherName: session.class?.teacher?.name || "선생님",
        dayOfWeek: "월", // TODO: API에서 받아와야 함
        startTime: session.startTime,
        endTime: session.endTime,
        location: "수강신청 중...", // TODO: academy 정보는 별도로 받아와야 함
        date: session.date,
        currentStudents: session.currentStudents || 0,
        maxStudents: session.maxStudents || 10,
        classId: session.id,
        class: {
          id: session.class?.id || session.id,
          className: session.class?.className || "수강신청 중...",
          level: session.class?.level || "BEGINNER",
          tuitionFee: session.class?.tuitionFee
            ? parseInt(session.class.tuitionFee)
            : 50000,
          teacher: {
            id: session.class?.teacher?.id || 0,
            name: session.class?.teacher?.name || "선생님",
          },
        },
        isOptimistic: true,
      }));

      try {
        optimisticEnrollments.forEach((enrollment) => {
          dispatch(addOptimisticEnrollment(enrollment));
        });

        // 낙관적 캘린더 세션 추가
        optimisticCalendarSessions.forEach((session) => {
          dispatch(addOptimisticCalendarSession(session));
        });

        toast.success("수강신청을 처리하고 있습니다...", {
          description: "잠시만 기다려주세요.",
        });

        const response = await batchEnrollSessions({ sessionIds });

        if (response.data && response.data.success) {
          const enrolledSessionIds = response.data.enrolledSessions || [];

          optimisticEnrollments.forEach((optimisticEnrollment, index) => {
            const enrolledSessionId = enrolledSessionIds[index];
            if (enrolledSessionId) {
              // 실제 enrollment 객체 생성 (세션 ID를 기반으로)
              const realEnrollment: EnrollmentHistory = {
                id: Date.now() + index, // 임시 ID
                sessionId: enrolledSessionId,
                session: optimisticEnrollment.session,
                enrolledAt: new Date().toISOString(),
                status: "CONFIRMED",
                description: "수강신청 완료",
              };

              dispatch(
                replaceOptimisticEnrollment({
                  optimisticId: optimisticEnrollment.id,
                  realEnrollment: {
                    ...realEnrollment,
                    isOptimistic: false,
                  },
                })
              );
            }
          });

          // 실제 캘린더 세션으로 교체 (API 응답에서 세션 정보 추출)
          optimisticCalendarSessions.forEach((optimisticSession, index) => {
            const enrolledSessionId = enrolledSessionIds[index];
            if (enrolledSessionId) {
              // 원본 세션 데이터에서 해당 세션 찾기
              const originalSession = selectedSessions.find(
                (session) => session.id === enrolledSessionId
              );

              if (originalSession) {
                // 실제 세션 데이터로 캘린더 세션 생성
                const realCalendarSession: StudentClass = {
                  id: enrolledSessionId,
                  name: originalSession.class?.className || "수강 중",
                  teacherName: originalSession.class?.teacher?.name || "선생님",
                  dayOfWeek: "월", // TODO: API에서 받아와야 함
                  startTime: originalSession.startTime,
                  endTime: originalSession.endTime,
                  location: "수강 중", // TODO: API에서 받아와야 함
                  date: originalSession.date,
                  currentStudents: 1, // TODO: API에서 받아와야 함
                  maxStudents: 10, // TODO: API에서 받아와야 함
                  classId: enrolledSessionId,
                  class: {
                    id: originalSession.class?.id || 0,
                    className: originalSession.class?.className || "수강 중",
                    level: originalSession.class?.level || "BEGINNER",
                    tuitionFee: originalSession.class?.tuitionFee
                      ? parseInt(originalSession.class.tuitionFee)
                      : 50000,
                    teacher: {
                      id: originalSession.class?.teacher?.id || 0,
                      name: originalSession.class?.teacher?.name || "선생님",
                    },
                  },
                };

                dispatch(
                  replaceOptimisticCalendarSession({
                    optimisticId: optimisticSession.id,
                    realSession: realCalendarSession,
                  })
                );
              }
            }
          });

          const successCount = enrolledSessionIds.length;
          const failedCount = response.data.failedSessions?.length || 0;

          if (successCount > 0) {
            toast.success(`${successCount}개 수강신청이 완료되었습니다!`, {
              description:
                failedCount > 0
                  ? `${failedCount}개는 처리에 실패했습니다.`
                  : "승인 대기 중입니다.",
            });
          }

          if (failedCount > 0) {
            toast.error(`${failedCount}개 수강신청이 실패했습니다.`, {
              description: "다시 시도해주세요.",
            });
          }

          return response.data;
        } else {
          throw new Error("수강신청 처리에 실패했습니다.");
        }
      } catch (error: unknown) {
        // 4. 실패 시 낙관적 업데이트 롤백
        optimisticEnrollments.forEach((enrollment) => {
          dispatch(removeOptimisticEnrollment(enrollment.id));
        });

        // 낙관적 캘린더 세션 롤백
        optimisticCalendarSessions.forEach((session) => {
          dispatch(removeOptimisticCalendarSession(session.id));
        });

        toast.error(extractErrorMessage(error, "수강신청에 실패했습니다."));
        throw error;
      }
    },
    [dispatch]
  );

  return {
    enrollSessions,
  };
};
