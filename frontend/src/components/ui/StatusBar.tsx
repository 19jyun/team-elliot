import * as React from 'react'
import { StatusBarIcon } from './types'

interface StatusBarProps {
  time: string
  icons: StatusBarIcon[]
  logoSrc: string
}

export function StatusBar({ time, icons, logoSrc }: StatusBarProps) {
  return (
    <div className="flex justify-center items-center w-full bg-white min-h-[60px] max-sm:hidden">
      <div className="flex overflow-hidden flex-1 shrink gap-1 justify-center items-center self-stretch px-9 py-6 my-auto text-lg tracking-tight leading-none text-center text-black whitespace-nowrap basis-0 font-[590] min-h-[60px]">
        <div className="self-stretch my-auto w-[35px]">{time}</div>
        {icons.map((icon, index) => (
          <img
            key={index}
            loading="lazy"
            src={icon.src}
            alt={icon.alt}
            className={`object-contain shrink-0 self-stretch my-auto w-${icon.width} aspect-${icon.aspectRatio}`}
          />
        ))}
      </div>
      <img
        loading="lazy"
        src={logoSrc}
        alt="Logo"
        className="object-contain shrink-0 self-stretch my-auto aspect-[3.39] fill-black w-[122px]"
      />
      <div className="flex overflow-hidden flex-1 shrink gap-2.5 justify-center items-center self-stretch py-6 pr-6 pl-5 my-auto basis-[31px] min-h-[60px] max-sm:hidden">
        {icons.map((icon, index) => (
          <img
            key={`status-${index}`}
            loading="lazy"
            src={icon.src}
            alt={icon.alt}
            className={`object-contain shrink-0 self-stretch my-auto aspect-${icon.aspectRatio} w-${icon.width}`}
          />
        ))}
      </div>
    </div>
  )
}
