import { useSession } from "@/lib/auth/AuthProvider";
import { useCallback } from "react";
import { refreshToken as refreshTokenApi } from "@/api/auth";
import type { RefreshTokenResponse } from "@/types/api/auth";

export const useTokenRefresh = () => {
  const { data: session, update } = useSession();

  const refreshToken = useCallback(async (): Promise<string | null> => {
    if (!session?.user?.id) {
      console.error("토큰 갱신 실패: 사용자 정보 없음");
      return null;
    }

    try {
      console.log("🔄 토큰 갱신 시도:", session.user.id);

      const response = await refreshTokenApi({
        userId: session.user.id,
      });

      if (!response.success || !response.data) {
        console.error("토큰 갱신 API 오류:", response.error);
        return null;
      }

      const data: RefreshTokenResponse = response.data;
      console.log("✅ 토큰 갱신 성공");

      // NextAuth 세션 업데이트
      await update({
        accessToken: data.access_token,
        user: {
          ...session.user,
          ...data.user,
          id: data.user.id.toString(), // number를 string으로 변환
        },
      });

      return data.access_token;
    } catch (error) {
      console.error("토큰 갱신 중 오류:", error);
      return null;
    }
  }, [session, update]);

  const isTokenExpired = useCallback((token: string): boolean => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch (error) {
      console.error("토큰 만료 확인 중 오류:", error);
      return true;
    }
  }, []);

  const getTokenExpiryTime = useCallback((token: string): number | null => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.exp * 1000; // 밀리초로 변환
    } catch (error) {
      console.error("토큰 만료 시간 확인 중 오류:", error);
      return null;
    }
  }, []);

  return {
    refreshToken,
    isTokenExpired,
    getTokenExpiryTime,
  };
};
