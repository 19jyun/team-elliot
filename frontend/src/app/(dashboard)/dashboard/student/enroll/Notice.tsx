import * as React from 'react'
import { NoticeProps } from './types'

export const Notice: React.FC<NoticeProps> = ({ title, content }) => (
  <div className="flex flex-col justify-center items-center px-5 pt-5 pb-6 mt-4 w-full rounded-lg border border-solid bg-neutral-50 border-zinc-100">
    <div className="text-base font-semibold tracking-normal leading-snug text-neutral-800">
      {title}
    </div>
    <div className="mt-3.5 text-base font-medium tracking-normal leading-6 text-neutral-700">
      {content}
    </div>
  </div>
)
