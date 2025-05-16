import * as React from 'react'
import { ProgressBarItemProps } from './types'

export const ProgressBarItem: React.FC<ProgressBarItemProps> = ({
  isActive,
}) => (
  <div
    className={`flex flex-1 shrink self-stretch my-auto h-1.5 rounded-xl basis-0 ${
      isActive ? 'bg-stone-400' : 'bg-zinc-100'
    }`}
  />
)
