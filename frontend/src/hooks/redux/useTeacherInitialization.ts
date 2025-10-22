import { useEffect } from "react";
import { useRef } from "react";
import { useAppDispatch } from "@/store/hooks";
import { useSession } from "@/lib/auth/AuthProvider";
import {
  setTeacherData,
  setLoading,
  setError,
} from "@/store/slices/teacherSlice";
import { extractErrorMessage } from "@/types/api/error";
import { getTeacherClassesWithSessions } from "@/api/teacher";
import { toast } from "sonner";
import type { TeacherSession } from "@/types/api/teacher";
export function useTeacherInitialization() {
  const dispatch = useAppDispatch();
  const { data: session, status } = useSession();
  const initializedRef = useRef(false);

  // 로그아웃 시 초기화 상태 리셋
  useEffect(() => {
    const handleLogoutCleanup = () => {
      initializedRef.current = false;
    };

    window.addEventListener("logout-cleanup", handleLogoutCleanup);
    return () =>
      window.removeEventListener("logout-cleanup", handleLogoutCleanup);
  }, []);

  useEffect(() => {
    const initializeTeacherData = async () => {
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

        // 캘린더 데이터 로드
        const response = await getTeacherClassesWithSessions();
        const data = response.data;
        const calendarSessions = (data?.sessions || []) as TeacherSession[];

        // 캘린더 범위 설정 (현재 월부터 3개월)
        const now = new Date();
        const calendarRange = {
          startDate: new Date(
            now.getFullYear(),
            now.getMonth(),
            1
          ).toISOString(),
          endDate: new Date(
            now.getFullYear(),
            now.getMonth() + 2,
            0
          ).toISOString(),
        };

        // Redux 상태 업데이트 (캘린더 데이터만)
        dispatch(
          setTeacherData({
            calendarSessions,
            calendarRange,
          })
        );

        toast.success("Teacher 캘린더 데이터가 로드되었습니다.", {
          id: "teacher-init",
        });
      } catch (error: unknown) {
        console.error("❌ Teacher 캘린더 데이터 초기화 실패:", error);

        const errorMessage = extractErrorMessage(
          error,
          "캘린더 데이터 로딩에 실패했습니다."
        );
        dispatch(setError(errorMessage));

        toast.error("Teacher 캘린더 데이터 로딩 실패", {
          description: errorMessage,
          id: "teacher-init-error",
        });
      } finally {
        dispatch(setLoading(false));
      }
    };

    initializeTeacherData();
  }, [dispatch, session, status]);

  return {
    isInitialized: status === "authenticated" && !!session?.user,
  };
}
