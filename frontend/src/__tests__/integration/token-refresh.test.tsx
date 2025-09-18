import React from "react";
import { render, screen } from "@/__tests__/utils/test-utils";
import { useTokenRefresh } from "@/hooks/auth/useTokenRefresh";
import { useSession } from "next-auth/react";

// Mock next-auth
jest.mock("next-auth/react", () => ({
  useSession: jest.fn(),
}));

// 타입 정의
interface MockSession {
  user: {
    id: string;
    role: string;
  };
  accessToken: string;
}

describe("Token Refresh Integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("useTokenRefresh Hook", () => {
    it("should check token expiry correctly", () => {
      const mockSession: MockSession = {
        user: { id: "1", role: "STUDENT" },
        accessToken:
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiaWF0IjoxNjQwOTk1MjAwLCJleHAiOjE2NDA5OTUyMDB9.test",
      };

      (useSession as jest.Mock).mockReturnValue({
        data: mockSession,
        update: jest.fn(),
      });

      const TestComponent: React.FC = () => {
        const { isTokenExpired } = useTokenRefresh();

        return (
          <div data-testid="expiry-status">
            {isTokenExpired(mockSession.accessToken) ? "Expired" : "Valid"}
          </div>
        );
      };

      render(<TestComponent />);

      // This should show 'Expired' for the mock token
      expect(screen.getByTestId("expiry-status")).toHaveTextContent("Expired");
    });

    it("should have refreshToken function", () => {
      const mockSession: MockSession = {
        user: { id: "1", role: "STUDENT" },
        accessToken: "old-token",
      };

      (useSession as jest.Mock).mockReturnValue({
        data: mockSession,
        update: jest.fn(),
      });

      const TestComponent: React.FC = () => {
        const { refreshToken } = useTokenRefresh();

        return (
          <div data-testid="refresh-function">
            {typeof refreshToken === "function" ? "Function exists" : "No function"}
          </div>
        );
      };

      render(<TestComponent />);

      expect(screen.getByTestId("refresh-function")).toHaveTextContent("Function exists");
    });
  });
});
