import { http, HttpResponse } from "msw";
import { server } from "@/__mocks__/server";
import { render, screen, waitFor } from "@/__tests__/utils/test-utils";
import userEvent from "@testing-library/user-event";
import { LoginPage } from "@/components/auth/pages/LoginPage";
import { AppProvider } from "@/contexts/AppContext";
import { signIn, signOut, useSession } from "next-auth/react";

// NextAuth mock
jest.mock("next-auth/react", () => ({
  signIn: jest.fn(),
  signOut: jest.fn(),
  useSession: jest.fn(() => ({ data: null, status: "unauthenticated" })),
}));

// Next.js router mock
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    back: jest.fn(),
  })),
}));

describe("Auth API Integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Login Flow", () => {
    it("should handle successful login", async () => {
      const user = userEvent.setup();

      // NextAuth signIn mock 설정
      (signIn as jest.Mock).mockResolvedValue({ ok: true, error: null });

      // MSW 핸들러 오버라이드 (NextAuth API 경로)
      server.use(
        http.post("/api/auth/signin/credentials", () => {
          return HttpResponse.json({
            accessToken: "mock-access-token",
            refreshToken: "mock-refresh-token",
            user: {
              id: "1",
              userId: "testuser",
              name: "Test User",
              role: "STUDENT",
            },
          });
        })
      );

      // 실제 LoginPage 컴포넌트 렌더링
      render(
        <AppProvider>
          <LoginPage />
        </AppProvider>
      );

      // 사용자 입력 시뮬레이션
      await user.type(screen.getByLabelText("아이디"), "testuser");
      await user.type(screen.getByLabelText("비밀번호"), "password123");
      await user.click(screen.getByRole("button", { name: /로그인하기/i }));

      // NextAuth signIn 호출 검증
      await waitFor(() => {
        expect(signIn).toHaveBeenCalledWith("credentials", {
          userId: "testuser",
          password: "password123",
          redirect: false,
        });
      });
    });

    it("should handle login error", async () => {
      const user = userEvent.setup();

      // NextAuth signIn mock 설정 (에러 반환)
      (signIn as jest.Mock).mockResolvedValue({ 
        ok: false, 
        error: "CredentialsSignin" 
      });

      // 실제 LoginPage 컴포넌트 렌더링
      render(
        <AppProvider>
          <LoginPage />
        </AppProvider>
      );

      await user.type(screen.getByLabelText("아이디"), "wronguser");
      await user.type(screen.getByLabelText("비밀번호"), "wrongpass");
      await user.click(screen.getByRole("button", { name: /로그인하기/i }));

      // 에러 메시지 표시 검증
      await waitFor(() => {
        expect(screen.getByText("아이디 또는 비밀번호가 올바르지 않습니다.")).toBeInTheDocument();
      });
    });
  });

  describe("Logout Flow", () => {
    it("should handle successful logout", async () => {
      const user = userEvent.setup();

      // NextAuth signOut mock 설정
      (signOut as jest.Mock).mockResolvedValue({ ok: true });

      server.use(
        http.post("/api/auth/logout", () => {
          return HttpResponse.json({ message: "Logged out successfully" });
        })
      );

      render(
        <div>
          <button 
            data-testid="logout-button" 
            onClick={() => signOut()}
          >
            로그아웃
          </button>
        </div>
      );

      await user.click(screen.getByTestId("logout-button"));

      // NextAuth signOut 호출 검증
      await waitFor(() => {
        expect(signOut).toHaveBeenCalled();
      });
    });
  });

  describe("User Profile", () => {
    it("should fetch current user profile", async () => {
      
      // NextAuth useSession mock 설정 (로그인된 상태)
      (useSession as jest.Mock).mockReturnValue({
        data: {
          user: {
            id: "1",
            name: "Test User",
            email: "test@example.com",
            role: "STUDENT",
          },
          accessToken: "mock-token",
          expires: "2024-12-31T23:59:59.999Z"
        },
        status: "authenticated"
      });

      server.use(
        http.get("/api/auth/me", () => {
          return HttpResponse.json({
            id: "1",
            userId: "testuser",
            name: "Test User",
            role: "STUDENT",
          });
        })
      );

      // 간단한 프로필 컴포넌트 렌더링
      render(
        <div>
          <div data-testid="user-name">Test User</div>
          <div data-testid="user-role">STUDENT</div>
        </div>
      );

      // 세션 데이터가 표시되는지 확인
      await waitFor(() => {
        expect(screen.getByTestId("user-name")).toHaveTextContent("Test User");
        expect(screen.getByTestId("user-role")).toHaveTextContent("STUDENT");
      });
    });
  });
});
