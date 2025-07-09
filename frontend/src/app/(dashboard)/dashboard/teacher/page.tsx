'use client'

import { useSession, signOut } from 'next-auth/react'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import axios from 'axios'
import {
  AcademicCapIcon,
  UserGroupIcon,
  ClockIcon,
} from '@heroicons/react/24/outline'
import { TeacherProfile } from '@/components/teacher/TeacherProfile'
import { LogoutModal } from '@/components/user/LogoutModal'
import Image from 'next/image'

import axiosInstance from '@/lib/axios'

export default function TeacherDashboard() {
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

      // 백엔드 로그아웃 API 호출
      await axiosInstance.post('/auth/logout')

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

  const { data: myClasses } = useQuery({
    queryKey: ['teacher-classes'],
    queryFn: async () => {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/teacher/classes`,
      )
      return response.data
    },
  })

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-700" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 relative">
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">선생님 대시보드</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">
                {session?.user?.name}님 환영합니다
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 내 수업 카드 */}
            <div className="bg-white rounded-lg shadow-md border border-stone-100">
              <div className="px-4 py-3 bg-stone-700">
                <h2 className="text-lg font-semibold text-white">내 수업</h2>
              </div>
              <div className="p-4">
                <p className="text-stone-500 text-center py-4">
                  현재 담당하고 있는 수업: {myClasses?.length || 0}개
                </p>
              </div>
            </div>

            {/* 수강생 관리 카드 */}
            <div className="bg-white rounded-lg shadow-md border border-stone-100">
              <div className="px-4 py-3 bg-stone-700">
                <h2 className="text-lg font-semibold text-white">수강생 관리</h2>
              </div>
              <div className="p-4">
                <p className="text-stone-500 text-center py-4">
                  수강생 관리 기능이 곧 추가될 예정입니다.
                </p>
              </div>
            </div>

            {/* 수업 일정 카드 */}
            <div className="bg-white rounded-lg shadow-md border border-stone-100">
              <div className="px-4 py-3 bg-stone-700">
                <h2 className="text-lg font-semibold text-white">수업 일정</h2>
              </div>
              <div className="p-4">
                <p className="text-stone-500 text-center py-4">
                  수업 일정 관리 기능이 곧 추가될 예정입니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 로그아웃 버튼 추가 */}
      <div className="flex flex-col px-5 mt-auto">
        <button
          onClick={() => setShowLogoutModal(true)}
          className="mt-6 w-full py-4 text-base font-semibold text-neutral-400 rounded-lg border border-zinc-300"
        >
          로그아웃
        </button>
      </div>

      {/* 로그아웃 모달 */}
      {showLogoutModal && (
        <LogoutModal
          onLogout={handleSignOut}
          onClose={() => setShowLogoutModal(false)}
        />
      )}
    </div>
  )
}
