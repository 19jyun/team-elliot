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
  const [showAddTeacherModal, setShowAddTeacherModal] = useState(false)
  const [showAddClassModal, setShowAddClassModal] = useState(false)
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

  const { data: academies } = useQuery({
    queryKey: ['academies'],
    queryFn: async () => {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/academies`,
      )
      return response.data
    },
  })

  const { data: teachers } = useQuery({
    queryKey: ['teachers'],
    queryFn: async () => {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/teachers`,
      )
      return response.data
    },
  })

  const { data: classes } = useQuery({
    queryKey: ['classes'],
    queryFn: async () => {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/classes`,
      )
      return response.data
    },
  })

  const deleteAcademyMutation = useMutation({
    mutationFn: async (academyId: number) => {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/academies/${academyId}`,
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academies'] })
      toast.success('학원이 삭제되었습니다')
    },
    onError: () => {
      toast.error('학원 삭제에 실패했습니다')
    },
  })

  const deleteTeacherMutation = useMutation({
    mutationFn: async (teacherId: number) => {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/teachers/${teacherId}`,
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] })
      toast.success('선생님이 삭제되었습니다')
    },
    onError: () => {
      toast.error('선생님 삭제에 실패했습니다')
    },
  })

  const deleteClassMutation = useMutation({
    mutationFn: async (classId: number) => {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/classes/${classId}`,
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] })
      toast.success('수업이 삭제되었습니다')
    },
    onError: () => {
      toast.error('수업 삭제에 실패했습니다')
    },
  })

  const handleAddTeacher = async (teacherData: any) => {
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/admin/teachers`, teacherData)
      queryClient.invalidateQueries({ queryKey: ['teachers'] })
      toast.success('선생님이 추가되었습니다')
      setShowAddTeacherModal(false)
    } catch (error) {
      toast.error('선생님 추가에 실패했습니다')
    }
  }

  const handleAddClass = async (classData: any) => {
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/admin/classes`, classData)
      queryClient.invalidateQueries({ queryKey: ['classes'] })
      toast.success('수업이 추가되었습니다')
      setShowAddClassModal(false)
    } catch (error) {
      toast.error('수업 추가에 실패했습니다')
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
    <div className="flex flex-col h-screen bg-gray-50 relative">
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">관리자 대시보드</h1>
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
            {/* 학원 관리 */}
            <div className="bg-white rounded-lg shadow-md border border-stone-100">
              <div className="px-4 py-3 bg-stone-700">
                <h2 className="text-lg font-semibold text-white">학원 관리</h2>
              </div>
              <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-gray-600">
                    총 {academies?.length || 0}개 학원
                  </span>
                  <button
                    onClick={() => setShowAddTeacherModal(true)}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    추가
                  </button>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {academies?.map((academy: any) => (
                    <div
                      key={academy.id}
                      className="flex justify-between items-center p-2 bg-gray-50 rounded"
                    >
                      <span className="text-sm">{academy.name}</span>
                      <button
                        onClick={() => deleteAcademyMutation.mutate(academy.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 선생님 관리 */}
            <div className="bg-white rounded-lg shadow-md border border-stone-100">
              <div className="px-4 py-3 bg-stone-700">
                <h2 className="text-lg font-semibold text-white">선생님 관리</h2>
              </div>
              <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-gray-600">
                    총 {teachers?.length || 0}명 선생님
                  </span>
                  <button
                    onClick={() => setShowAddTeacherModal(true)}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    추가
                  </button>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {teachers?.map((teacher: any) => (
                    <div
                      key={teacher.id}
                      className="flex justify-between items-center p-2 bg-gray-50 rounded"
                    >
                      <span className="text-sm">{teacher.name}</span>
                      <button
                        onClick={() => deleteTeacherMutation.mutate(teacher.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 수업 관리 */}
            <div className="bg-white rounded-lg shadow-md border border-stone-100">
              <div className="px-4 py-3 bg-stone-700">
                <h2 className="text-lg font-semibold text-white">수업 관리</h2>
              </div>
              <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-gray-600">
                    총 {classes?.length || 0}개 수업
                  </span>
                  <button
                    onClick={() => setShowAddClassModal(true)}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    추가
                  </button>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {classes?.map((class_: any) => (
                    <div
                      key={class_.id}
                      className="flex justify-between items-center p-2 bg-gray-50 rounded"
                    >
                      <span className="text-sm">{class_.name}</span>
                      <button
                        onClick={() => deleteClassMutation.mutate(class_.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
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
        <LogoutModal
          onLogout={handleSignOut}
          onClose={() => setShowLogoutModal(false)}
        />
      )}

      {showAddTeacherModal && (
        <AddTeacherModal
          isOpen={showAddTeacherModal}
          onClose={() => setShowAddTeacherModal(false)}
          onSubmit={handleAddTeacher}
        />
      )}

      {showAddClassModal && (
        <AddClassModal
          isOpen={showAddClassModal}
          onClose={() => setShowAddClassModal(false)}
          onSubmit={handleAddClass}
          teachers={teachers || []}
        />
      )}
    </div>
  )
}
