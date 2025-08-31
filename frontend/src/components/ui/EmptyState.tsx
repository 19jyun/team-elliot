import * as React from 'react'
import { EmptyStateProps } from '@/app/(dashboard)/types'
import Image from 'next/image'

export const EmptyState: React.FC<EmptyStateProps> = ({
  imageUrl,
  message,
}) => {
  return (
    <div className="flex flex-col pb-1 mt-3 w-full text-base font-medium tracking-normal min-h-[100px] text-neutral-400">
      <Image
        loading="lazy"
        src={imageUrl}
        alt=""
        width={100}
        height={64}
        className="object-contain self-center max-w-full rounded-none aspect-[1.56] w-[100px]"
      />
      <div className="flex flex-col mt-2.5 w-full">
        <div className="flex gap-2 justify-center items-center px-4 w-full">
          <div className="self-stretch my-auto opacity-80">{message}</div>
        </div>
      </div>
    </div>
  )
}
