import { useEffect, useState, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { initializeSocket, disconnectSocket, getSocket } from "@/lib/socket";
import type {
  SocketEventName,
  SocketEventData,
  ClientEventName,
  ClientEventData,
} from "@/types/socket";

export function useSocket() {
  const { data: session, status } = useSession();
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const socketRef = useRef<any>(null);

  // Socket 연결
  const connect = useCallback(async () => {
    if (status !== "authenticated" || !session?.accessToken) {
      return;
    }

    try {
      setIsConnecting(true);
      const socket = await initializeSocket();
      socketRef.current = socket;
      setIsConnected(socket.connected);
    } catch (error) {
      console.error("Socket 연결 실패:", error);
      setIsConnected(false);
    } finally {
      setIsConnecting(false);
    }
  }, [session, status]);

  // Socket 연결 해제
  const disconnect = useCallback(() => {
    disconnectSocket();
    socketRef.current = null;
    setIsConnected(false);
  }, []);

  // 이벤트 리스너 등록
  const on = useCallback(
    <T extends SocketEventName>(
      event: T,
      callback: (data: SocketEventData<T>) => void
    ) => {
      const socket = getSocket();
      if (socket) {
        socket.on(event, callback as any);
        return () => socket.off(event, callback as any);
      }
    },
    []
  );

  // 이벤트 발생
  const emit = useCallback(
    <T extends ClientEventName>(event: T, data?: ClientEventData<T>) => {
      const socket = getSocket();
      if (socket) {
        socket.emit(event, data);
      }
    },
    []
  );

  // 연결 상태 모니터링
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleConnect = () => {
      setIsConnected(true);
    };
    const handleDisconnect = () => setIsConnected(false);

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    // 초기 상태 설정
    setIsConnected(socket.connected);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
    };
  }, []);

  // 세션 변경 시 Socket 연결 관리
  useEffect(() => {
    if (status === "authenticated" && session?.accessToken) {
      connect();
    } else if (status === "unauthenticated") {
      disconnect();
    }
  }, [status, session, connect, disconnect]);

  // 컴포넌트 언마운트 시 연결 해제
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    isConnected,
    isConnecting,
    connect,
    disconnect,
    on,
    emit,
    socket: socketRef.current,
  };
}

// 특정 이벤트를 구독하는 훅
export function useSocketEvent<T extends SocketEventName>(
  event: T,
  callback: (data: SocketEventData<T>) => void
) {
  const { on } = useSocket();

  useEffect(() => {
    const cleanup = on(event, callback);
    return () => {
      if (cleanup) cleanup();
    };
  }, [event, callback, on]);
}

// Socket 연결 상태만 필요한 경우
export function useSocketConnection() {
  const { isConnected, isConnecting } = useSocket();
  return { isConnected, isConnecting };
}
