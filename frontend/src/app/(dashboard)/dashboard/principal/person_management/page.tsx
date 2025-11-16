'use client'

import { useSession, useSignOut } from '@/lib/auth/AuthProvider'
import { usePrincipalAcademy } from '@/hooks/queries/principal/usePrincipalAcademy'
import { TeacherStudentManagementContainer } from '@/components/dashboard/principal/person_management/teacher_student_management/containers/TeacherStudentManagementContainer'

export default function PrincipalPersonManagementPage() {
  const { status } = useSession()
  const signOut = useSignOut()

  // React Query 기반 데이터 관리
  const { data: academy, isLoading, error } = usePrincipalAcademy()

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
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-stone-700 text-white rounded-lg hover:bg-stone-800"
        >
          다시 시도
        </button>
      </div>
    )
  }

  return <TeacherStudentManagementContainer />
} 