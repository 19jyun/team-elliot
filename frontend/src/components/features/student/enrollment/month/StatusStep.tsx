import * as React from 'react'
import { StatusStepIcon } from '@/components/icons'

interface StatusStepProps {
  icon: string
  label: string
  isActive?: boolean
  isCompleted?: boolean
}

export const StatusStep: React.FC<StatusStepProps> = ({
  icon: _icon, // 사용하지 않는 매개변수는 언더스코어로 표시
  label,
  isActive = false,
  isCompleted = false,
}) => {
  // 아이콘 상태 결정
  let iconState: 'completed' | 'active' | 'inactive' | 'payment-completed' = 'inactive';
  
  if (label === '결제하기' && isCompleted) {
    iconState = 'payment-completed';
  } else if (isCompleted) {
    iconState = 'completed';
  } else if (isActive) {
    iconState = 'active';
  }

  return (
    <div className="flex flex-col flex-1 items-center">
      <StatusStepIcon
        state={iconState}
        className="object-contain w-8 aspect-square"
        width={32}
        height={32}
      />
      <div
        className={`mt-1.5 ${isCompleted || isActive ? 'text-stone-700' : 'text-stone-300'}`}
      >
        {label}
      </div>
    </div>
  )
}
