'use client'

import { useSession, useSignOut } from '@/lib/auth/AuthProvider'
import { usePrincipalApi } from '@/hooks/principal/usePrincipalApi'
import { useEffect } from 'react'
import { EnrollmentRefundManagementContainer } from '@/components/dashboard/principal/person_management/enrollment_refund_management/containers/EnrollmentRefundManagementContainer'

export default function PrincipalEnrollmentManagementPage() {
  const { status } = useSession()
  const signOut = useSignOut()

  // API 기반 데이터 관리
  const { academy, loadAcademy, isLoading, error } = usePrincipalApi()

  // 컴포넌트 마운트 시 academy 데이터 로드
  useEffect(() => {
    loadAcademy();
  }, [loadAcademy]);

  // 로딩 상태 처리
  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-700" />
      </div>
    )
  }

  // 에러 처리
  if (error) {
    const errorResponse = error && typeof error === 'object' && 'response' in error 
      ? (error as { response?: { status?: number } })
      : null;
    if (errorResponse?.response?.status === 401) {
      signOut({ redirect: true, callbackUrl: '/' });
      return null;
    }
    
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-500">데이터를 불러오는데 실패했습니다.</p>
        <button
          onClick={() => loadAcademy()}
          className="mt-4 px-4 py-2 bg-stone-700 text-white rounded-lg hover:bg-stone-800"
        >
          다시 시도
        </button>
      </div>
    )
  }

  return (
    <div className="h-full">
      <EnrollmentRefundManagementContainer />
    </div>
  )
}
