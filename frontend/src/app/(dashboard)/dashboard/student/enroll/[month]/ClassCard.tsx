import * as React from 'react'
import { ClassCardProps } from './types'

export const ClassCard: React.FC<ClassCardProps> = ({
  level,
  teacher,
  startTime,
  endTime,
  dayIndex,
  startHour,
  bgColor,
  containerWidth,
  onInfoClick,
}) => {
  const dayWidth = `calc((${containerWidth} - 25px) / 7)`

  const leftPosition = `calc(25px + (${dayIndex} * ${dayWidth}))`

  const topPosition = `${(startHour - 4) * 105}px`

  return (
    <div
      className={`absolute flex flex-col justify-between p-1 min-h-[105px] bg-${bgColor}`}
      style={{
        left: leftPosition,
        top: topPosition,
        width: dayWidth,
        zIndex: 10,
      }}
    >
      <div className="flex flex-col w-full">
        <div className="flex flex-col leading-snug">
          <div className="text-sm font-semibold tracking-normal text-neutral-800">
            {level}
          </div>
          <div className="text-xs font-medium tracking-normal text-zinc-600">
            {teacher}
          </div>
        </div>
        <div className="text-xs leading-4 text-neutral-400">
          {startTime}부터
          <br />
          {endTime}까지
        </div>
      </div>
      <button
        className="gap-2.5 self-stretch px-1.5 py-1 mt-1.5 w-full text-xs font-medium tracking-normal leading-snug whitespace-nowrap bg-white rounded border border-solid border-zinc-300 text-zinc-600"
        aria-label={`${level} 정보보기`}
        onClick={onInfoClick}
      >
        정보보기
      </button>
    </div>
  )
}
