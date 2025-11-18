import { useCallback } from "react";
import { useSession, useSignOut } from "@/lib/auth/AuthProvider";
import { AuthRouter } from "@/lib/auth/AuthRouter";
import { clearApiClientSessionCache } from "@/api/apiClient";
import { logger } from "@/lib/logger";
import { useWithdrawalStudent } from "@/hooks/mutations/student/useWithdrawalStudent";
import { useWithdrawalTeacher } from "@/hooks/mutations/teacher/useWithdrawalTeacher";
import { useWithdrawalPrincipal } from "@/hooks/mutations/principal/useWithdrawalPrincipal";

/**
 * 회원 탈퇴 훅
 * 세션의 역할에 따라 적절한 Mutation 훅을 사용합니다.
 */
export const useWithdrawal = () => {
  const { data: session } = useSession();
  const signOut = useSignOut();

  // 각 롤별 withdrawal mutation 훅
  const studentWithdrawal = useWithdrawalStudent();
  const teacherWithdrawal = useWithdrawalTeacher();
  const principalWithdrawal = useWithdrawalPrincipal();

  /**
   * 공통 cleanup 로직
   * 소켓 해제, 세션 정리, 리디렉션 등을 처리합니다.
   */
  const performCleanup = useCallback(async () => {
    // 1. 소켓 연결 완전 해제
    if (typeof window !== "undefined") {
      const { disconnectSocket } = await import("@/lib/socket");
      disconnectSocket();
    }

    // 2. API 클라이언트 세션 캐시 클리어
    clearApiClientSessionCache();

    // 3. 브라우저 캐시 클리어
    if (typeof window !== "undefined") {
      const { SyncStorage } = await import("@/lib/storage/StorageAdapter");
      SyncStorage.removeItem("next-auth.session-token");
      SyncStorage.removeItem("next-auth.csrf-token");
      sessionStorage.clear();
    }

    // 4. 초기화 상태 리셋을 위한 전역 이벤트 발생
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("logout-cleanup"));
    }

    // 5. NextAuth 세션 완전 정리
    await signOut({ redirect: false });

    // 6. 세션 정리 완료 후 리디렉션
    setTimeout(() => {
      AuthRouter.redirectToLogin();
    }, 500);
  }, [signOut]);

  const withdrawal = useCallback(
    async (reason: string) => {
      // 세션이 없으면 이미 로그아웃된 상태
      if (!session?.user) {
        AuthRouter.redirectToLogin();
        return;
      }

      const userRole = session.user.role;
      let mutation;

      // 역할에 따라 적절한 mutation 선택
      if (userRole === "TEACHER") {
        mutation = teacherWithdrawal;
      } else if (userRole === "PRINCIPAL") {
        mutation = principalWithdrawal;
      } else {
        // STUDENT 또는 기타 역할
        mutation = studentWithdrawal;
      }

      try {
        // Mutation 실행
        await mutation.mutateAsync(reason);

        logger.info("회원 탈퇴 완료", {
          userId: session.user.id,
          role: userRole,
          timestamp: new Date().toISOString(),
        });

        await performCleanup();
      } catch (error) {
        logger.warn("회원 탈퇴 실패 - cleanup 수행하지 않음", {
          userId: session.user.id,
          role: userRole,
          error: error instanceof Error ? error.message : String(error),
        });

        throw error;
      }
    },
    [
      session,
      studentWithdrawal,
      teacherWithdrawal,
      principalWithdrawal,
      performCleanup,
    ]
  );

  // 로딩 상태는 현재 활성화된 mutation의 상태를 반환
  const isLoading =
    studentWithdrawal.isPending ||
    teacherWithdrawal.isPending ||
    principalWithdrawal.isPending;

  return {
    withdrawal,
    isLoading,
  };
};
