import React from "react";
import { render, waitFor } from "@/__tests__/utils/test-utils";
import { useSession } from "@/lib/auth/AuthProvider";
import { initializeSocket } from "@/lib/socket";

// Mock AuthProvider
jest.mock("@/lib/auth/AuthProvider", () => ({
  useSession: jest.fn(),
  getSession: jest.fn(),
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

// 타입 정의
interface MockSession {
  user: {
    id: string;
    role: string;
  };
  accessToken: string;
}

interface AuthError {
  type: string;
  message: string;
  code: string;
}

interface MockSocket {
  on: jest.Mock;
  emit: jest.Mock;
  connect: jest.Mock;
  disconnect: jest.Mock;
  connected: boolean;
  id: string;
}

describe("Socket Authentication Flow", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should handle token expired error and attempt refresh", async () => {
    const mockSession: MockSession = {
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

    // Create mock socket
    const mockSocket: MockSocket = {
      on: jest.fn((event: string, callback: (error: AuthError) => void) => {
        if (event === "auth_error") {
          // Simulate TOKEN_EXPIRED error immediately
          callback({
            type: "TOKEN_EXPIRED",
            message: "토큰이 만료되었습니다.",
            code: "TOKEN_EXPIRED",
          });
        }
      }),
      emit: jest.fn(),
      connect: jest.fn(),
      disconnect: jest.fn(),
      connected: true,
      id: "test-socket-id",
    };

    // Mock socket.io to return our mock socket
    const { io } = await import("socket.io-client");
    (io as jest.Mock).mockReturnValue(mockSocket);

    // Mock localStorage with session data
    localStorage.setItem("session", JSON.stringify(mockSession));
    localStorage.setItem("accessToken", mockSession.accessToken);

    // Mock getSession to return our mock session
    const { getSession } = await import("@/lib/auth/AuthProvider");
    (getSession as jest.Mock).mockResolvedValue(mockSession);

    const TestComponent: React.FC = () => {
      return <div data-testid="socket-status">Socket connection test</div>;
    };

    render(<TestComponent />);

    // Manually trigger socket initialization
    await initializeSocket();

    // Verify socket was created and auth_error listener was registered
    expect(io).toHaveBeenCalled();
    expect(mockSocket.on).toHaveBeenCalledWith(
      "auth_error",
      expect.any(Function)
    );

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
    const mockSession: MockSession = {
      user: { id: "1", role: "STUDENT" },
      accessToken: "invalid-token",
    };

    (useSession as jest.Mock).mockReturnValue({
      data: mockSession,
      update: jest.fn(),
    });

    // Mock window.location
    const mockLocation = { href: "" };
    Object.defineProperty(window, 'location', {
      value: mockLocation,
      writable: true,
    });

    // Create mock socket
    const mockSocket: MockSocket = {
      on: jest.fn((event: string, callback: (error: AuthError) => void) => {
        if (event === "auth_error") {
          // Simulate INVALID_TOKEN error immediately
          callback({
            type: "INVALID_TOKEN",
            message: "유효하지 않은 토큰입니다.",
            code: "INVALID_TOKEN",
          });
        }
      }),
      emit: jest.fn(),
      connect: jest.fn(),
      disconnect: jest.fn(),
      connected: true,
      id: "test-socket-id",
    };

    // Mock socket.io to return our mock socket
    const { io } = await import("socket.io-client");
    (io as jest.Mock).mockReturnValue(mockSocket);

    // Mock localStorage with session data
    localStorage.setItem("session", JSON.stringify(mockSession));
    localStorage.setItem("accessToken", mockSession.accessToken);

    // Mock getSession to return our mock session
    const { getSession } = await import("@/lib/auth/AuthProvider");
    (getSession as jest.Mock).mockResolvedValue(mockSession);

    const TestComponent: React.FC = () => {
      return <div data-testid="socket-status">Socket connection test</div>;
    };

    render(<TestComponent />);

    // Manually trigger socket initialization
    await initializeSocket();

    // Verify socket was created and auth_error listener was registered
    expect(io).toHaveBeenCalled();
    expect(mockSocket.on).toHaveBeenCalledWith(
      "auth_error",
      expect.any(Function)
    );

    // Wait for redirect
    await waitFor(() => {
      expect(mockLocation.href).toBe("/");
    });
  });
});
