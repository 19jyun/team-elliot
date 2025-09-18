import React from "react";
import { render, screen, waitFor } from "@/__tests__/utils/test-utils";
import { useTokenRefresh } from "@/hooks/auth/useTokenRefresh";
import { useSession } from "next-auth/react";

// Mock next-auth
jest.mock("next-auth/react", () => ({
  useSession: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

describe("Token Refresh Integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("useTokenRefresh Hook", () => {
    it("should refresh token successfully", async () => {
      const mockSession = {
        user: { id: "1", role: "STUDENT" },
        accessToken: "old-token",
      };

      const mockUpdate = jest.fn();
      (useSession as jest.Mock).mockReturnValue({
        data: mockSession,
        update: mockUpdate,
      });

      const mockResponse = {
        access_token: "new-token",
        expires_in: 3600,
        token_type: "Bearer",
        user: {
          id: 1,
          userId: "1",
          name: "Test User",
          role: "STUDENT",
        },
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const TestComponent: React.FC = () => {
        const { refreshToken } = useTokenRefresh();

        const handleRefresh = async () => {
          const result = await refreshToken();
          return result;
        };

        return (
          <button onClick={handleRefresh} data-testid="refresh-button">
            Refresh Token
          </button>
        );
      };

      render(<TestComponent />);

      const button = screen.getByTestId("refresh-button");
      button.click();

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
          expect.objectContaining({
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: "1" }),
          })
        );
      });

      await waitFor(() => {
        expect(mockUpdate).toHaveBeenCalledWith({
          accessToken: "new-token",
          user: {
            ...mockSession.user,
            ...mockResponse.user,
          },
        });
      });
    });

    it("should handle token refresh failure", async () => {
      const mockSession = {
        user: { id: "1", role: "STUDENT" },
        accessToken: "old-token",
      };

      const mockUpdate = jest.fn();
      (useSession as jest.Mock).mockReturnValue({
        data: mockSession,
        update: mockUpdate,
      });

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: "Invalid user" }),
      });

      const TestComponent: React.FC = () => {
        const { refreshToken } = useTokenRefresh();

        const handleRefresh = async () => {
          const result = await refreshToken();
          return result;
        };

        return (
          <button onClick={handleRefresh} data-testid="refresh-button">
            Refresh Token
          </button>
        );
      };

      render(<TestComponent />);

      const button = screen.getByTestId("refresh-button");
      button.click();

      await waitFor(() => {
        expect(mockUpdate).not.toHaveBeenCalled();
      });
    });

    it("should check token expiry correctly", () => {
      const mockSession = {
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

      // Mock JWT with expired timestamp
      const expiredToken =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiaWF0IjoxNjQwOTk1MjAwLCJleHAiOjE2NDA5OTUyMDB9.test";

      // This should show 'Expired' for the mock token
      expect(screen.getByTestId("expiry-status")).toHaveTextContent("Expired");
    });
  });
});
