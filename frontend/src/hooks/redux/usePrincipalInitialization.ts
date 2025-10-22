import { useEffect } from "react";
import { useRef } from "react";
import { useAppDispatch } from "@/store/hooks";
import { useSession } from "@/lib/auth/AuthProvider";
import {
  setPrincipalData,
  setLoading,
  setError,
  setCalendarSessions,
  setCalendarRange,
} from "@/store/slices/principalSlice";
import { extractErrorMessage } from "@/types/api/error";
import {
  getPrincipalAllEnrollments,
  getPrincipalAllRefundRequests,
  getPrincipalAllSessions,
} from "@/api/principal";
import { toast } from "sonner";

export function usePrincipalInitialization() {
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
    const initializePrincipalData = async () => {
      // 이미 초기화되었거나 Principal 역할이 아니면 초기화하지 않음
      if (initializedRef.current) return;
      if (
        status !== "authenticated" ||
        !session?.user ||
        session.user.role !== "PRINCIPAL"
      ) {
        return;
      }

      initializedRef.current = true;

      try {
        dispatch(setLoading(true));
        dispatch(setError(null));

        // 실시간 업데이트가 필요한 데이터와 캘린더 데이터 로드
        const [enrollmentsResponse, refundRequestsResponse, sessionsResponse] =
          await Promise.all([
            getPrincipalAllEnrollments(),
            getPrincipalAllRefundRequests(),
            getPrincipalAllSessions(),
          ]);

        const enrollments = enrollmentsResponse.data || [];
        const refundRequests = refundRequestsResponse.data || [];
        const calendarSessions = sessionsResponse.data || [];

        // 디버깅: 환불 요청 데이터 확인
        console.log("환불 요청 API 응답:", refundRequests);
        console.log("환불 요청 개수:", refundRequests?.length || 0);
        if (refundRequests && refundRequests.length > 0) {
          console.log(
            "첫 번째 환불 요청 구조:",
            JSON.stringify(refundRequests[0], null, 2)
          );
        }

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

        // Redux 상태 업데이트 (실시간 데이터 + 캘린더 데이터)
        dispatch(
          setPrincipalData({
            enrollments,
            refundRequests,
            calendarSessions,
            calendarRange,
          })
        );

        toast.success("Principal 실시간 데이터가 로드되었습니다.", {
          id: "principal-init",
        });
      } catch (error: unknown) {
        console.error("❌ Principal 실시간 데이터 초기화 실패:", error);

        const errorMessage = extractErrorMessage(
          error,
          "실시간 데이터 로딩에 실패했습니다."
        );
        dispatch(setError(errorMessage));

        toast.error("Principal 실시간 데이터 로딩 실패", {
          description: errorMessage,
          id: "principal-init-error",
        });
      } finally {
        dispatch(setLoading(false));
      }
    };

    initializePrincipalData();
  }, [dispatch, session, status]);

  return {
    isInitialized: status === "authenticated" && !!session?.user,
  };
}
