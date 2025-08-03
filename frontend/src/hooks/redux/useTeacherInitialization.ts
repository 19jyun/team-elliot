import { useEffect } from "react";
import { useAppDispatch } from "@/store/hooks";
import { useSession } from "next-auth/react";
import {
  setTeacherData,
  setLoading,
  setError,
} from "@/store/slices/teacherSlice";
import { getTeacherData } from "@/api/teacher";
import { toast } from "sonner";

export function useTeacherInitialization() {
  const dispatch = useAppDispatch();
  const { data: session, status } = useSession();

  useEffect(() => {
    const initializeTeacherData = async () => {
      // Teacher 역할이 아니면 초기화하지 않음
      if (
        status !== "authenticated" ||
        !session?.user ||
        session.user.role !== "TEACHER"
      ) {
        return;
      }

      try {
        dispatch(setLoading(true));
        dispatch(setError(null));


        // TeacherData 전체 조회
        const teacherData = await getTeacherData();

        // Redux 상태 업데이트
        dispatch(setTeacherData(teacherData));

        toast.success("Teacher 대시보드가 로드되었습니다.");
      } catch (error: any) {
        console.error("❌ Teacher 데이터 초기화 실패:", error);

        const errorMessage =
          error.response?.data?.message || "데이터 로딩에 실패했습니다.";
        dispatch(setError(errorMessage));

        toast.error("Teacher 데이터 로딩 실패", {
          description: errorMessage,
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
