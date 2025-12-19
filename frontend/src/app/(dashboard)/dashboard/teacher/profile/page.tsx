'use client'

import * as React from 'react'

import { MenuLinks } from '@/components/navigation/MenuLinks'
import { useSession } from '@/lib/auth/AuthProvider'
import { LogoutModal } from '@/components/user/LogoutModal'
import { useLogout } from '@/hooks/auth/useLogout'
import FooterLinks from '@/components/common/FooterLinks'
import { useTeacherProfile } from '@/hooks/queries/teacher/useTeacherProfile'
import { useRouter } from 'next/navigation'
import type { TeacherProfileResponse } from '@/types/api/teacher'
import { ensureTrailingSlash } from '@/lib/utils/router'
export default function TeacherProfilePage() {
  const [showLogoutModal, setShowLogoutModal] = React.useState(false)
  const router = useRouter()
  const { data: session, status } = useSession()

  // React Query 기반 데이터 관리
  const { data: profile, isLoading, error } = useTeacherProfile()
  const { logout } = useLogout()
  const profileData = profile as TeacherProfileResponse | null | undefined

  const handleSignOut = async () => {
    await logout()
  }

  const handleProfileClick = () => {
    router.push(ensureTrailingSlash('/dashboard/teacher/profile/profile'))
  }

  const handlePersonalInfoClick = () => {
    router.push(ensureTrailingSlash('/dashboard/teacher/profile/personal-info'))
  }

  const handleAcademyManagementClick = () => {
    router.push(ensureTrailingSlash('/dashboard/teacher/profile/academy-management'))
  }

  const handleSettingsClick = () => {
    router.push(ensureTrailingSlash('/dashboard/teacher/profile/settings'))
  }

  const menuLinks = [
    {
      label: '내 프로필 관리',
      icon: '/icons/group.svg',
      onClick: handleProfileClick,
    },
    {
      label: '개인 정보',
      icon: '/icons/group.svg',
      onClick: handlePersonalInfoClick,
    },
    {
      label: '내 학원 관리',
      icon: '/icons/group.svg',
      onClick: handleAcademyManagementClick,
    },
    {
      label: '설정',
      icon: '/icons/group.svg',
      onClick: handleSettingsClick,
    },
  ]

  // 로딩 상태 처리
  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-700" />
      </div>
    )
  }

  // 에러 처리 - 로그아웃 버튼은 항상 표시
  if (error) {
    return (
      <div className="flex flex-col h-full mx-auto w-full bg-white max-w-[480px] relative">
        {/* Header - 고정 높이 */}
        <header className="flex-shrink-0 flex flex-col px-5 py-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-stone-700">
            프로필 정보
          </h1>
        </header>

        {/* Main Content - 고정 높이 + 스크롤 */}
        <main className="flex-shrink-0 overflow-y-auto" style={{ height: 'calc(100vh - 370px)' }}>
          <div className="flex flex-col items-center justify-center min-h-full px-5">
            <p className="text-red-500 text-center">데이터를 불러오는데 실패했습니다.</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-stone-700 text-white rounded-lg hover:bg-stone-800"
            >
              다시 시도
            </button>
          </div>
        </main>

        {/* Footer - 하단 고정 (절대 줄어들지 않음) */}
        <footer className="flex-shrink-0 flex flex-col bg-white z-50 border-t border-gray-200">
          <div className="flex flex-col px-5 py-4">
            <button
              onClick={() => setShowLogoutModal(true)}
              className="w-full py-4 text-base font-semibold text-neutral-400 rounded-lg border border-zinc-300 hover:bg-gray-50 transition-colors"
            >
              로그아웃
            </button>
          </div>
          <FooterLinks />
        </footer>

        {showLogoutModal && (
          <LogoutModal
            onLogout={handleSignOut}
            onClose={() => setShowLogoutModal(false)}
          />
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full mx-auto w-full bg-white max-w-[480px] relative">
      {/* Header - 고정 높이 */}
      <header className="flex-shrink-0 flex flex-col px-5 py-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-stone-700">
          {profileData?.name || session?.user?.name}님의 정보
        </h1>
      </header>

      {/* Main Content - 고정 높이 + 스크롤 */}
      <main className="flex-shrink-0 overflow-y-auto" style={{ height: 'calc(100vh - 370px)' }}>
        <MenuLinks links={menuLinks} />
      </main>

      {/* Footer - 하단 고정 (절대 줄어들지 않음) */}
      <footer className="flex-shrink-0 flex flex-col bg-white z-50 border-t border-gray-200">
        <div className="flex flex-col px-5 py-4">
          <button
            onClick={() => setShowLogoutModal(true)}
            className="w-full py-4 text-base font-semibold text-neutral-400 rounded-lg border border-zinc-300 hover:bg-gray-50 transition-colors"
          >
            로그아웃
          </button>
        </div>
        <FooterLinks />
      </footer>

      {showLogoutModal && (
        <LogoutModal
          onLogout={handleSignOut}
          onClose={() => setShowLogoutModal(false)}
        />
      )}
    </div>
  )
}
