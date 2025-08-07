import { useEffect } from "react";
import { useAppDispatch } from "@/store/hooks";
import { useSession } from "next-auth/react";
import {
  setPrincipalData,
  setLoading,
  setError,
} from "@/store/slices/principalSlice";
import {
  getPrincipalAllEnrollments,
  getPrincipalAllRefundRequests,
} from "@/api/principal";
import { toast } from "sonner";

export function usePrincipalInitialization() {
  const dispatch = useAppDispatch();
  const { data: session, status } = useSession();

  useEffect(() => {
    const initializePrincipalData = async () => {
      // Principal 역할이 아니면 초기화하지 않음
      if (
        status !== "authenticated" ||
        !session?.user ||
        session.user.role !== "PRINCIPAL"
      ) {
        return;
      }

      try {
        dispatch(setLoading(true));
        dispatch(setError(null));

        // 실시간 업데이트가 필요한 데이터만 로드
        const [enrollments, refundRequests] = await Promise.all([
          getPrincipalAllEnrollments(),
          getPrincipalAllRefundRequests(),
        ]);

        // 디버깅: 환불 요청 데이터 확인
        console.log("환불 요청 API 응답:", refundRequests);
        console.log("환불 요청 개수:", refundRequests?.length || 0);

        // Redux 상태 업데이트 (실시간 데이터만)
        dispatch(
          setPrincipalData({
            enrollments,
            refundRequests,
          })
        );

        toast.success("Principal 실시간 데이터가 로드되었습니다.");
      } catch (error: any) {
        console.error("❌ Principal 실시간 데이터 초기화 실패:", error);

        const errorMessage =
          error.response?.data?.message || "실시간 데이터 로딩에 실패했습니다.";
        dispatch(setError(errorMessage));

        toast.error("Principal 실시간 데이터 로딩 실패", {
          description: errorMessage,
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
