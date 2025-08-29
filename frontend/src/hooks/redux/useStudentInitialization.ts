import { useEffect } from "react";
import { useRef } from "react";
import { useAppDispatch } from "@/store/hooks";
import { useSession } from "next-auth/react";
import {
  setStudentData,
  setLoading,
  setError,
} from "@/store/slices/studentSlice";
import {
  getMyClasses,
  getMyProfile,
  getEnrollmentHistory,
  getCancellationHistory,
} from "@/api/student";
import { getMyAcademies } from "@/api/student";
import { getStudentAvailableSessionsForEnrollment } from "@/api/student";
import { toast } from "sonner";

export function useStudentInitialization() {
  const dispatch = useAppDispatch();
  const { data: session, status } = useSession();
  const initializedRef = useRef(false);

  useEffect(() => {
    const initializeStudentData = async () => {
      // 이미 초기화되었거나 Student 역할이 아니면 초기화하지 않음
      if (initializedRef.current) return;
      if (
        status !== "authenticated" ||
        !session?.user ||
        session.user.role !== "STUDENT"
      ) {
        return;
      }

      initializedRef.current = true;

      try {
        dispatch(setLoading(true));
        dispatch(setError(null));

        // 1. 수강중인 클래스/세션 정보
        const myClasses = await getMyClasses();

        // 2. 개인 정보
        const myProfile = await getMyProfile();

        // 3. 수강 신청/결제 내역
        const enrollmentHistoryResponse = await getEnrollmentHistory();
        const enrollmentHistory = enrollmentHistoryResponse.data;

        // 4. 환불/취소 내역
        const cancellationHistoryResponse = await getCancellationHistory();
        const cancellationHistory = cancellationHistoryResponse.data;

        // 캘린더 데이터 추출
        const calendarSessions = myClasses.data?.sessionClasses || [];
        const calendarRange = myClasses.data?.calendarRange || null;

        // Redux 상태 업데이트 (캘린더 데이터 포함)
        dispatch(
          setStudentData({
            enrollmentHistory,
            cancellationHistory,
            calendarSessions,
            calendarRange,
          })
        );

        toast.success("Student 대시보드가 로드되었습니다.", {
          id: "student-init",
        });
      } catch (error: any) {
        console.error("❌ Student 데이터 초기화 실패:", error);

        const errorMessage =
          error.response?.data?.message || "데이터 로딩에 실패했습니다.";
        dispatch(setError(errorMessage));

        toast.error("Student 데이터 로딩 실패", {
          description: errorMessage,
          id: "student-init-error",
        });
      } finally {
        dispatch(setLoading(false));
      }
    };

    initializeStudentData();
  }, [dispatch, session, status]);

  return {
    isInitialized: status === "authenticated" && !!session?.user,
  };
}
