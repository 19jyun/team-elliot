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

        const response = await batchEnrollSessions(sessionIds);

        if (response.data && response.data.success > 0) {
          const enrollments = response.data.enrollments || [];

          optimisticEnrollments.forEach((optimisticEnrollment, index) => {
            const realEnrollment = enrollments[index];
            if (realEnrollment) {
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
            const realEnrollment = enrollments[index];
            if (realEnrollment) {
              // 원본 세션 데이터에서 해당 세션 찾기
              const originalSession = selectedSessions.find(
                (session) => session.id === realEnrollment.sessionId
              );

              // 실제 세션 데이터로 캘린더 세션 생성
              const realCalendarSession: StudentClass = {
                id: realEnrollment.sessionId,
                name: realEnrollment.session.class.className,
                teacherName: realEnrollment.session.class.teacherName,
                dayOfWeek: "월", // TODO: API에서 받아와야 함
                startTime: realEnrollment.session.startTime,
                endTime: realEnrollment.session.endTime,
                location: "수강 중", // TODO: API에서 받아와야 함
                date: realEnrollment.session.date,
                currentStudents: 1, // TODO: API에서 받아와야 함
                maxStudents: 10, // TODO: API에서 받아와야 함
                classId: realEnrollment.sessionId,
                class: {
                  id: realEnrollment.session.class.id,
                  className: realEnrollment.session.class.className,
                  level:
                    originalSession?.class?.level ||
                    realEnrollment.session.class.level ||
                    "BEGINNER", // 원본 세션 데이터에서 가져옴
                  tuitionFee: originalSession?.class?.tuitionFee
                    ? parseInt(originalSession.class.tuitionFee)
                    : realEnrollment.session.class.tuitionFee
                    ? parseInt(realEnrollment.session.class.tuitionFee)
                    : 50000, // 원본 세션 데이터에서 가져옴
                  teacher: {
                    id:
                      originalSession?.class?.teacher?.id ||
                      realEnrollment.session.class.teacher?.id ||
                      0, // 원본 세션 데이터에서 가져옴
                    name: realEnrollment.session.class.teacherName,
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
          });

          const successCount = enrollments.length;
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

        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "수강신청에 실패했습니다.";
        toast.error(errorMessage);
        throw error;
      }
    },
    [dispatch]
  );

  return {
    enrollSessions,
  };
};
