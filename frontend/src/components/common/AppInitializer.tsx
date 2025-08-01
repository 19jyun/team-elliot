'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useTeacherInitialization } from '@/hooks/redux/useTeacherInitialization'
import { usePrincipalInitialization } from '@/hooks/redux/usePrincipalInitialization'

interface AppInitializerProps {
  children: React.ReactNode
}

export function AppInitializer({ children }: AppInitializerProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  // 역할별 초기화 (항상 호출하되, 내부에서 역할에 따라 처리)
  const teacherInit = useTeacherInitialization()
  const principalInit = usePrincipalInitialization()

  // 인증되지 않은 사용자는 로그인 페이지로 리다이렉트
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth')
    }
  }, [status, router])

  // 로딩 중일 때 스피너 표시
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">앱을 초기화하는 중...</p>
          <p className="text-sm text-gray-500 mt-2">잠시만 기다려주세요</p>
        </div>
      </div>
    )
  }

  // 인증되지 않은 경우 로딩 표시
  if (status === 'unauthenticated') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 mx-auto mb-4"></div>
          <p className="text-gray-600">인증 확인 중...</p>
        </div>
      </div>
    )
  }

  // 초기화가 완료되면 자식 컴포넌트 렌더링
  return <>{children}</>
} 