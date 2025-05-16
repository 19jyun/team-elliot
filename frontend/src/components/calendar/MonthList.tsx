import * as React from 'react'

interface MonthListProps {
  year: number
}

export function MonthList({ year }: MonthListProps) {
  const months = [
    '1월',
    '2월',
    '3월',
    '4월',
    '5월',
    '6월',
    '7월',
    '8월',
    '9월',
    '10월',
    '11월',
    '12월',
  ]

  return (
    <div className="flex gap-4 justify-center items-center px-10 mt-0 w-full text-xl font-medium leading-tight whitespace-nowrap text-stone-900">
      <div className="flex overflow-hidden flex-col justify-center items-start self-stretch py-12 my-auto w-20 text-right">
        <div className="self-stretch min-h-[36px]">{year}년</div>
      </div>
      <div className="flex overflow-hidden flex-col self-stretch px-4 my-auto w-20">
        {months.map((month, index) => (
          <div
            key={index}
            className={`self-stretch px-1 ${
              index === months.length - 1
                ? 'h-9 text-lg leading-loose'
                : 'py-1.5 min-h-[36px]'
            }`}
          >
            {month}
          </div>
        ))}
      </div>
    </div>
  )
}
