'use client'

import { useSession, signOut } from 'next-auth/react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { toast } from 'sonner'
import { AddTeacherModal } from '@/components/admin/AddTeacherModal'
import { AddClassModal } from '@/components/admin/AddClassModal'
import { TrashIcon } from '@heroicons/react/24/outline'
import Image from 'next/image'


import { LogoutModal } from '@/components/user/LogoutModal'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axiosInstance from '@/lib/axios'

export default function AdminDashboard() {
  const router = useRouter()
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/login')
    },
  })

  useEffect(() => {
    console.log('Current session:', session)
  }, [session])

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

  const queryClient = useQueryClient()

  const { data: teachersData, error: teachersError } = useQuery({
    queryKey: ['teachers'],
    queryFn: async () => {
      try {
        const response = await axiosInstance.get('/admin/teachers')
        return response.data
      } catch (error) {
        console.error('Teachers fetch error:', error)
        throw error
      }
    },
  })

  const { data: classes } = useQuery({
    queryKey: ['classes'],
    queryFn: () => axiosInstance.get('/admin/classes').then((res) => res.data),
  })

  const { data: withdrawalStats } = useQuery({
    queryKey: ['withdrawalStats'],
    queryFn: async () => {
      try {
        const response = await axiosInstance.get(`/admin/withdrawal-stats`)
        return response.data
      } catch (error) {
        console.error('Withdrawal stats fetch error:', error)
        return { byCategory: [], recentWithdrawals: [] } // 기본값 제공
      }
    },
  })

  const deleteTeacherMutation = useMutation({
    mutationFn: (id: number) => axiosInstance.delete(`/admin/teachers/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] })
      toast.success('선생님이 삭제되었습니다.')
    },
  })

  const deleteClassMutation = useMutation({
    mutationFn: (id: number) => axiosInstance.delete(`/admin/classes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] })
      toast.success('수업이 삭제되었습니다.')
    },
  })

  const getCategoryLabel = (category: string) => {
    const labels = {
      DISSATISFACTION: '서비스 불만족',
      UNUSED: '이용 빈도 낮음',
      PRIVACY: '개인정보 보호',
      OTHER: '기타',
    }
    return labels[category as keyof typeof labels] || category
  }

  const [showAddStudent, setShowAddStudent] = useState(false)
  const [showAddTeacher, setShowAddTeacher] = useState(false)
  const [showAddClass, setShowAddClass] = useState(false)

  const addTeacherMutation = useMutation({
    mutationFn: (data: any) =>
      axiosInstance.post(`/admin/teachers`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] })
      toast.success('선생님이 추가되었습니다.')
      setShowAddTeacher(false)
    },
  })

  const addClassMutation = useMutation({
    mutationFn: (data: any) =>
      axiosInstance.post(`/admin/classes`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] })
      toast.success('수업이 추가되었습니다.')
      setShowAddClass(false)
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


      {/* 헤더 섹션 */}
      <div className="flex flex-col px-5 py-6">
        <h1 className="text-2xl font-bold text-stone-700">
          {session?.user?.name}님의 관리자 대시보드
        </h1>
        <p className="mt-2 text-stone-500">
          수강생, 선생님, 수업을 관리할 수 있습니다.
        </p>
      </div>

      <div className="px-5 space-y-4">
        {/* 회원 탈퇴 통계 카드 */}
        <div className="bg-white rounded-lg shadow-md border border-stone-100">
          <div className="px-4 py-3 bg-stone-700">
            <h2 className="text-lg font-semibold text-white">회원 탈퇴 통계</h2>
          </div>
          <div className="p-4">
            <div className="space-y-4">
              {/* 탈퇴 사유 카테고리별 통계 */}
              <div className="grid grid-cols-2 gap-4">
                {withdrawalStats?.byCategory?.map((stat: any) => (
                  <div
                    key={stat.category}
                    className="bg-stone-50 p-3 rounded-lg"
                  >
                    <p className="font-semibold text-stone-900">
                      {getCategoryLabel(stat.category)}
                    </p>
                    <p className="text-2xl font-bold text-stone-700">
                      {stat.count}명
                    </p>
                    <p className="text-sm text-stone-500">
                      {stat.percentage.toFixed(1)}%
                    </p>
                  </div>
                ))}
              </div>

              {/* 최근 탈퇴 이력 */}
              <div className="mt-4">
                <h3 className="text-md font-semibold mb-2">최근 탈퇴 이력</h3>
                <div className="space-y-2">
                  {withdrawalStats?.recentWithdrawals?.map((withdrawal: any) => (
                    <div
                      key={withdrawal.id}
                      className="bg-stone-50 p-3 rounded-lg"
                    >
                      <p className="font-semibold text-stone-900">
                        {withdrawal.userName}
                      </p>
                      <p className="text-sm text-stone-600">
                        {withdrawal.reason}
                      </p>
                      <p className="text-sm text-stone-500">
                        {new Date(withdrawal.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 로그아웃 버튼 */}
      <div className="flex flex-col px-5 mt-auto">
        <button
          onClick={() => setShowLogoutModal(true)}
          className="mt-6 w-full py-4 text-base font-semibold text-neutral-400 rounded-lg border border-zinc-300"
        >
          로그아웃
        </button>
      </div>

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
