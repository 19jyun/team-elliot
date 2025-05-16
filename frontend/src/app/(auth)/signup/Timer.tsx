import * as React from 'react'
import { TimerProps } from './types'

export const Timer: React.FC<TimerProps> = ({ time }) => (
  <div className="flex gap-2 items-center self-stretch my-auto text-base font-semibold tracking-normal text-stone-700">
    <img
      loading="lazy"
      src="https://cdn.builder.io/api/v1/image/assets/TEMP/8d0cf17039407440d986c2f1f2b7257ee78a317f43557638aa70bde602a3c694?placeholderIfAbsent=true&apiKey=1a4d049d8fe54d8aa58f4ebfa539d65f"
      alt=""
      className="object-contain shrink-0 self-stretch my-auto w-6 aspect-square"
    />
    <div className="self-stretch my-auto">{time}</div>
  </div>
)
