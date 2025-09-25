/**
 * Auth API 함수들 테스트
 * 새로운 API 엔드포인트들의 사용 예시
 */

import { getSession, verifyToken } from "../auth";

// 사용 예시
export const testAuthAPI = async () => {
  try {
    // 1. 현재 세션 정보 조회
    console.log("=== 세션 정보 조회 테스트 ===");
    const sessionResponse = await getSession();
    console.log("세션 정보:", sessionResponse.data);
    /*
    예상 응답:
    {
      user: {
        id: 1,
        userId: "testuser",
        name: "테스트 사용자",
        role: "STUDENT"
      },
      expiresAt: 1704067200000
    }
    */

    // 2. 토큰 유효성 검증
    console.log("=== 토큰 검증 테스트 ===");
    const verifyResponse = await verifyToken();
    console.log("토큰 검증 결과:", verifyResponse.data);
    /*
    예상 응답:
    {
      valid: true,
      user: {
        id: 1,
        userId: "testuser",
        name: "테스트 사용자",
        role: "STUDENT"
      }
    }
    */

    return {
      session: sessionResponse.data,
      verify: verifyResponse.data,
    };
  } catch (error) {
    console.error("API 테스트 실패:", error);
    throw error;
  }
};

// AuthProvider에서 사용할 수 있는 패턴
export const useAuthSession = async () => {
  try {
    const sessionResponse = await getSession();
    return {
      user: sessionResponse.data?.user,
      expiresAt: sessionResponse.data?.expiresAt,
      isAuthenticated: !!sessionResponse.data?.user,
    };
  } catch (error) {
    console.error("세션 조회 실패:", error);
    return {
      user: null,
      expiresAt: null,
      isAuthenticated: false,
    };
  }
};

export const useTokenVerification = async () => {
  try {
    const verifyResponse = await verifyToken();
    return {
      isValid: verifyResponse.data?.valid || false,
      user: verifyResponse.data?.user || null,
    };
  } catch (error) {
    console.error("토큰 검증 실패:", error);
    return {
      isValid: false,
      user: null,
    };
  }
};
