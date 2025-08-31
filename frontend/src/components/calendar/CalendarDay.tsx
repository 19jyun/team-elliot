import * as React from 'react'
import Image from 'next/image'

interface CalendarDayProps {
  day: number
  isCurrentMonth: boolean
  hasEvent?: boolean
}

export const CalendarDay: React.FC<CalendarDayProps> = ({
  day,
  isCurrentMonth,
  hasEvent,
}) => {
  return (
    <div className="flex flex-col self-stretch px-0.5 my-auto min-h-[54px] w-[50px]">
      <div
        className={`self-center pb-px w-10 min-h-[40px] rounded-[50px] ${
          !isCurrentMonth ? 'text-stone-300' : ''
        }`}
      >
        {day}
        {hasEvent && (
          <Image
            loading="lazy"
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/962705efb70d3b9495f532d476405033dd792b1a5137022d7c11263c1db9e505?placeholderIfAbsent=true&apiKey=1a4d049d8fe54d8aa58f4ebfa539d65f"
            alt=""
            width={14}
            height={1}
            className="object-contain self-center w-3.5 aspect-[14.08] fill-[linear-gradient(0deg,rgba(0,0,0,0.20_0%,rgba(0,0,0,0.20)_100%),#573B30)] stroke-[1px] stroke-stone-700"
          />
        )}
      </div>
      <div className="flex gap-2.5 w-full rounded min-h-[18px]" />
    </div>
  )
}
