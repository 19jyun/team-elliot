'use client'

import { useSocketConnection } from '@/hooks/useSocket'

export function SocketStatus() {
  const { isConnected, isConnecting } = useSocketConnection()

  if (isConnecting) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <div className="flex items-center space-x-2 bg-yellow-500 text-white px-3 py-2 rounded-lg shadow-lg">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          <span className="text-sm font-medium">연결 중...</span>
        </div>
      </div>
    )
  }

  if (!isConnected) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <div className="flex items-center space-x-2 bg-red-500 text-white px-3 py-2 rounded-lg shadow-lg">
          <div className="w-2 h-2 bg-white rounded-full"></div>
          <span className="text-sm font-medium">연결 끊김</span>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="flex items-center space-x-2 bg-green-500 text-white px-3 py-2 rounded-lg shadow-lg">
        <div className="w-2 h-2 bg-white rounded-full"></div>
        <span className="text-sm font-medium">실시간 연결됨</span>
      </div>
    </div>
  )
} 