'use client'

import * as React from 'react'
import { Navigation } from '@/components/navigation/Navigation'
import { StatusBar } from '@/components/ui/StatusBar'
import { MenuLinks } from '@/components/navigation/MenuLinks'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import axios from 'axios'
import { LogoutModal } from '@/components/user/LogoutModal'

export default function ProfilePage() {
  const router = useRouter()
  const [showLogoutModal, setShowLogoutModal] = React.useState(false)
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
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/logout`,
        {},
        {
          headers: {
            Authorization: `Bearer ${session.user.id}`,
          },
        },
      )

      // next-auth 로그아웃 처리
      await signOut({ redirect: false })

      toast.success('로그아웃되었습니다')
      router.push('/login')
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          await signOut({ redirect: false })
          router.push('/login')
          return
        }
        console.error('API Error:', error.response?.data)
      }
      toast.error('로그아웃 중 오류가 발생했습니다')
    }
  }

  const menuLinks = [
    {
      label: '내 학원 관리',
      icon: '/icons/group.svg',
      href: '/dashboard/student/profile/academy',
    },
    {
      label: '개인 정보',
      icon: '/icons/group.svg',
      href: '/dashboard/student/profile/info',
    },
    {
      label: '신청/결제 내역',
      icon: '/icons/group.svg',
      href: '/dashboard/student/profile/payments',
    },
    {
      label: '환불/취소 내역',
      icon: '/icons/group.svg',
      href: '/dashboard/student/profile/refunds',
    },
  ]

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-700" />
      </div>
    )
  }

  return (
    <div className="flex overflow-hidden flex-col pb-2 mx-auto w-full bg-white max-w-[480px]">

      <div className="flex flex-col w-full">
        <div className="flex gap-2.5 justify-center items-center px-2.5 py-2 w-full min-h-[60px]">
          <img
            src="/images/logo/team-eliot-1.png"
            alt="Team Eliot Logo"
            className="object-contain self-stretch my-auto aspect-[1.68] w-[77px]"
          />
        </div>
        <Navigation />
      </div>

      <div className="flex flex-col px-5 py-6">
        <h1 className="text-2xl font-bold text-stone-700">
          {session?.user?.name}님의 정보
        </h1>
      </div>

      <MenuLinks links={menuLinks} />

      <div className="flex flex-col px-5 mt-auto">
        <button
          onClick={() => setShowLogoutModal(true)}
          className="mt-6 w-full py-4 text-base font-semibold text-neutral-400 rounded-lg border border-zinc-300"
        >
          로그아웃
        </button>
      </div>

      <footer className="flex flex-col px-5 pt-3.5 pb-12 mt-6 w-full text-sm font-medium bg-neutral-100 min-h-[80px] text-neutral-400">
        <nav className="flex gap-6 justify-center items-center max-w-full w-[335px]">
          <a href="/terms" className="hover:text-neutral-600">
            이용약관
          </a>
          <a href="/privacy" className="hover:text-neutral-600">
            개인정보처리방침
          </a>
          <a href="/withdrawal" className="hover:text-neutral-600">
            회원탈퇴
          </a>
        </nav>
      </footer>

      {showLogoutModal && (
        <div className="fixed inset-0 z-50">
          <LogoutModal
            onLogout={handleSignOut}
            onClose={() => setShowLogoutModal(false)}
          />
        </div>
      )}
    </div>
  )
}
