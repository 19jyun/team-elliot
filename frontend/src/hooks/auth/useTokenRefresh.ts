import { useSession } from "next-auth/react";
import { useCallback } from "react";

interface RefreshTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
  user: {
    id: number;
    userId: string;
    name: string;
    role: string;
  };
}

export const useTokenRefresh = () => {
  const { data: session, update } = useSession();

  const refreshToken = useCallback(async (): Promise<string | null> => {
    if (!session?.user?.id) {
      console.error("토큰 갱신 실패: 사용자 정보 없음");
      return null;
    }

    try {
      console.log("🔄 토큰 갱신 시도:", session.user.id);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: session.user.id,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("토큰 갱신 API 오류:", errorData);
        return null;
      }

      const data: RefreshTokenResponse = await response.json();
      console.log("✅ 토큰 갱신 성공");

      // NextAuth 세션 업데이트
      await update({
        accessToken: data.access_token,
        user: {
          ...session.user,
          ...data.user,
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
