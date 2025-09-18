import { useSession } from "next-auth/react";
import { useCallback, useEffect, useRef } from "react";

// 사용자 활동 감지 및 토큰 연장 훅
export const useSlidingSession = () => {
  const { data: session, update } = useSession();
  const lastActivityRef = useRef<number>(Date.now());
  const activityTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 사용자 활동 감지
  const resetActivityTimer = useCallback(() => {
    lastActivityRef.current = Date.now();

    // 기존 타이머 클리어
    if (activityTimeoutRef.current) {
      clearTimeout(activityTimeoutRef.current);
    }

    // 1시간마다 토큰 갱신 체크
    activityTimeoutRef.current = setTimeout(async () => {
      if (session?.accessToken) {
        try {
          // 토큰 갱신 API 호출
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ userId: session.user.id }),
            }
          );

          if (response.ok) {
            const data = await response.json();
            console.log("🔄 활동 기반 토큰 갱신 성공");

            // 세션 업데이트
            await update({
              accessToken: data.access_token,
            });
          }
        } catch (error) {
          console.error("활동 기반 토큰 갱신 실패:", error);
        }
      }
    }, 60 * 60 * 1000); // 1시간마다 체크
  }, [session, update]);

  // 사용자 활동 이벤트 리스너 등록 (로그인된 사용자에게만)
  useEffect(() => {
    if (!session?.user) return;

    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ];

    const handleActivity = () => {
      resetActivityTimer();
    };

    // 이벤트 리스너 등록
    events.forEach((event) => {
      document.addEventListener(event, handleActivity, true);
    });

    // 초기 타이머 설정
    resetActivityTimer();

    // 정리 함수
    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity, true);
      });

      if (activityTimeoutRef.current) {
        clearTimeout(activityTimeoutRef.current);
      }
    };
  }, [resetActivityTimer, session?.user]);

  // 2주 이상 비활성 시 자동 로그아웃 (로그인된 사용자에게만)
  useEffect(() => {
    if (!session?.user) return;

    const checkInactivity = () => {
      const now = Date.now();
      const timeSinceLastActivity = now - lastActivityRef.current;
      const twoWeeks = 14 * 24 * 60 * 60 * 1000; // 2주

      if (timeSinceLastActivity > twoWeeks) {
        console.log("🚪 2주 이상 비활성 - 자동 로그아웃");
        window.location.href = "/auth";
      }
    };

    // 1시간마다 비활성 상태 체크
    const inactivityCheckInterval = setInterval(
      checkInactivity,
      60 * 60 * 1000
    );

    return () => {
      clearInterval(inactivityCheckInterval);
    };
  }, [session?.user]);

  return {
    lastActivity: lastActivityRef.current,
    resetActivityTimer,
  };
};
