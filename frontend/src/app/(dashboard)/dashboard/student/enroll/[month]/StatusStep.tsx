import * as React from 'react'
import { StatusStepProps } from './types'

export const StatusStep: React.FC<StatusStepProps> = ({
  icon,
  label,
  isActive = false,
  isCompleted = false,
}) => {
  // 아이콘 경로 분기
  let iconSrc = icon;
  if (label === '결제하기' && isCompleted) {
    iconSrc = '/icons/CourseRegistrationsStatusSteps3.svg'; // 결제하기 완료(체크+갈색)
  } else if (isCompleted) {
    iconSrc = '/icons/CourseRegistrationsStatusSteps1.svg'; // 완료(갈색 체크)
  } else if (isActive) {
    iconSrc = '/icons/CourseRegistrationsStatusSteps2-active.svg'; // 진행중(갈색 테두리)
  } else {
    iconSrc = '/icons/CourseRegistrationsStatusSteps2.svg'; // 비활성(회색 테두리)
  }
  return (
    <div className="flex flex-col flex-1 items-center">
      <img
        loading="lazy"
        src={iconSrc}
        alt={`${label} 단계 아이콘`}
        className="object-contain w-8 aspect-square"
      />
      <div
        className={`mt-1.5 ${isCompleted || isActive ? 'text-stone-700' : 'text-stone-300'}`}
      >
        {label}
      </div>
    </div>
  )
}
