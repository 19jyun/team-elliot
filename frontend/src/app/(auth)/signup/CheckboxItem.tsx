import * as React from 'react'
import { CheckboxItemProps } from './types'

export const CheckboxItem: React.FC<CheckboxItemProps> = ({
  icon,
  text,
  showViewButton = false,
  required = false,
}) => (
  <div className="flex gap-10 justify-between items-center mt-2.5 w-full">
    <div className="flex gap-1.5 items-center self-stretch px-1 my-auto font-medium text-stone-700">
      <img
        loading="lazy"
        src={icon}
        alt=""
        className="object-contain shrink-0 self-stretch my-auto w-6 aspect-square"
      />
      <div className="self-stretch my-auto">
        {required && '(필수) '}
        {text}
      </div>
    </div>
    {showViewButton && (
      <div className="self-stretch my-auto leading-snug text-neutral-400">
        보기
      </div>
    )}
  </div>
)
