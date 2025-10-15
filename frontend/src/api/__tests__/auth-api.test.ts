/**
 * Auth API 함수들 테스트
 */

import { getSession, verifyToken, signupPrincipal } from "../auth";
import { get, post } from "../apiClient";

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};

Object.defineProperty(window, "localStorage", {
  value: mockLocalStorage,
});

// API 클라이언트 모킹
jest.mock("../apiClient", () => ({
  get: jest.fn(),
  post: jest.fn(),
}));

// 모킹된 함수 타입 지정
const mockGet = get as jest.MockedFunction<typeof get>;
const mockPost = post as jest.MockedFunction<typeof post>;

describe("Auth API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // 테스트 타임아웃 설정 (5초)
  jest.setTimeout(5000);

  describe("getSession", () => {
    it("should return session data from API", async () => {
      const mockApiResponse = {
        success: true,
        data: {
          user: {
            id: 1,
            userId: "testuser",
            name: "Test User",
            role: "STUDENT",
          },
          accessToken: "mock-access-token",
          expiresAt: Date.now() + 3600000,
        },
        timestamp: new Date().toISOString(),
        path: "/auth/session",
      };

      mockGet.mockResolvedValue(mockApiResponse);

      const result = await getSession();
      expect(result).toEqual(mockApiResponse);
      expect(mockGet).toHaveBeenCalledWith("/auth/session");
    }, 3000);
  });

  describe("verifyToken", () => {
    it("should return token verification result", async () => {
      const mockApiResponse = {
        success: true,
        data: {
          valid: true,
          user: {
            id: 1,
            userId: "testuser",
            name: "Test User",
            role: "STUDENT",
          },
        },
        timestamp: new Date().toISOString(),
        path: "/auth/verify",
      };

      mockGet.mockResolvedValue(mockApiResponse);

      const result = await verifyToken();
      expect(result).toEqual(mockApiResponse);
      expect(mockGet).toHaveBeenCalledWith("/auth/verify");
    }, 3000);
  });

  describe("signupPrincipal", () => {
    it("should return principal signup response with academy info", async () => {
      const mockApiResponse = {
        success: true,
        data: {
          access_token: "mock-access-token",
          user: {
            id: 1,
            userId: "principal001",
            name: "김원장",
            role: "PRINCIPAL",
          },
          academy: {
            id: 1,
            name: "김원장의 발레 학원",
            code: "ACADEMY_1703123456789_abc123def_xyz45_abc",
          },
        },
        timestamp: new Date().toISOString(),
        path: "/auth/signup/principal",
      };

      const signupData = {
        userId: "principal001",
        password: "securePassword123",
        name: "김원장",
        phoneNumber: "010-1234-5678",
        role: "PRINCIPAL" as const,
        academyInfo: {
          name: "김원장의 발레 학원",
          phoneNumber: "02-1234-5678",
          address: "서울시 강남구 테헤란로 123",
          description: "전문적인 발레 교육을 제공하는 학원입니다.",
        },
      };

      mockPost.mockResolvedValue(mockApiResponse);

      const result = await signupPrincipal(signupData);
      expect(result).toEqual(mockApiResponse);
      expect(mockPost).toHaveBeenCalledWith(
        "/auth/signup/principal",
        signupData
      );
    }, 3000);
  });
});
