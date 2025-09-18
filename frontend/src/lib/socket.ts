import { io, Socket } from "socket.io-client";
import { getSession } from "next-auth/react";
import { useTokenRefresh } from "@/hooks/auth/useTokenRefresh";

// Socket.IO 클라이언트 인스턴스
let socket: Socket | null = null;
let isInitializing = false;

// 토큰 갱신 처리 함수
const handleTokenRefresh = async () => {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      console.error("토큰 갱신 실패: 사용자 정보 없음");
      window.location.href = "/auth";
      return;
    }

    console.log("🔄 토큰 갱신 API 호출");
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: session.user.id, // NextAuth에서 id를 userId로 사용
        }),
      }
    );

    if (!response.ok) {
      console.error("토큰 갱신 API 실패");
      window.location.href = "/auth";
      return;
    }

    const data = await response.json();
    console.log("✅ 토큰 갱신 성공 - 소켓 재연결 시도");

    // 소켓 재연결
    if (socket) {
      socket.disconnect();
      socket = null;
    }

    // 새 토큰으로 재연결
    setTimeout(async () => {
      try {
        await initializeSocket();
      } catch (error) {
        console.error("토큰 갱신 후 소켓 재연결 실패:", error);
      }
    }, 1000);
  } catch (error) {
    console.error("토큰 갱신 중 오류:", error);
    window.location.href = "/auth";
  }
};

// Socket.IO 연결 설정
export const initializeSocket = async (): Promise<Socket> => {
  if (socket?.connected) {
    return socket;
  }

  if (isInitializing) {
    // 이미 초기화 중이면 기존 소켓 반환
    while (isInitializing) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    return socket!;
  }

  isInitializing = true;

  // 기존 소켓이 있으면 완전히 정리
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }

  try {
    // 세션에서 JWT 토큰 가져오기
    const session = await getSession();
    const token = session?.accessToken;

    console.log("🔍 소켓 연결 시도 - 세션 정보:", {
      hasSession: !!session,
      hasToken: !!token,
      tokenLength: token?.length,
      userId: session?.user?.id,
      role: session?.user?.role,
    });

    if (!token) {
      throw new Error("인증 토큰이 없습니다.");
    }

    // Socket.IO 클라이언트 생성
    socket = io(process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001", {
      auth: {
        token,
      },
      transports: ["websocket", "polling"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    // 연결 이벤트 리스너 (한 번만 로그 출력)
    let hasLoggedConnection = false;
    socket.on("connect", () => {
      console.log("✅ 소켓 연결 성공:", socket?.id);
      if (!hasLoggedConnection) {
        hasLoggedConnection = true;
      }
    });

    socket.on("disconnect", (reason) => {
      console.log("🔌 소켓 연결 해제:", reason);
    });

    socket.on("connect_error", (error) => {
      console.error("❌ Socket.IO 연결 오류:", error);
    });

    // 인증 에러 처리
    socket.on("auth_error", (error) => {
      console.error("🔐 소켓 인증 오류:", error);

      if (error.type === "TOKEN_EXPIRED") {
        console.log("⏰ 토큰 만료 감지 - 자동 갱신 시도");
        handleTokenRefresh();
      } else if (error.type === "INVALID_TOKEN") {
        console.log("🔒 잘못된 토큰 - 로그아웃 필요");
        // 잘못된 토큰 시 즉시 로그아웃
        window.location.href = "/auth";
      } else {
        console.log("❓ 기타 인증 오류");
        // 기타 인증 오류 시 재연결 시도
        setTimeout(() => {
          if (socket) {
            socket.connect();
          }
        }, 5000);
      }
    });

    socket.on("reconnect", (attemptNumber) => {
      console.log("🔄 소켓 재연결 성공:", attemptNumber);
    });

    socket.on("reconnect_error", (error) => {
      console.error("❌ Socket.IO 재연결 오류:", error);
    });

    return socket;
  } catch (error) {
    console.error("❌ 소켓 초기화 실패:", error);
    isInitializing = false;
    throw error;
  } finally {
    isInitializing = false;
  }
};

// Socket.IO 연결 해제
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// 현재 Socket 인스턴스 반환
export const getSocket = (): Socket | null => {
  return socket;
};
