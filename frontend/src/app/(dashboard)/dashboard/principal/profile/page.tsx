'use client'

import * as React from 'react'

import { MenuLinks } from '@/components/navigation/MenuLinks'
import { useSession } from '@/lib/auth/AuthProvider'
import { LogoutModal } from '@/components/user/LogoutModal'
import { useLogout } from '@/hooks/auth/useLogout'
import FooterLinks from '@/components/common/FooterLinks'
import { usePrincipalProfile } from '@/hooks/queries/principal/usePrincipalProfile'
import { useRouter } from 'next/navigation'
import type { PrincipalProfile } from '@/types/api/principal'
import { ensureTrailingSlash } from '@/lib/utils/router'

export default function PrincipalProfilePage() {
  const [showLogoutModal, setShowLogoutModal] = React.useState(false)
  const router = useRouter()
  const { data: session, status } = useSession()

  // React Query 기반 데이터 관리
  const { data: profile, isLoading, error } = usePrincipalProfile()
  
  // 타입 안전성을 위한 타입 단언
  const profileData = profile as PrincipalProfile | null | undefined

  const { logout } = useLogout()

  const handleSignOut = async () => {
    await logout()
  }

  const handleProfileClick = () => {
    router.push(ensureTrailingSlash('/dashboard/principal/profile/profile'))
  }

  const handlePersonalInfoClick = () => {
    router.push(ensureTrailingSlash('/dashboard/principal/profile/personal-info'))
  }

  const handleBankInfoClick = () => {
    router.push(ensureTrailingSlash('/dashboard/principal/profile/bank-info'))
  }

  const handleAcademyManagementClick = () => {
    router.push(ensureTrailingSlash('/dashboard/principal/profile/academy-management'))
  }

  const handleSettingsClick = () => {
    router.push(ensureTrailingSlash('/dashboard/principal/profile/settings'))
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
      label: '은행 정보',
      icon: '/icons/group.svg',
      onClick: handleBankInfoClick,
    },
    {
      label: '학원 관리',
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
        {/* Header - 고정 */}
        <header className="flex-shrink-0 flex flex-col px-5 py-6">
          <h1 className="text-2xl font-bold text-stone-700">
            프로필 정보
          </h1>
        </header>

        {/* Main Content - 스크롤 가능 */}
        <main className="flex-1 min-h-0 overflow-y-auto">
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

        {/* Footer - 하단 고정 */}
        <footer className="flex-shrink-0 flex flex-col pb-2">
          <div className="flex flex-col px-5 py-10">
            <button
              onClick={() => setShowLogoutModal(true)}
              className="mt-6 w-full py-4 text-base font-semibold text-neutral-400 rounded-lg border border-zinc-300"
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
      {/* Header - 고정 */}
      <header className="flex-shrink-0 flex flex-col px-5 py-6">
        <h1 className="text-2xl font-bold text-stone-700">
          {profileData?.name || session?.user?.name}님의 정보
        </h1>
      </header>

      {/* Main Content - 스크롤 가능 */}
      <main className="flex-1 min-h-0 overflow-y-auto">
        <MenuLinks links={menuLinks} />
      </main>

      {/* Footer - 하단 고정 */}
      <footer className="flex-shrink-0 flex flex-col pb-2">
        <div className="flex flex-col px-5 py-10">
          <button
            onClick={() => setShowLogoutModal(true)}
            className="mt-6 w-full py-4 text-base font-semibold text-neutral-400 rounded-lg border border-zinc-300"
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