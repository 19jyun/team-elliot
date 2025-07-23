'use client'

import * as React from 'react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ChevronLeftIcon } from '@heroicons/react/24/outline'
import { TrashIcon } from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'
import axiosInstance from '@/lib/axios'
import { AdminNavigation } from '@/components/navigation/AdminNavigation'
import { AddClassModal } from '@/components/admin/AddClassModal'

import { ClassDetailModal } from '@/components/admin/ClassDetailModal'
import type { Class } from '@/types'

export default function ClassesManagementPage() {
  const router = useRouter()
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/auth')
    },
  })

  const [showAddClass, setShowAddClass] = useState(false)
  const [selectedClass, setSelectedClass] = useState<Class | null>(null)
  const queryClient = useQueryClient()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(
    null,
  )

  const { data: classesData, isLoading } = useQuery({
    queryKey: ['classes'],
    queryFn: async () => {
      try {
        const response = await axiosInstance.get('/admin/classes')
        return response.data
      } catch (error) {
        console.error('Error fetching classes:', error)
        throw error
      }
    },
    staleTime: 1000 * 60 * 5, // 5분
    cacheTime: 1000 * 60 * 30, // 30분
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  })

  const { data: teachersData } = useQuery({
    queryKey: ['teachers'],
    queryFn: async () => {
      try {
        const response = await axiosInstance.get('/admin/teachers')
        return response.data
      } catch (error) {
        console.error('Error fetching teachers:', error)
        throw error
      }
    },
  })

  const deleteClassMutation = useMutation({
    mutationFn: (id: number) => axiosInstance.delete(`/admin/classes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] })
      toast.success('수업이 삭제되었습니다.')
    },
  })

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-700" />
      </div>
    )
  }

  return (
    <div className="flex flex-col pb-2 mx-auto w-full bg-white max-w-[480px]">
      <header className="sticky top-0 z-40 flex flex-col bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-4 h-14">
          <button
            onClick={() => router.push('/dashboard/admin')}
            className="p-2 text-gray-600 hover:text-gray-900"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <h1 className="absolute left-1/2 transform -translate-x-1/2 text-lg font-semibold text-gray-900">
            수업 관리
          </h1>
          <div className="w-10" />
        </div>
      </header>

      <AdminNavigation />

      <div className="px-5 py-6">
        <div className="mt-4">
          <button
            onClick={() => setShowAddClass(true)}
            className="px-4 py-2 bg-stone-700 text-white rounded-lg"
          >
            + 수업 추가
          </button>
        </div>

        <div className="mt-6 space-y-4">
          {classesData?.map((class_) => (
            <div
              key={class_.id}
              className="flex justify-between items-start p-4 bg-stone-50 rounded-lg cursor-pointer hover:bg-stone-100"
              onClick={() => setSelectedClass(class_)}
            >
              <div>
                <p className="font-semibold text-stone-900">{class_.name}</p>
                <p className="text-sm text-stone-600">
                  {class_.teacherName} 선생님
                </p>
                <p className="text-sm text-stone-500">
                  {class_.schedule} | {class_.level}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowDeleteConfirm(class_.id)
                }}
                className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <AddClassModal
        isOpen={showAddClass}
        onClose={() => setShowAddClass(false)}
        onSubmit={(data) => {
          addClassMutation.mutate(data)
          setShowAddClass(false)
        }}
        teachers={teachersData || []}
      />

      {selectedClass && (
        <ClassDetailModal
          class_={selectedClass}
          onClose={() => setSelectedClass(null)}
        />
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">수업 삭제</h3>
            <p className="text-gray-600 mb-6">
              정말로 이 수업을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
              >
                취소
              </button>
              <button
                onClick={() => {
                  deleteClassMutation.mutate(showDeleteConfirm)
                  setShowDeleteConfirm(null)
                }}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
