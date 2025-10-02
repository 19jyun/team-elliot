'use client'

import { useSession } from '@/lib/auth/AuthProvider'
import { useSlidingSession } from '@/lib/auth/useSlidingSession'
import { ReactNode } from 'react'

interface SlidingSessionProviderProps {
  children: ReactNode
}

export function SlidingSessionProvider({ children }: SlidingSessionProviderProps) {
  const { data: _session } = useSession()
  
  // 항상 훅을 호출하되, 로그인된 사용자에게만 기능 적용
  useSlidingSession()

  return <>{children}</>
}