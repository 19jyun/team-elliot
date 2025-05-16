import * as React from 'react'
import { StatusBadgeProps } from './types'

export const StatusBadge: React.FC<StatusBadgeProps> = ({ text }) => (
  <div className="self-stretch py-0.5 pr-1.5 pl-1.5 my-auto text-sm tracking-normal text-white whitespace-nowrap bg-[linear-gradient(0deg,rgba(0,0,0,0.20_0%,rgba(0,0,0,0.20)_100%),#573B30)] rounded-[30px]">
    {text}
  </div>
)
