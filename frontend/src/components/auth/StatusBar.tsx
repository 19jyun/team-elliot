import * as React from 'react'
import { StatusBarIconProps } from './types'

const StatusBarIcon: React.FC<StatusBarIconProps> = ({ src, alt }) => (
  <img
    loading="lazy"
    src={src}
    alt={alt}
    className="object-contain shrink-0 self-stretch my-auto aspect-[1.29] w-[18px]"
  />
)

export const StatusBar: React.FC = () => {
  return (
    <div className="flex justify-center items-center w-full bg-white min-h-[60px] max-sm:hidden">
      <div className="flex overflow-hidden flex-1 shrink gap-1 justify-center items-center self-stretch px-9 py-6 my-auto text-lg tracking-tight leading-none text-center text-black whitespace-nowrap basis-0 font-[590] min-h-[60px] max-sm:hidden">
        <div className="self-stretch my-auto w-[35px]">9:41</div>
        <img
          loading="lazy"
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/4e8736a26a142e1ec8b201682842001784745b236983c002f8b27d3bc6251b4f?placeholderIfAbsent=true&apiKey=1a4d049d8fe54d8aa58f4ebfa539d65f"
          alt=""
          className="object-contain shrink-0 self-stretch my-auto w-3.5 aspect-square max-sm:hidden"
        />
      </div>
      <img
        loading="lazy"
        src="https://cdn.builder.io/api/v1/image/assets/TEMP/34dd0bf8a20c0d55042c3044ff28a0a730de8c635dd0d4ff5adeec4a4649ca29?placeholderIfAbsent=true&apiKey=1a4d049d8fe54d8aa58f4ebfa539d65f"
        alt="Logo"
        className="object-contain shrink-0 self-stretch my-auto aspect-[3.39] fill-black w-[122px] max-sm:hidden"
      />
      <div className="flex overflow-hidden flex-1 shrink gap-2.5 justify-center items-center self-stretch py-6 pr-6 pl-5 my-auto basis-[31px] min-h-[60px] max-sm:hidden">
        {[
          {
            src:
              'https://cdn.builder.io/api/v1/image/assets/TEMP/b20cf3d1a1089c2ce3efe80fde511dfa79ef6f908eb5c2afa869720c4b684cd6?placeholderIfAbsent=true&apiKey=1a4d049d8fe54d8aa58f4ebfa539d65f',
            alt: 'Signal',
          },
          {
            src:
              'https://cdn.builder.io/api/v1/image/assets/TEMP/2fcf6e95083639433859129a4cedc3995440122436baed7bde49a1e55a25c2b4?placeholderIfAbsent=true&apiKey=1a4d049d8fe54d8aa58f4ebfa539d65f',
            alt: 'WiFi',
          },
          {
            src:
              'https://cdn.builder.io/api/v1/image/assets/TEMP/ad8416e32d558b3e2e98e7b3505a32dddc696afea388798cbb7abed266bcf512?placeholderIfAbsent=true&apiKey=1a4d049d8fe54d8aa58f4ebfa539d65f',
            alt: 'Battery',
          },
        ].map((icon, index) => (
          <StatusBarIcon key={index} {...icon} />
        ))}
      </div>
    </div>
  )
}
