import * as React from 'react'
import { CancellationOption as CancellationOptionType } from './types'

interface CancellationOptionProps {
  option: CancellationOptionType
}

export const CancellationOption: React.FC<CancellationOptionProps> = ({
  option,
}) => {
  return (
    <div
      className={`flex gap-10 justify-between items-center py-4 pr-4 pl-5 w-full rounded-lg ${
        option.selected
          ? 'bg-stone-200 border border-solid border-stone-700 text-stone-700'
          : 'bg-neutral-50'
      }`}
      role="button"
      tabIndex={0}
    >
      <div className="self-stretch my-auto">{option.text}</div>
      <img
        loading="lazy"
        src={`http://b.io/ext_${9 + option.id}-`}
        alt=""
        className="object-contain shrink-0 self-stretch my-auto w-6 aspect-square"
      />
    </div>
  )
}
