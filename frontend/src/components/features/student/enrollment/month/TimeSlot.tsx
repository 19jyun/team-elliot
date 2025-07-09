import * as React from 'react'
import { TimeSlotProps } from './types'

export const TimeSlot: React.FC<TimeSlotProps> = ({ hour }) => {
  return (
    <div className="flex justify-between items-center w-full border-b border-solid border-b-zinc-100">
      <div className="sticky left-0 z-20 bg-white self-stretch pt-1 pb-12 my-auto min-h-[70px] w-[25px] flex items-start justify-center">
        {hour}
      </div>
    </div>
  )
}
