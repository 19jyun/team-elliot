import * as React from 'react'
import Image from 'next/image'
import { StatusBar } from '@/components/ui/StatusBar'
import { AddressBar } from '@/components/navigation/AddressBar'
import { CancellationOption } from './CancellationOption'
import { cancellationOptions } from '@/app/(dashboard)/data'

export const MembershipCancellation: React.FC = () => {
  return (
    <div className="flex overflow-hidden flex-col pb-2 mx-auto w-full bg-white max-w-[480px]">
      <StatusBar
        time="9:41"
        icons={[
          {
            src:
              'https://cdn.builder.io/api/v1/image/assets/TEMP/4e8736a26a142e1ec8b201682842001784745b236983c002f8b27d3bc6251b4f?placeholderIfAbsent=true&apiKey=1a4d049d8fe54d8aa58f4ebfa539d65f',
            alt: '',
            width: '3.5',
            aspectRatio: 'square',
          },
          {
            src:
              'https://cdn.builder.io/api/v1/image/assets/TEMP/b20cf3d1a1089c2ce3efe80fde511dfa79ef6f908eb5c2afa869720c4b684cd6?placeholderIfAbsent=true&apiKey=1a4d049d8fe54d8aa58f4ebfa539d65f',
            alt: '',
            width: '18px',
            aspectRatio: '1.29',
          },
          {
            src:
              'https://cdn.builder.io/api/v1/image/assets/TEMP/66bdfbf4144bc6fe6e7c9aaad83d0d997eb74a2c0d0f143be9a2a02fcbc6416e?placeholderIfAbsent=true&apiKey=1a4d049d8fe54d8aa58f4ebfa539d65f',
            alt: '',
            width: '18px',
            aspectRatio: '1.29',
          },
          {
            src:
              'https://cdn.builder.io/api/v1/image/assets/TEMP/ad8416e32d558b3e2e98e7b3505a32dddc696afea388798cbb7abed266bcf512?placeholderIfAbsent=true&apiKey=1a4d049d8fe54d8aa58f4ebfa539d65f',
            alt: '',
            width: '27px',
            aspectRatio: '1.93',
          },
        ]}
        logoSrc="https://cdn.builder.io/api/v1/image/assets/TEMP/677c14e60b9630b64a79b4f5afdb2402e56ed965e67c09e84ef18c83eeaf4e3f?placeholderIfAbsent=true&apiKey=1a4d049d8fe54d8aa58f4ebfa539d65f"
      />
      <AddressBar />
      <div className="flex gap-10 justify-between items-center px-2.5 py-2 w-full">
        <div className="flex gap-2.5 items-center self-stretch p-2.5 my-auto w-11">
          <Image
            loading="lazy"
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/bcd9bb6258819f3aa5d48c4b53cfdbb58edd1beb02be396f51e8f02be74c4867?placeholderIfAbsent=true&apiKey=1a4d049d8fe54d8aa58f4ebfa539d65f"
            alt="Back"
            width={24}
            height={24}
            className="object-contain self-stretch my-auto w-6 aspect-square"
          />
        </div>
        <div className="self-stretch my-auto text-base font-semibold text-stone-900">
          회원 탈퇴
        </div>
        <div className="flex gap-2.5 items-center self-stretch p-2.5 my-auto w-11">
          <div className="flex self-stretch my-auto w-6 min-h-[24px]" />
        </div>
      </div>
      <div className="gap-2.5 self-stretch px-5 py-3.5 text-xl font-semibold leading-7 text-neutral-800">
        회원탈퇴를 하는
        <br />
        이유를 알려주세요
      </div>
      <div className="flex flex-col self-center mt-1.5 w-full text-base font-semibold tracking-normal leading-snug max-w-[335px] text-neutral-800">
        {cancellationOptions.map((option) => (
          <div key={option.id} className={option.id > 1 ? 'mt-3' : ''}>
            <CancellationOption option={option} />
          </div>
        ))}
      </div>
      <div className="flex z-10 flex-col mt-44 w-full">
        <div className="flex gap-3 justify-center px-5 pt-2.5 pb-4 w-full text-base font-semibold leading-snug text-white whitespace-nowrap bg-white">
          <button className="flex-1 shrink gap-2.5 self-stretch px-2.5 py-4 rounded-lg bg-stone-400 min-w-[240px] size-full">
            탈퇴하기
          </button>
        </div>
        <div className="flex flex-col justify-center items-center px-20 pt-5 pb-2 w-full bg-white max-sm:hidden">
          <div className="flex shrink-0 bg-black h-[5px] rounded-[100px] w-[134px]" />
        </div>
      </div>
      <div className="flex shrink-0 self-center mt-0 bg-black h-[5px] rounded-[100px] w-[134px]" />
    </div>
  )
}
