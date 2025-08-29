import { useCallback } from "react";
import { useAppDispatch } from "@/store/hooks";
import { toast } from "sonner";
import {
  addOptimisticEnrollment,
  replaceOptimisticEnrollment,
  removeOptimisticEnrollment,
} from "@/store/slices/studentSlice";
import { batchEnrollSessions } from "@/api/student";
import type { EnrollmentHistory } from "@/types/api/student";

export const useEnrollment = () => {
  const dispatch = useAppDispatch();

  const enrollSessions = useCallback(
    async (sessionIds: number[]) => {
      if (!sessionIds.length) {
        toast.error("수강신청할 세션을 선택해주세요.");
        return;
      }

      // 낙관적 업데이트를 위한 임시 데이터 생성
      const optimisticEnrollments: (Omit<EnrollmentHistory, "id"> & {
        id: string;
        isOptimistic: boolean;
      })[] = sessionIds.map((sessionId, index) => ({
        id: `temp_${Date.now()}_${index}`,
        sessionId,
        session: {
          id: sessionId,
          date: new Date().toISOString().split("T")[0],
          startTime: "09:00",
          endTime: "10:00",
          class: {
            id: 0,
            className: "수강신청 중...",
            teacherName: "선생님",
          },
        },
        enrolledAt: new Date().toISOString(),
        status: "PENDING" as const,
        isOptimistic: true,
      }));

      try {
        optimisticEnrollments.forEach((enrollment) => {
          dispatch(addOptimisticEnrollment(enrollment));
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
      } catch (error: any) {
        // 4. 실패 시 낙관적 업데이트 롤백
        optimisticEnrollments.forEach((enrollment) => {
          dispatch(removeOptimisticEnrollment(enrollment.id));
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
