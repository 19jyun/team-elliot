'use client'

import * as React from 'react'

import { StatusBar } from '@/components/ui/StatusBar'
import { MenuLinks } from '@/components/navigation/MenuLinks'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { LogoutModal } from '@/components/user/LogoutModal'
import { useDashboardNavigation } from '@/contexts/DashboardContext'
import { logout } from '@/api/auth'
import FooterLinks from '@/components/common/FooterLinks'

export default function TeacherProfilePage() {
  const router = useRouter()
  const [showLogoutModal, setShowLogoutModal] = React.useState(false)
  const { navigateToSubPage } = useDashboardNavigation()
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/login')
    },
  })

  const handleSignOut = async () => {
    try {
      if (!session?.user) return

      // 백엔드 로그아웃 API 호출
      await logout()

      // next-auth 로그아웃 처리
      await signOut({ redirect: false })

      toast.success('로그아웃되었습니다')
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
      // API 호출 실패 시에도 next-auth 로그아웃은 진행
      await signOut({ redirect: false })
      router.push('/login')
      toast.error('로그아웃 중 오류가 발생했습니다')
    }
  }

  const handleProfileClick = () => {
    navigateToSubPage('profile')
  }

  const handlePersonalInfoClick = () => {
    navigateToSubPage('personal-info')
  }

  const handleAcademyManagementClick = () => {
    navigateToSubPage('academy-management')
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
  ]

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-700" />
      </div>
    )
  }

  return (
    <div className="flex overflow-hidden flex-col pb-2 mx-auto w-full bg-white max-w-[480px] relative">
      <StatusBar 
        time="9:41"
        icons={[
          { src: '/icons/signal.svg', alt: 'Signal', width: 'w-4', aspectRatio: 'square' },
          { src: '/icons/wifi.svg', alt: 'WiFi', width: 'w-4', aspectRatio: 'square' },
          { src: '/icons/battery.svg', alt: 'Battery', width: 'w-6', aspectRatio: 'square' }
        ]}
        logoSrc="/icons/logo.svg"
      />
      <div className="flex flex-col px-5 py-6">
        <h1 className="text-2xl font-bold text-stone-700">
          {session?.user?.name}님의 정보
        </h1>
      </div>

      <MenuLinks links={menuLinks} />

      <div className="flex flex-col px-5 py-10 mt-auto">
        <button
          onClick={() => setShowLogoutModal(true)}
          className="mt-6 w-full py-4 text-base font-semibold text-neutral-400 rounded-lg border border-zinc-300"
        >
          로그아웃
        </button>
      </div>

      <FooterLinks />

      {showLogoutModal && (
        <LogoutModal
          onLogout={handleSignOut}
          onClose={() => setShowLogoutModal(false)}
        />
      )}
    </div>
  )
}
