'use client'

import * as React from 'react'


import { MenuLinks } from '@/components/navigation/MenuLinks'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { LogoutModal } from '@/components/user/LogoutModal'
import { useDashboardNavigation } from '@/contexts/DashboardContext'
import { logout } from '@/api/auth'
import FooterLinks from '@/components/common/FooterLinks'
import { usePrincipalApi } from '@/hooks/principal/usePrincipalApi'

export default function PrincipalProfilePage() {
  const router = useRouter()
  const [showLogoutModal, setShowLogoutModal] = React.useState(false)
  const { navigateToSubPage } = useDashboardNavigation()
  const { status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/auth')
    },
  })

  // API 기반 데이터 관리
  const { profile, loadProfile, isLoading, error } = usePrincipalApi()

  // 초기 데이터 로드
  React.useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleSignOut = async () => {
    try {
      // 백엔드 로그아웃 API 호출
      await logout()

      // next-auth 로그아웃 처리
      await signOut({ redirect: false })

      toast.success('로그아웃되었습니다')
      router.push('/auth')
    } catch (error) {
      console.error('Logout error:', error)
      // API 호출 실패 시에도 next-auth 로그아웃은 진행
      await signOut({ redirect: false })
      router.push('/auth')
      toast.error('로그아웃 중 오류가 발생했습니다')
    }
  }

  const handleProfileClick = () => {
    navigateToSubPage('profile')
  }

  const handlePersonalInfoClick = () => {
    navigateToSubPage('personal-info')
  }

  const handleBankInfoClick = () => {
    navigateToSubPage('bank-info')
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
      <div className="flex overflow-hidden flex-col pb-2 mx-auto w-full bg-white max-w-[480px] relative">
        <div className="flex flex-col px-5 py-6">
          <h1 className="text-2xl font-bold text-stone-700">
            프로필 정보
          </h1>
        </div>

        <div className="flex flex-col items-center justify-center flex-1 px-5">
          <p className="text-red-500 text-center">데이터를 불러오는데 실패했습니다.</p>
          <button
            onClick={() => loadProfile()}
            className="mt-4 px-4 py-2 bg-stone-700 text-white rounded-lg hover:bg-stone-800"
          >
            다시 시도
          </button>
        </div>

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

  return (
    <div className="flex overflow-hidden flex-col pb-2 mx-auto w-full bg-white max-w-[480px] relative">
      <div className="flex flex-col px-5 py-6">
        <h1 className="text-2xl font-bold text-stone-700">
          {profile?.name}님의 정보
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