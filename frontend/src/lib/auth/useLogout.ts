import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession, useSignOut } from "./AuthProvider";
import { toast } from "sonner";
import { logout as apiLogout } from "@/api/auth";
import { clearApiClientSessionCache } from "@/api/apiClient";
import { logger } from "@/lib/logger";
import { ensureTrailingSlash } from "@/lib/utils/router";

export const useLogout = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const signOut = useSignOut();

  const logout = useCallback(async () => {
    try {
      // 세션이 없으면 이미 로그아웃된 상태
      if (!session?.user) {
        router.replace(ensureTrailingSlash("/auth"));
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

      // 3-1. API 클라이언트 세션 캐시 클리어
      clearApiClientSessionCache();

      // 3-1-1. 브라우저 캐시 클리어
      if (typeof window !== "undefined") {
        const { SyncStorage } = await import("@/lib/storage/StorageAdapter");
        SyncStorage.removeItem("accessToken");
        SyncStorage.removeItem("session");
        SyncStorage.removeItem("next-auth.session-token");
        SyncStorage.removeItem("next-auth.csrf-token");
        sessionStorage.clear();
      }

      // 3-2. 초기화 상태 리셋을 위한 전역 이벤트 발생
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("logout-cleanup"));
      }

      // 4. AuthProvider 세션 완전 정리
      await signOut({ redirect: false });

      // 5. 성공 메시지
      toast.success("로그아웃되었습니다");

      // 6. 세션 정리 완료 후 리디렉션
      setTimeout(() => {
        router.replace(ensureTrailingSlash("/"));
      }, 500);

      logger.info("사용자 로그아웃 완료", {
        userId: session.user.id,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("로그아웃 처리 중 오류:", error);

      // 에러가 발생해도 로컬 상태는 정리
      clearApiClientSessionCache();

      if (typeof window !== "undefined") {
        const { SyncStorage } = await import("@/lib/storage/StorageAdapter");
        SyncStorage.clear();
        sessionStorage.clear();
      }

      // 강제 리디렉션
      router.replace(ensureTrailingSlash("/"));

      toast.error("로그아웃 처리 중 오류가 발생했습니다");

      logger.error("로그아웃 처리 중 오류", {
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      });
    }
  }, [session, signOut, router]);

  return { logout };
};
