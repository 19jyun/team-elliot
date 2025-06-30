'use client'

import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createTeacher } from '@/api/admin'
import { toast } from 'sonner'
import { useCheckDuplicateUserId } from '@/hooks/useCheckDuplicateUserId'

interface AddTeacherModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => void
}

export function AddTeacherModal({
  isOpen,
  onClose,
  onSubmit,
}: AddTeacherModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    userId: '',
    password: '',
    phoneNumber: '',
    introduction: '',
  })
  const [idError, setIdError] = useState('')
  const { check: checkDuplicateUserId, loading: checkingId } = useCheckDuplicateUserId()

  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (data: typeof formData) => createTeacher(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] })
      toast.success('선생님이 추가되었습니다.')
      onClose()
      setFormData({
        name: '',
        userId: '',
        password: '',
        phoneNumber: '',
        introduction: '',
      })
    },
    onError: () => {
      toast.error('선생님 추가에 실패했습니다.')
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log(formData)
    setIdError('')
    const isAvailable = await checkDuplicateUserId(formData.userId)
    if (!isAvailable) {
      setIdError('이미 사용중인 아이디입니다. 다른 아이디를 입력해주세요.')
      return
    }
    mutation.mutate(formData)
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog onClose={onClose} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
            <Dialog.Title className="text-lg font-medium leading-6 text-gray-900 mb-4">
              새 선생님 추가
            </Dialog.Title>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  이름
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  아이디
                </label>
                <input
                  type="id"
                  required
                  value={formData.userId}
                  onChange={(e) => {
                    setFormData({ ...formData, userId: e.target.value })
                    setIdError('')
                  }}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
                {idError && (
                  <div className="mt-1 text-sm text-red-500">{idError}</div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  비밀번호
                </label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  전화번호
                </label>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, phoneNumber: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  소개
                </label>
                <textarea
                  value={formData.introduction}
                  onChange={(e) =>
                    setFormData({ ...formData, introduction: e.target.value })
                  }
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div className="mt-4 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={mutation.isPending}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400"
                >
                  {mutation.isPending ? '추가 중...' : '추가'}
                </button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>
    </Transition>
  )
}
