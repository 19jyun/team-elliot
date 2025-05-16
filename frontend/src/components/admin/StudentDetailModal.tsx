'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import axiosInstance from '@/lib/axios'

interface StudentDetailModalProps {
  student: {
    id: number
    userId: string
    name: string
    phoneNumber?: string
    emergencyContact?: string
    birthDate?: string
    notes?: string
    level?: string
  }
  onClose: () => void
}

export function StudentDetailModal({
  student,
  onClose,
}: StudentDetailModalProps) {
  const queryClient = useQueryClient()

  const resetPasswordMutation = useMutation({
    mutationFn: async (studentId: number) => {
      try {
        const response = await axiosInstance.post(
          `/admin/students/${studentId}/reset-password`,
          {
            newPassword: 'elliot012!',
          },
        )
        return response.data
      } catch (error) {
        console.error('Password reset error:', error)
        throw error
      }
    },
    onSuccess: () => {
      toast.success('비밀번호가 초기화되었습니다.')
      queryClient.invalidateQueries({ queryKey: ['students'] })
    },
    onError: (error) => {
      console.error('Password reset error:', error)
      toast.error('비밀번호 초기화에 실패했습니다.')
    },
  })

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">수강생 정보</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-500">아이디</p>
            <p className="font-medium">{student.userId}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">이름</p>
            <p className="font-medium">{student.name}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">연락처</p>
            <p className="font-medium">{student.phoneNumber || '-'}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">비상연락처</p>
            <p className="font-medium">{student.emergencyContact || '-'}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">생년월일</p>
            <p className="font-medium">
              {student.birthDate
                ? new Date(student.birthDate).toLocaleDateString()
                : '-'}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">레벨</p>
            <p className="font-medium">{student.level || '-'}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">특이사항</p>
            <p className="font-medium">{student.notes || '-'}</p>
          </div>

          <div className="pt-4 border-t">
            <button
              onClick={() => resetPasswordMutation.mutate(student.id)}
              className="w-full px-4 py-2 bg-stone-100 text-stone-700 rounded-lg hover:bg-stone-200"
            >
              비밀번호 초기화
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
