import * as React from 'react'
import { IconButton } from '@/components/ui/IconButton'
import { LogoutModalProps } from '@/app/(dashboard)/types'

export function LogoutModal({ onLogout, onClose }: LogoutModalProps) {
  return (
    <div className="flex overflow-hidden flex-col mx-auto w-full bg-white max-w-[480px]">
      <div className="flex flex-col justify-center px-5 py-80 w-full bg-stone-900 bg-opacity-30">
        <div className="flex overflow-hidden flex-col pt-2.5 mb-0 w-full bg-white rounded-3xl">
          <div className="flex gap-10 justify-between items-center mx-2.5 w-full">
            <IconButton onClick={onClose}>
              <img
                loading="lazy"
                src="/icons/close.svg"
                className="object-contain self-stretch my-auto w-6 aspect-square"
                alt="Close"
              />
            </IconButton>
          </div>
          <div className="mx-5 text-lg font-semibold leading-tight text-center text-neutral-800">
            정말 로그아웃 하시겠어요?
          </div>
          <div className="flex gap-3 justify-center items-start px-5 pt-2.5 pb-4 mt-7">
            <button
              onClick={onClose}
              className="flex-1 px-3 py-3.5 text-base font-semibold text-stone-700 rounded-lg border border-stone-300"
            >
              취소
            </button>
            <button
              onClick={onLogout}
              className="flex-1 px-3 py-3.5 text-base font-semibold text-white rounded-lg bg-stone-700"
            >
              로그아웃
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
