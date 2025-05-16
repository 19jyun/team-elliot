import * as React from 'react'
import { MonthList } from './MonthList'
import { ActionButtons } from '@/components/ui/ActionButtons'

interface MonthSelectorProps {
  year: number
}

export function MonthSelector({ year }: MonthSelectorProps) {
  return (
    <div className="flex overflow-hidden flex-col mx-auto w-full bg-white max-w-[480px]">
      <div className="flex flex-col w-full bg-stone-900 bg-opacity-30 pt-[509px]">
        <div className="flex overflow-hidden flex-col w-full rounded-3xl">
          <div className="flex items-center px-2 w-full bg-white h-[27px]">
            <div className="flex gap-2.5 self-stretch py-2.5 my-auto min-h-[36px]" />
          </div>
          <div className="flex overflow-hidden flex-col py-3 w-full bg-white">
            <div className="flex overflow-hidden z-10 flex-col pr-2 pl-2.5 w-full min-h-[141px]">
              <div className="flex flex-1 w-full bg-white bg-opacity-70 min-h-[51px]" />
              <div className="flex w-full rounded-lg mix-blend-multiply bg-neutral-100 min-h-[40px]" />
              <div className="flex flex-1 w-full bg-white bg-opacity-70 min-h-[50px]" />
            </div>
            <MonthList year={year} />
          </div>
          <ActionButtons />
        </div>
      </div>
    </div>
  )
}
