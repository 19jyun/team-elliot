import { useCallback } from "react";
import { useAppDispatch } from "@/store/hooks";
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
        throw new Error("수강신청할 세션을 선택해주세요.");
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
      })[] = selectedSessions.map((session, _index) => ({
        id: session.id.toString(), // 실제 세션 ID 사용
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
        // 낙관적 업데이트 추가
        optimisticEnrollments.forEach((enrollment) => {
          dispatch(addOptimisticEnrollment(enrollment));
        });

        // 낙관적 캘린더 세션 추가
        optimisticCalendarSessions.forEach((session) => {
          dispatch(addOptimisticCalendarSession(session));
        });

        const response = await batchEnrollSessions({ sessionIds });

        // 백엔드 응답 구조: { success: boolean, enrolledSessions: [], failedSessions: [] }
        if (response.data) {
          const { success, enrolledSessions, failedSessions } = response.data;

          // 성공한 수강신청들 처리
          if (success && enrolledSessions && enrolledSessions.length > 0) {
            enrolledSessions.forEach(
              (enrolledSessionId: number, index: number) => {
                const optimisticEnrollment = optimisticEnrollments[index];
                if (optimisticEnrollment) {
                  // 실제 enrollment 객체 생성
                  const realEnrollment: EnrollmentHistory = {
                    id: enrolledSessionId,
                    sessionId: enrolledSessionId,
                    session: optimisticEnrollment.session,
                    enrolledAt: new Date().toISOString(),
                    status: "PENDING",
                    description: "수강신청 완료",
                  };

                  dispatch(
                    replaceOptimisticEnrollment({
                      optimisticId: optimisticEnrollment.id,
                      realEnrollment: realEnrollment,
                    })
                  );
                }
              }
            );

            // 성공한 캘린더 세션들 처리
            enrolledSessions.forEach(
              (enrolledSessionId: number, index: number) => {
                const optimisticSession = optimisticCalendarSessions[index];
                if (optimisticSession) {
                  const originalSession = selectedSessions.find(
                    (session) => session.id === sessionIds[index]
                  );

                  if (originalSession) {
                    const realCalendarSession: StudentClass = {
                      id: enrolledSessionId,
                      name: originalSession.class?.className || "수강 중",
                      teacherName:
                        originalSession.class?.teacher?.name || "선생님",
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
                        className:
                          originalSession.class?.className || "수강 중",
                        level: originalSession.class?.level || "BEGINNER",
                        tuitionFee: originalSession.class?.tuitionFee
                          ? parseInt(originalSession.class.tuitionFee)
                          : 50000,
                        teacher: {
                          id: originalSession.class?.teacher?.id || 0,
                          name:
                            originalSession.class?.teacher?.name || "선생님",
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
              }
            );
          }

          // 실패한 세션들 처리
          if (failedSessions && failedSessions.length > 0) {
            // 실패한 세션들의 낙관적 업데이트 롤백
            failedSessions.forEach(
              (failedSession: { sessionId: number; reason: string }) => {
                const failedIndex = sessionIds.indexOf(failedSession.sessionId);
                if (failedIndex !== -1) {
                  const optimisticEnrollment =
                    optimisticEnrollments[failedIndex];
                  const optimisticSession =
                    optimisticCalendarSessions[failedIndex];

                  if (optimisticEnrollment) {
                    dispatch(
                      removeOptimisticEnrollment(optimisticEnrollment.id)
                    );
                  }
                  if (optimisticSession) {
                    dispatch(
                      removeOptimisticCalendarSession(optimisticSession.id)
                    );
                  }
                }
              }
            );
          }

          return response.data;
        } else {
          throw new Error("수강신청 처리에 실패했습니다.");
        }
      } catch (error: unknown) {
        // 실패 시 낙관적 업데이트 롤백
        optimisticEnrollments.forEach((enrollment) => {
          dispatch(removeOptimisticEnrollment(enrollment.id));
        });

        // 낙관적 캘린더 세션 롤백
        optimisticCalendarSessions.forEach((session) => {
          dispatch(removeOptimisticCalendarSession(session.id));
        });

        // 에러 메시지는 컴포넌트에서 처리하도록 제거
        throw error;
      }
    },
    [dispatch]
  );

  return {
    enrollSessions,
  };
};
