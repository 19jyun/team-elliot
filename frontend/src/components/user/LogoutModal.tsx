import * as React from 'react'
import { CloseIcon } from '@/components/icons'
import { useEffect } from 'react'
import { IconButton } from '@/components/ui/IconButton'
import { LogoutModalProps } from '@/app/(dashboard)/types'
import { useApp } from '@/contexts/AppContext'

export function LogoutModal({ onLogout, onClose }: LogoutModalProps) {
  const { ui } = useApp();
  const { pushFocus, popFocus } = ui;

  useEffect(() => {
    pushFocus('modal'); // 모달이 열릴 때 포커스를 modal로 변경
    
    return () => {
      popFocus(); // 컴포넌트가 언마운트될 때 이전 포커스로 복원
    };
  }, [pushFocus, popFocus]);

  const handleClose = () => {
    popFocus(); // 모달이 닫힐 때 이전 포커스로 복원
    onClose();
  };

  const handleLogout = () => {
    popFocus(); // 로그아웃 시 이전 포커스로 복원
    onLogout();
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-stone-900 bg-opacity-30">
      <div className="flex overflow-hidden flex-col pt-2.5 mb-0 w-full max-w-md mx-4 bg-white rounded-3xl">
        <div className="flex gap-10 justify-between items-center mx-2.5 w-full">
          <IconButton onClick={handleClose}>
            <CloseIcon className="object-contain self-stretch my-auto w-6 aspect-square" />
          </IconButton>
        </div>
        <div className="mx-5 text-lg font-semibold leading-tight text-center text-neutral-800">
          정말 로그아웃 하시겠어요?
        </div>
        <div className="flex gap-3 justify-center items-start px-5 pt-2.5 pb-4 mt-7">
          <button
            onClick={handleClose}
            className="flex-1 px-3 py-3.5 text-base font-semibold text-stone-700 rounded-lg border border-stone-300"
          >
            취소
          </button>
          <button
            onClick={handleLogout}
            className="flex-1 px-3 py-3.5 text-base font-semibold text-white rounded-lg bg-stone-700"
          >
            로그아웃
          </button>
        </div>
      </div>
    </div>
  )
}
