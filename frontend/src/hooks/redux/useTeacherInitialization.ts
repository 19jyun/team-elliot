import { useEffect } from "react";
import { useRef } from "react";
import { useAppDispatch } from "@/store/hooks";
import { useSession } from "next-auth/react";
import {
  setTeacherRealTimeData,
  setLoading,
  setError,
} from "@/store/slices/teacherSlice";
import { getTeacherClassesWithSessions } from "@/api/teacher";
import { toast } from "sonner";
import type {
  ClassesWithSessionsByMonthResponse,
  SessionEnrollment,
} from "@/types/api/class";

export function useTeacherInitialization() {
  const dispatch = useAppDispatch();
  const { data: session, status } = useSession();
  const initializedRef = useRef(false);

  useEffect(() => {
    const initializeTeacherRealTimeData = async () => {
      // 이미 초기화되었거나 Teacher 역할이 아니면 초기화하지 않음
      if (initializedRef.current) return;
      if (
        status !== "authenticated" ||
        !session?.user ||
        session.user.role !== "TEACHER"
      ) {
        return;
      }

      initializedRef.current = true;

      try {
        dispatch(setLoading(true));
        dispatch(setError(null));

        // 실시간 업데이트가 필요한 데이터만 로드 (출석체크용 enrollment)
        const [classesWithSessionsResponse] = await Promise.all([
          getTeacherClassesWithSessions(),
        ]);

        const classesWithSessions = classesWithSessionsResponse.data;

        // 모든 enrollment 데이터를 하나의 배열로 추출
        const allEnrollments: (SessionEnrollment & {
          session: {
            id: number;
            date: string;
            startTime: string;
            endTime: string;
          };
          class: {
            id: number;
            className: string;
          };
        })[] = [];
        classesWithSessions?.classes?.forEach(
          (cls: ClassesWithSessionsByMonthResponse) => {
            cls.sessions?.forEach((_session) => {
              // sessions 배열에는 enrollments가 없으므로 빈 배열로 처리
              // 실제로는 API 응답 구조에 따라 조정 필요
            });
          }
        );

        // Redux 상태 업데이트 (실시간 데이터만)
        dispatch(
          setTeacherRealTimeData({
            enrollments: allEnrollments,
          })
        );

        toast.success("Teacher 실시간 데이터가 로드되었습니다.", {
          id: "teacher-init",
        });
      } catch (error: unknown) {
        console.error("❌ Teacher 실시간 데이터 초기화 실패:", error);

        const errorMessage =
          error.response?.data?.message || "실시간 데이터 로딩에 실패했습니다.";
        dispatch(setError(errorMessage));

        toast.error("Teacher 실시간 데이터 로딩 실패", {
          description: errorMessage,
          id: "teacher-init-error",
        });
      } finally {
        dispatch(setLoading(false));
      }
    };

    initializeTeacherRealTimeData();
  }, [dispatch, session, status]);

  return {
    isInitialized: status === "authenticated" && !!session?.user,
  };
}
