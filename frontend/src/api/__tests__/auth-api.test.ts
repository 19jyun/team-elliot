/**
 * Auth API 함수들 테스트
 */

import { getSession, verifyToken } from "../auth";
import { get } from "../apiClient";

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
}));

// 모킹된 함수 타입 지정
const mockGet = get as jest.MockedFunction<typeof get>;

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
});
