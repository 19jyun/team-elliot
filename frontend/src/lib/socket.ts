import { io, Socket } from "socket.io-client";
import { getSession } from "next-auth/react";

// Socket.IO 클라이언트 인스턴스
let socket: Socket | null = null;
let isInitializing = false;

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

  try {
    // 세션에서 JWT 토큰 가져오기
    const session = await getSession();
    const token = session?.accessToken;

    if (!token) {
      throw new Error("인증 토큰이 없습니다.");
    }

    // Socket.IO 클라이언트 생성
    socket = io(
      process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001",
      {
        auth: {
          token,
        },
        transports: ["websocket", "polling"],
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      }
    );

    // 연결 이벤트 리스너 (한 번만 로그 출력)
    let hasLoggedConnection = false;
    socket.on("connect", () => {
      if (!hasLoggedConnection) {
        hasLoggedConnection = true;
      }
    });

    socket.on("disconnect", (reason) => {
    });

    socket.on("connect_error", (error) => {
      console.error("❌ Socket.IO 연결 오류:", error);
    });

    socket.on("reconnect", (attemptNumber) => {
    });

    socket.on("reconnect_error", (error) => {
      console.error("❌ Socket.IO 재연결 오류:", error);
    });

    return socket;
  } catch (error) {
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

// 연결 상태 확인
export const isSocketConnected = (): boolean => {
  return socket?.connected || false;
};

// 연결 상태 구독
export const onSocketStateChange = (callback: (connected: boolean) => void) => {
  if (!socket) return;

  const handleConnect = () => callback(true);
  const handleDisconnect = () => callback(false);

  socket.on("connect", handleConnect);
  socket.on("disconnect", handleDisconnect);

  // 초기 상태 전달
  callback(socket.connected);

  // 클린업 함수 반환
  return () => {
    socket?.off("connect", handleConnect);
    socket?.off("disconnect", handleDisconnect);
  };
};
