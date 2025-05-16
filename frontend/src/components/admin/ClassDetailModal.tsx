'use client'

import * as React from 'react'
import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import type { Class } from '@/types'

interface ClassDetailModalProps {
  class_: Class
  onClose: () => void
}

export function ClassDetailModal({ class_, onClose }: ClassDetailModalProps) {
  return (
    <Transition appear show={true} as={Fragment}>
      <Dialog onClose={onClose} className="relative z-50">
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
              <Dialog.Title
                as="h3"
                className="text-lg font-medium leading-6 text-gray-900"
              >
                수업 상세 정보
              </Dialog.Title>

              <div className="mt-4 space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">수업명</h4>
                  <p className="mt-1 text-sm text-gray-900">{class_.name}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500">
                    담당 선생님
                  </h4>
                  <p className="mt-1 text-sm text-gray-900">
                    {class_.teacherName}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500">
                    수업 시간
                  </h4>
                  <p className="mt-1 text-sm text-gray-900">
                    {class_.schedule}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500">
                    수업 레벨
                  </h4>
                  <p className="mt-1 text-sm text-gray-900">{class_.level}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500">
                    수강 인원
                  </h4>
                  <p className="mt-1 text-sm text-gray-900">
                    {class_.currentStudents}/{class_.maxStudents}명
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={onClose}
                  className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  닫기
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
