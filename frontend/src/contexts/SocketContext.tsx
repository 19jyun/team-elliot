'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSession } from '@/lib/auth/AuthProvider';
import { initializeSocket, disconnectSocket, getSocket } from '@/lib/socket';
import { Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    let socketInstance: Socket | null = null;

    const handleConnection = async () => {
      if (status === 'authenticated' && session?.accessToken) {
        try {
          socketInstance = await initializeSocket();

          setIsConnected(socketInstance.connected);

          socketInstance.on('connect', () => {
            console.log('✅ Global Socket Connected');
            setIsConnected(true);
          });

          socketInstance.on('disconnect', () => {
            console.log('🔌 Global Socket Disconnected');
            setIsConnected(false);
          });

        } catch (error) {
          console.error('❌ Global Socket connection failed:', error);
          setIsConnected(false);
        }
      } 
      else if (status === 'unauthenticated') {
        if (getSocket()) {
          console.log('🔒 User logged out, disconnecting socket...');
          disconnectSocket();
          setIsConnected(false);
        }
      }
    };

    handleConnection();

    return () => {
      if (socketInstance) {
        socketInstance.off('connect');
        socketInstance.off('disconnect');
      }
    };
  }, [session, status]); // 세션 정보나 인증 상태가 바뀔 때만 로직 재실행

  return (
    <SocketContext.Provider value={{ socket: getSocket(), isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocketContext = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocketContext must be used within a SocketProvider');
  }
  return context;
};

