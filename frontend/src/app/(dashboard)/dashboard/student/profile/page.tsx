'use client'

import * as React from 'react'

import { MenuLinks } from '@/components/navigation/MenuLinks'
import { useSession } from '@/lib/auth/AuthProvider'
import { LogoutModal } from '@/components/user/LogoutModal'
import { useLogout } from '@/hooks/auth/useLogout'
import FooterLinks from '@/components/common/FooterLinks'
import { useRouter } from 'next/navigation'
import { ensureTrailingSlash } from '@/lib/utils/router'

export default function ProfilePage() {
  const [showLogoutModal, setShowLogoutModal] = React.useState(false)
  const router = useRouter()
  const { data: session, status } = useSession()

  const { logout } = useLogout()

  const handleSignOut = async () => {
    await logout()
  }

  const handleAcademyClick = () => {
    router.push(ensureTrailingSlash('/dashboard/student/profile/academy'))
  }

  const handlePersonalInfoClick = () => {
    router.push(ensureTrailingSlash('/dashboard/student/profile/personal-info'))
  }

  const handleEnrollmentHistoryClick = () => {
    router.push(ensureTrailingSlash('/dashboard/student/profile/enrollment-history'))
  }

  const handleRefundHistoryClick = () => {
    router.push(ensureTrailingSlash('/dashboard/student/profile/cancellation-history'))
  }

  const handleRefundAccountClick = () => {
    router.push(ensureTrailingSlash('/dashboard/student/profile/refund-account'))
  }

  const handleSettingsClick = () => {
    router.push(ensureTrailingSlash('/dashboard/student/profile/settings'))
  }

  const menuLinks = [
    {
      label: '내 학원 관리',
      icon: '/icons/group.svg',
      onClick: handleAcademyClick,
    },
    {
      label: '개인 정보',
      icon: '/icons/group.svg',
      onClick: handlePersonalInfoClick,
    },
    {
      label: '신청/결제 내역',
      icon: '/icons/group.svg',
      onClick: handleEnrollmentHistoryClick,
    },
    {
      label: '환불/취소 내역',
      icon: '/icons/group.svg',
      onClick: handleRefundHistoryClick,
    },
    {
      label: '환불 계좌 정보',
      icon: '/icons/group.svg',
      onClick: handleRefundAccountClick,
    },
    {
      label: '설정',
      icon: '/icons/group.svg',
      onClick: handleSettingsClick,
    },
  ]

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-700" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full mx-auto w-full bg-white max-w-[480px] relative">
      {/* Header - 고정 높이 */}
      <header className="flex-shrink-0 flex flex-col px-5 py-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-stone-700">
          {session?.user?.name}님의 정보
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