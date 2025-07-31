import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { initializeAppData } from "@/store/slices/appDataSlice";
import { useSession } from "next-auth/react";

export function useAppInitialization() {
  const dispatch = useAppDispatch();
  const { user, isLoading, error, lastUpdated } = useAppSelector(
    (state) => state.appData
  );
  const { data: session, status } = useSession();

  // 앱 초기화 실행
  const initializeApp = () => {
    if (session?.user?.id && session?.user?.role && !user && !isLoading) {
      console.log("🚀 앱 초기화 시작:", {
        id: session.user.id,
        role: session.user.role,
      });
      dispatch(
        initializeAppData({
          userId: parseInt(session.user.id),
          userRole: session.user.role,
        })
      );
    }
  };

  // 세션이 로드되면 앱 초기화
  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      initializeApp();
    }
  }, [status, session, user, isLoading]);

  // 에러 발생 시 재시도
  const retryInitialization = () => {
    if (session?.user?.id && session?.user?.role) {
      dispatch(
        initializeAppData({
          userId: parseInt(session.user.id),
          userRole: session.user.role,
        })
      );
    }
  };

  return {
    user,
    isLoading,
    error,
    lastUpdated,
    isInitialized: !!user && !isLoading,
    retryInitialization,
  };
}
