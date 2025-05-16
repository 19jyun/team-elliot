import * as React from 'react'
import { StatusStepProps } from './types'

export const StatusStep: React.FC<StatusStepProps> = ({
  icon,
  label,
  isActive = false,
}) => {
  return (
    <div className="flex flex-col flex-1 items-center">
      <img
        loading="lazy"
        src={icon}
        alt={`${label} 단계 아이콘`}
        className="object-contain w-8 aspect-square"
      />
      <div
        className={`mt-1.5 ${isActive ? 'text-stone-700' : 'text-stone-300'}`}
      >
        {label}
      </div>
    </div>
  )
}
