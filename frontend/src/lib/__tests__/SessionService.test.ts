import { SessionService } from "../services/SessionService";
import * as SessionAdapter from "../adapters/session";

// Mock API
jest.mock("@/api/auth", () => ({
  getSession: jest.fn(),
}));

describe("SessionService", () => {
  let sessionService: SessionService;

  beforeEach(() => {
    sessionService = new SessionService();
  });

  describe("SessionAdapter", () => {
    it("should convert API response to Session", () => {
      const apiResponse = {
        user: {
          id: 1,
          userId: "testuser",
          name: "Test User",
          role: "STUDENT" as const,
        },
        accessToken: "test-token",
        expiresAt: Date.now() + 3600000, // 1시간 후
      };

      const session = SessionAdapter.toSession(apiResponse);

      expect(session.user.id).toBe("1"); // number → string
      expect(session.user.name).toBe("Test User");
      expect(session.accessToken).toBe("test-token");
      expect(session.expiresAt).toBe(apiResponse.expiresAt);
    });

    it("should validate session correctly", () => {
      const validSession = {
        user: { id: "1", name: "Test", role: "STUDENT", email: undefined },
        accessToken: "token",
        error: undefined,
        expiresAt: Date.now() + 3600000,
      };

      const invalidSession = {
        user: { id: "1", name: "Test", role: "STUDENT", email: undefined },
        accessToken: undefined,
        error: undefined,
        expiresAt: Date.now() + 3600000,
      };

      expect(SessionAdapter.isValidSession(validSession)).toBe(true);
      expect(SessionAdapter.isValidSession(invalidSession)).toBe(false);
      expect(SessionAdapter.isValidSession(null)).toBe(false);
    });

    it("should detect expiring tokens", () => {
      const expiringSession = {
        user: { id: "1", name: "Test", role: "STUDENT", email: undefined },
        accessToken: "token",
        error: undefined,
        expiresAt: Date.now() + 3 * 60 * 1000, // 3분 후
      };

      const notExpiringSession = {
        user: { id: "1", name: "Test", role: "STUDENT", email: undefined },
        accessToken: "token",
        error: undefined,
        expiresAt: Date.now() + 10 * 60 * 1000, // 10분 후
      };

      expect(SessionAdapter.isTokenExpiringSoon(expiringSession)).toBe(true);
      expect(SessionAdapter.isTokenExpiringSoon(notExpiringSession)).toBe(
        false
      );
    });
  });

  describe("SessionService", () => {
    it("should initialize with empty state", () => {
      const viewModel = sessionService.getViewModel();

      expect(viewModel.session).toBeNull();
      expect(viewModel.isLoading).toBe(false);
      expect(viewModel.isAuthenticated).toBe(false);
    });

    it("should clear session correctly", () => {
      sessionService.clearSession();
      const viewModel = sessionService.getViewModel();

      expect(viewModel.session).toBeNull();
      expect(viewModel.isAuthenticated).toBe(false);
    });

    it("should provide session info for logging", () => {
      const sessionInfo = sessionService.getSessionInfo();

      expect(sessionInfo).toHaveProperty("isAuthenticated");
      expect(sessionInfo).toHaveProperty("userId");
      expect(sessionInfo).toHaveProperty("hasToken");
    });
  });
});
