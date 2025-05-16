import * as React from 'react'
import { NavigationButtonProps } from './types'

export const NavigationButton: React.FC<NavigationButtonProps> = ({
  text,
  onClick,
}) => (
  <button
    onClick={onClick}
    className="flex gap-2.5 justify-center items-center px-2.5 py-4 w-full text-base font-semibold text-white rounded-lg bg-stone-400"
  >
    <div className="flex gap-0.5 items-center self-stretch my-auto">
      <span className="self-stretch my-auto">{text}</span>
      <img
        loading="lazy"
        src="https://cdn.builder.io/api/v1/image/assets/TEMP/92f5678e022dbdb76f857a0b81e8e0e0150c67a32c5c94431179c44c52a250a0?placeholderIfAbsent=true&apiKey=1a4d049d8fe54d8aa58f4ebfa539d65f"
        alt=""
        className="object-contain shrink-0 self-stretch my-auto w-4 aspect-square"
      />
    </div>
  </button>
)
