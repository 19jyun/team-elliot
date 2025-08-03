import { useEffect } from "react";
import { useAppDispatch } from "@/store/hooks";
import { useSession } from "next-auth/react";
import {
  setPrincipalData,
  setLoading,
  setError,
} from "@/store/slices/principalSlice";
import { getPrincipalData } from "@/api/principal";
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


        // PrincipalData 전체 조회
        const principalData = await getPrincipalData();

        // Redux 상태 업데이트
        dispatch(setPrincipalData(principalData));

        toast.success("Principal 대시보드가 로드되었습니다.");
      } catch (error: any) {
        console.error("❌ Principal 데이터 초기화 실패:", error);

        const errorMessage =
          error.response?.data?.message || "데이터 로딩에 실패했습니다.";
        dispatch(setError(errorMessage));

        toast.error("Principal 데이터 로딩 실패", {
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
