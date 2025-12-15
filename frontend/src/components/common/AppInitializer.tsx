'use client'

import { useSession } from '@/lib/auth/AuthProvider'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { AuthRouter } from '@/lib/auth/AuthRouter'
import { StatusBarHandler } from './StatusBarHandler'

interface AppInitializerProps {
  children: React.ReactNode
}

// 줌 비활성화 유틸리티
function preventZoom() {
  // 더블 탭 줌 방지
  let lastTouchEnd = 0;
  document.addEventListener('touchend', (event) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
      event.preventDefault();
    }
    lastTouchEnd = now;
  }, { passive: false });

  // 제스처 줌 방지 (Ctrl + wheel, pinch zoom)
  document.addEventListener('wheel', (event) => {
    if (event.ctrlKey) {
      event.preventDefault();
    }
  }, { passive: false });

  // 키보드 줌 방지 (Ctrl +/-, Cmd +/-)
  document.addEventListener('keydown', (event) => {
    if (
      (event.ctrlKey || event.metaKey) &&
      (event.key === '+' || event.key === '-' || event.key === '=')
    ) {
      event.preventDefault();
    }
  });

  // gesturestart, gesturechange, gestureend 이벤트 방지 (iOS)
  document.addEventListener('gesturestart', (event) => event.preventDefault());
  document.addEventListener('gesturechange', (event) => event.preventDefault());
  document.addEventListener('gestureend', (event) => event.preventDefault());
}

interface LoadingStateProps {
  message: string;
  subMessage?: string;
}

function LoadingState({ message, subMessage }: LoadingStateProps) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">{message}</p>
        {subMessage && <p className="text-sm text-gray-500 mt-2">{subMessage}</p>}
      </div>
    </div>
  );
}

export function AppInitializer({ children }: AppInitializerProps) {
  const { status } = useSession()
  const router = useRouter()

  // AuthRouter에 Next.js router 설정
  useEffect(() => {
    AuthRouter.setRouter(router);
  }, [router])

  // 줌 비활성화 설정
  useEffect(() => {
    preventZoom();
  }, [])

  // 로딩 중일 때 스피너 표시
  if (status === 'loading') {
    return (
      <LoadingState 
        message="앱을 초기화하는 중..." 
        subMessage="잠시만 기다려주세요" 
      />
    )
  }

  // 초기화가 완료되면 자식 컴포넌트 렌더링
  return (
    <>
      <StatusBarHandler />
      {children}
    </>
  )
} 