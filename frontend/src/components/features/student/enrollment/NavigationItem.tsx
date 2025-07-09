import * as React from 'react'
import { NavigationItemProps } from './types'

export const NavigationItem: React.FC<NavigationItemProps> = ({
  label,
  isActive,
}) => (
  <div
    className={`flex-1 shrink gap-2.5 self-stretch py-2.5 my-auto ${
      isActive
        ? 'whitespace-nowrap border-b-2 border-solid border-b-stone-700 text-stone-700'
        : 'text-stone-300'
    }`}
  >
    {label}
  </div>
)
