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
import { TeacherNavigation } from '@/components/navigation/TeacherNavigation'
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
    <div className="flex overflow-hidden flex-col pb-2 mx-auto w-full bg-white max-w-[480px]">
      {/* 상단 로고 섹션 */}
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

      {/* 헤더 섹션 */}
      <div className="flex flex-col px-5 py-6">
        <h1 className="text-2xl font-bold text-stone-700">
          {session?.user?.name}님의 선생님 대시보드
        </h1>
        <p className="mt-2 text-stone-500">
          수업과 수강생 정보를 확인할 수 있습니다.
        </p>
      </div>

      <div className="px-5 space-y-4">
        {/* 내 수업 카드 */}
        <div className="bg-white rounded-lg shadow-md border border-stone-100">
          <div className="px-4 py-3 bg-stone-700">
            <h2 className="text-lg font-semibold text-white">내 수업</h2>
          </div>
          <div className="p-4">
            <div className="space-y-4">
              {myClasses?.map((class_) => (
                <div
                  key={class_.id}
                  className="bg-stone-50 p-3 rounded-lg hover:bg-stone-100 transition-colors duration-200"
                >
                  <p className="font-semibold text-stone-900">
                    {class_.className}
                  </p>
                  <p className="text-sm text-stone-600">
                    {class_.dayOfWeek}요일 {class_.time}
                  </p>
                  <p className="text-sm text-stone-500">
                    수강생: {class_.currentStudents}/{class_.maxStudents}명
                  </p>
                </div>
              ))}
            </div>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <LogoutModal
            onLogout={handleSignOut}
            onClose={() => setShowLogoutModal(false)}
          />
        </div>
      )}
    </div>
  )
}
