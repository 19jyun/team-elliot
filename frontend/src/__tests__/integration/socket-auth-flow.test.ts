import { render, screen, waitFor } from "@/__tests__/utils/test-utils";
import { useSession } from "next-auth/react";

// Mock next-auth
jest.mock("next-auth/react", () => ({
  useSession: jest.fn(),
}));

// Mock socket.io
jest.mock("socket.io-client", () => ({
  io: jest.fn(() => ({
    on: jest.fn(),
    emit: jest.fn(),
    connect: jest.fn(),
    disconnect: jest.fn(),
    connected: true,
    id: "test-socket-id",
  })),
}));

describe("Socket Authentication Flow", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should handle token expired error and attempt refresh", async () => {
    const mockSession = {
      user: { id: "1", role: "STUDENT" },
      accessToken: "expired-token",
    };

    (useSession as jest.Mock).mockReturnValue({
      data: mockSession,
      update: jest.fn(),
    });

    // Mock successful token refresh
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          access_token: "new-token",
          expires_in: 3600,
          token_type: "Bearer",
          user: {
            id: 1,
            userId: "1",
            name: "Test User",
            role: "STUDENT",
          },
        }),
    });

    const TestComponent = () => {
      return <div data-testid="socket-status">Socket connection test</div>;
    };

    render(<TestComponent />);

    // Simulate auth_error event from socket
    const mockSocket = {
      on: jest.fn((event, callback) => {
        if (event === "auth_error") {
          // Simulate TOKEN_EXPIRED error
          setTimeout(() => {
            callback({
              type: "TOKEN_EXPIRED",
              message: "토큰이 만료되었습니다.",
              code: "TOKEN_EXPIRED",
            });
          }, 100);
        }
      }),
      emit: jest.fn(),
      connect: jest.fn(),
      disconnect: jest.fn(),
      connected: true,
      id: "test-socket-id",
    };

    // Simulate socket connection
    const { io } = require("socket.io-client");
    io.mockReturnValue(mockSocket);

    await waitFor(() => {
      expect(mockSocket.on).toHaveBeenCalledWith(
        "auth_error",
        expect.any(Function)
      );
    });

    // Wait for token refresh attempt
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
  });

  it("should handle invalid token error and redirect to auth", async () => {
    const mockSession = {
      user: { id: "1", role: "STUDENT" },
      accessToken: "invalid-token",
    };

    (useSession as jest.Mock).mockReturnValue({
      data: mockSession,
      update: jest.fn(),
    });

    // Mock window.location
    delete (window as any).location;
    window.location = { href: "" } as any;

    const TestComponent = () => {
      return <div data-testid="socket-status">Socket connection test</div>;
    };

    render(<TestComponent />);

    // Simulate auth_error event with INVALID_TOKEN
    const mockSocket = {
      on: jest.fn((event, callback) => {
        if (event === "auth_error") {
          // Simulate INVALID_TOKEN error
          setTimeout(() => {
            callback({
              type: "INVALID_TOKEN",
              message: "유효하지 않은 토큰입니다.",
              code: "INVALID_TOKEN",
            });
          }, 100);
        }
      }),
      emit: jest.fn(),
      connect: jest.fn(),
      disconnect: jest.fn(),
      connected: true,
      id: "test-socket-id",
    };

    const { io } = require("socket.io-client");
    io.mockReturnValue(mockSocket);

    await waitFor(() => {
      expect(mockSocket.on).toHaveBeenCalledWith(
        "auth_error",
        expect.any(Function)
      );
    });

    // Wait for redirect
    await waitFor(() => {
      expect(window.location.href).toBe("/auth");
    });
  });
});
