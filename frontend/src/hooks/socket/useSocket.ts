import { useCallback, useEffect } from "react";
import { useSocketContext } from "@/contexts/SocketContext";
import type {
  SocketEventName,
  SocketEventData,
  ClientEventName,
  ClientEventData,
} from "@/types/socket";

function useSocket() {
  // Context에서 소켓 인스턴스와 연결 상태를 가져옴
  const { socket, isConnected } = useSocketContext();

  // 이벤트 리스너 등록
  const on = useCallback(
    <T extends SocketEventName>(
      event: T,
      callback: (data: SocketEventData<T>) => void
    ) => {
      if (socket) {
        (
          socket as {
            on: (event: string, callback: (data: unknown) => void) => void;
          }
        ).on(event, callback as (data: unknown) => void);
        return () =>
          (
            socket as {
              off: (event: string, callback: (data: unknown) => void) => void;
            }
          ).off(event, callback as (data: unknown) => void);
      }
      return undefined;
    },
    [socket] // socket 인스턴스 변경 시에만 on이 갱신됨
  );

  // 이벤트 발생
  const emit = useCallback(
    <T extends ClientEventName>(event: T, data?: ClientEventData<T>) => {
      if (socket) {
        socket.emit(event, data);
      }
    },
    [socket]
  );

  return {
    isConnected,
    socket,
    on,
    emit,
    // connect, disconnect는 Context에서 관리하므로 제거
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
