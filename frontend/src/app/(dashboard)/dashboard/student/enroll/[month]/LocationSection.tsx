import * as React from 'react'
import { LocationInfo } from './types'

interface LocationSectionProps {
  location: LocationInfo
}

export function LocationSection({ location }: LocationSectionProps) {
  return (
    <div className="flex flex-col mt-7 w-full leading-snug">
      <div className="text-base font-semibold tracking-normal text-neutral-800">
        오시는 길
      </div>
      <div className="mt-2 text-base tracking-normal text-neutral-800">
        {location.name}
      </div>
      <div className="flex gap-1.5 items-center self-start mt-2">
        <div className="self-stretch my-auto w-5 h-5 text-sm font-semibold tracking-normal text-center text-white whitespace-nowrap bg-sky-500 min-h-[20px] rounded-[30px]">
          {location.line}
        </div>
        <div className="self-stretch my-auto text-base tracking-normal text-red-500">
          {location.station}{' '}
          <span className="text-red-500">{location.distance}</span>
        </div>
      </div>
      <img
        loading="lazy"
        src={location.mapImageUrl}
        alt="Location map"
        className="object-contain mt-2 rounded aspect-[3.38] w-[335px]"
      />
    </div>
  )
}
