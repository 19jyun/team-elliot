import * as React from 'react'

export interface ClassCardProps {
  level: string
  className: string
  teacher: string
  startTime: string
  endTime: string
  dayIndex: number
  startHour: number
  bgColor: string
  containerWidth: string
  style?: React.CSSProperties
}

export interface ExtendedClassCardProps extends ClassCardProps {
  selected?: boolean
  onClick?: () => void
  onInfoClick?: () => void
}

const levelBgColor = {
  BEGINNER: '#F4E7E7',
  INTERMEDIATE: '#FBF4D8',
  ADVANCED: '#CBDFE3',
}

export const ClassCard: React.FC<ExtendedClassCardProps> = ({
  level,
  className,
  teacher,
  startTime,
  endTime,
  selected = false,
  onClick,
  onInfoClick,
  style,
}) => {
  const baseBg = levelBgColor[level as keyof typeof levelBgColor] || '#F4E7E7'
  const cardBg = selected ? '#573B30' : baseBg
  const textColor = selected ? 'text-white' : 'text-neutral-800'
  const subTextColor = selected ? 'text-white' : 'text-zinc-600'
  const infoBtnText = selected ? 'text-[#573B30]' : 'text-zinc-600'

  // const dayWidth = `calc((${containerWidth} - 25px) / 7)`
  // const leftPosition = `calc(25px + (${dayIndex} * ${dayWidth}))`
  // const topPosition = `${(startHour - 4) * 105}px`

  return (
    <div
      className={`flex flex-col justify-between p-1 relative cursor-pointer transition w-full ${textColor}`}
      style={{ 
        background: cardBg,
        minHeight: '110px',
        overflow: 'hidden', // 넘치는 부분 숨김
        ...style
      }}
      onClick={onClick}
    >
      {/* Checkmark for selected */}
      {selected && (
        <div className="absolute top-1 right-1 z-10">
          <span className="inline-flex items-center justify-center w-5 h-5 bg-white rounded-full border border-white">
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
              <path d="M5 10.5L9 14.5L15 7.5" stroke="#573B30" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </div>
      )}
      <div className="flex flex-col w-full">
        <div className="flex flex-col leading-snug">
          <div className="text-sm font-semibold tracking-normal">
            {className}
          </div>
          <div className={`text-xs font-medium tracking-normal ${subTextColor}`}>
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
        className={`gap-2.5 self-stretch px-1.5 py-1 mt-1.5 w-full text-xs font-medium tracking-normal leading-snug whitespace-nowrap bg-white rounded border border-solid border-zinc-300 ${infoBtnText}`}
        aria-label={`${level} 정보보기`}
        onClick={e => {
          e.stopPropagation();
          if (onInfoClick) {
            onInfoClick();
          }
        }}
      >
        정보보기
      </button>
    </div>
  )
}
