'use client'

import { Dialog } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import type { Teacher } from '@/types'

interface TeacherDetailModalProps {
  teacher: Teacher
  onClose: () => void
}

export function TeacherDetailModal({
  teacher,
  onClose,
}: TeacherDetailModalProps) {
  return (
    <Dialog
      open={true}
      onClose={onClose}
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      <div className="flex items-center justify-center min-h-screen">
        <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50" />

        <div className="relative bg-white rounded-lg max-w-md w-full mx-4 p-6">
          <div className="flex justify-between items-start mb-4">
            <Dialog.Title className="text-lg font-semibold text-gray-900">
              선생님 정보
            </Dialog.Title>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-gray-100"
            >
              <XMarkIcon className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">이름</h3>
              <p className="mt-1 text-gray-900">{teacher.name}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">이메일</h3>
              <p className="mt-1 text-gray-900">{teacher.email}</p>
            </div>

            {teacher.phoneNumber && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">전화번호</h3>
                <p className="mt-1 text-gray-900">{teacher.phoneNumber}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Dialog>
  )
}
