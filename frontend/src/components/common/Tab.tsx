import * as React from 'react'
import { TabProps } from '@/types'

export const Tab: React.FC<TabProps> = ({ label, isActive }) => {
  return (
    <div
      className={`flex-1 shrink gap-2.5 self-stretch py-2.5 my-auto ${
        isActive
          ? 'border-b-2 border-solid border-b-stone-700 text-stone-700'
          : ''
      }`}
    >
      {label}
    </div>
  )
}
