'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Image from 'next/image'
import { toast } from 'sonner'
import { TeacherNavigation } from '@/components/navigation/TeacherNavigation'
import { LogoutModal } from '@/components/user/LogoutModal'
import axiosInstance from '@/lib/axios'

export default function TeacherProfilePage() {
  const router = useRouter()
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/login')
    },
  })

  const handleSignOut = async () => {
    try {
      if (!session?.user) return
      await axiosInstance.post('/auth/logout')
      await signOut({ redirect: false })
      toast.success('로그아웃되었습니다')
      router.push('/login')
    } catch (error) {
      toast.error('로그아웃 중 오류가 발생했습니다')
    }
  }

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
        <div className="flex gap-2.5 justify-center items-center px-2.5 py-4 w-full min-h-[60px]">
          <Image
            src="/images/logo/team-eliot-3.png"
            alt="Team Eliot Logo"
            width={77}
            height={46}
            className="object-contain"
            priority
          />
        </div>
        <TeacherNavigation />
      </div>

      <div className="flex flex-col px-5 py-6">
        <h1 className="text-2xl font-bold text-stone-700">
          {session?.user?.name}님의 정보
        </h1>
      </div>

      <div className="px-5 space-y-4">
        <div className="bg-white rounded-lg shadow-md border border-stone-100">
          <div className="px-4 py-3 bg-stone-700">
            <h2 className="text-lg font-semibold text-white">개인정보</h2>
          </div>
          <div className="p-4">
            <p className="text-stone-600">이메일: {session?.user?.email}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
