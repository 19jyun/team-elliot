import * as React from 'react'
import { StatusBadge } from './StatusBadge'
import { EnrollmentCardProps } from './types'

export const EnrollmentCard: React.FC<EnrollmentCardProps> = ({
  title,
  isNew,
  onClick,
}) => (
  <div
    className="flex gap-10 justify-between items-center py-4 pr-4 pl-5 w-full text-base tracking-normal rounded-lg bg-stone-200 text-stone-700 cursor-pointer hover:bg-stone-300 transition-colors"
    onClick={onClick}
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
