import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { toast } from "sonner";
import { logout as apiLogout } from "@/api/auth";
import { useAppDispatch } from "@/store/hooks";
import { clearPrincipalData } from "@/store/slices/principalSlice";
import { clearStudentData } from "@/store/slices/studentSlice";
import { clearApiClientSessionCache } from "@/api/apiClient";
import { logger } from "@/lib/logger";

export const useLogout = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const dispatch = useAppDispatch();

  const logout = useCallback(async () => {
    try {
      // 세션이 없으면 이미 로그아웃된 상태
      if (!session?.user) {
        router.replace("/auth");
        return;
      }

      // 1. 소켓 연결 완전 해제
      if (typeof window !== "undefined") {
        const { disconnectSocket } = await import("@/lib/socket");
        await disconnectSocket();
      }

      // 2. 백엔드 로그아웃 API 호출
      await apiLogout();

      // 3. Redux 상태 완전 정리 (모든 역할의 데이터)
      dispatch(clearPrincipalData());
      dispatch(clearStudentData());

      // 3-1. API 클라이언트 세션 캐시 클리어
      clearApiClientSessionCache();

      // 3-1-1. 브라우저 캐시 클리어
      if (typeof window !== "undefined") {
        localStorage.removeItem("next-auth.session-token");
        localStorage.removeItem("next-auth.csrf-token");
        sessionStorage.clear();
      }

      // 3-2. 초기화 상태 리셋을 위한 전역 이벤트 발생
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("logout-cleanup"));
      }

      // 4. NextAuth 세션 완전 정리
      await signOut({ redirect: false });

      // 5. 성공 메시지
      toast.success("로그아웃되었습니다");

      // 6. 세션 정리 완료 후 리디렉션
      setTimeout(() => {
        router.replace("/auth");
      }, 500);
    } catch (error) {
      logger.error("Logout failed", {
        error: error instanceof Error ? error.message : String(error),
      });

      // API 호출 실패 시에도 cleanup은 진행
      try {
        dispatch(clearPrincipalData());
        dispatch(clearStudentData());
        await signOut({ redirect: false });
      } catch (cleanupError) {
        logger.error("Cleanup failed", {
          error:
            cleanupError instanceof Error
              ? cleanupError.message
              : String(cleanupError),
        });
      }

      toast.error("로그아웃 중 오류가 발생했습니다");

      setTimeout(() => {
        router.replace("/auth");
      }, 500);
    }
  }, [router, session, dispatch]);

  return { logout };
};
