import * as React from 'react'
import { StatusBadge } from './StatusBadge'
import { EnrollmentCardProps } from './types'

export const EnrollmentCard: React.FC<EnrollmentCardProps> = ({
  title,
  isNew,
  onClick,
}) => (
  <div
    className="flex gap-10 justify-between items-center py-4 pr-4 pl-5 w-full text-base tracking-normal rounded-lg bg-stone-200 text-stone-700 cursor-pointer hover:bg-stone-400 transition-colors duration-200"
    onClick={(e) => {
      console.log('EnrollmentCard 클릭됨:', title); // 디버깅용
      e.preventDefault(); // 기본 동작 방지
      e.stopPropagation(); // 이벤트 버블링 방지
      onClick?.();
    }}
    onTouchStart={(e) => {
      e.stopPropagation(); // 터치 이벤트도 버블링 방지
    }}
    onTouchMove={(e) => {
      e.stopPropagation(); // 터치 이동 이벤트도 버블링 방지
    }}
    onTouchEnd={(e) => {
      e.stopPropagation(); // 터치 종료 이벤트도 버블링 방지
    }}
    role="button"
    tabIndex={0}
  >
    <div className="flex gap-1.5 items-center self-stretch my-auto">
      {isNew && <StatusBadge text="NEW" />}
      <div className="self-stretch my-auto text-base tracking-normal text-stone-700">
        {title}
      </div>
    </div>
    <img
      loading="lazy"
      src="https://cdn.builder.io/api/v1/image/assets/TEMP/1f7fc23429841d7be71eef4a524441a0723472cbcc37e1d51e9a8dccc0d60f49?placeholderIfAbsent=true&apiKey=1a4d049d8fe54d8aa58f4ebfa539d65f"
      alt="Arrow indicator"
      className="object-contain shrink-0 self-stretch my-auto w-4 aspect-square"
    />
  </div>
)
