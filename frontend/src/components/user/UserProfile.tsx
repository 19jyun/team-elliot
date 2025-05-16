import * as React from 'react'
import { StatusBar } from '@/components/ui/StatusBar'
import { Navigation } from '@/components/navigation/Navigation'
import { MenuLinks } from '@/components/navigation/MenuLinks'

export function UserProfile() {
  const navItems = [
    { label: '클래스 정보' },
    { label: '수강신청' },
    { label: '나의 정보', isActive: true },
  ]

  const menuLinks = [
    {
      label: '소모임 정보',
      icon:
        'https://cdn.builder.io/api/v1/image/assets/TEMP/065af75df024100ecd9aa64c48194c5383d4ae63aeddca7e069c55795bdbe02d?placeholderIfAbsent=true&apiKey=1a4d049d8fe54d8aa58f4ebfa539d65f',
    },
    {
      label: '개인 정보',
      icon:
        'https://cdn.builder.io/api/v1/image/assets/TEMP/065af75df024100ecd9aa64c48194c5383d4ae63aeddca7e069c55795bdbe02d?placeholderIfAbsent=true&apiKey=1a4d049d8fe54d8aa58f4ebfa539d65f',
    },
    {
      label: '신청/결제 내역',
      icon:
        'https://cdn.builder.io/api/v1/image/assets/TEMP/065af75df024100ecd9aa64c48194c5383d4ae63aeddca7e069c55795bdbe02d?placeholderIfAbsent=true&apiKey=1a4d049d8fe54d8aa58f4ebfa539d65f',
    },
    {
      label: '환불/취소 내역',
      icon:
        'https://cdn.builder.io/api/v1/image/assets/TEMP/065af75df024100ecd9aa64c48194c5383d4ae63aeddca7e069c55795bdbe02d?placeholderIfAbsent=true&apiKey=1a4d049d8fe54d8aa58f4ebfa539d65f',
    },
  ]

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
      <div className="flex flex-col justify-center px-3 py-2.5 w-full text-lg whitespace-nowrap bg-white shadow-sm text-neutral-800 max-sm:hidden">
        <div className="flex gap-5 justify-between py-2 pr-3.5 pl-16 w-full bg-gray-200 rounded-[30px]">
          <div className="flex gap-2 justify-center items-center">
            <img
              loading="lazy"
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/4d74427f5efa3bb80636af8afc7bd65185b50a388a7ea910c1be17801ef8c6ec?placeholderIfAbsent=true&apiKey=1a4d049d8fe54d8aa58f4ebfa539d65f"
              alt=""
              className="object-contain shrink-0 self-stretch my-auto w-4 aspect-square"
            />
            <div className="self-stretch my-auto">teamelliot.kr/</div>
          </div>
          <img
            loading="lazy"
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/e52511d6c5f60e9f9c3b11bf91e9b94a881bfe5786f53d160c28e24d7a17c460?placeholderIfAbsent=true&apiKey=1a4d049d8fe54d8aa58f4ebfa539d65f"
            alt=""
            className="object-contain shrink-0 aspect-square w-[21px]"
          />
        </div>
      </div>
      <div className="flex flex-col w-full">
        <div className="flex gap-2.5 justify-center items-center px-2.5 py-2 w-full min-h-[60px]">
          <img
            loading="lazy"
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/e94b4108806c5e24acc0a1b86a5f51f22a6f8a2afdb27522cea58111d5f835bf?placeholderIfAbsent=true&apiKey=1a4d049d8fe54d8aa58f4ebfa539d65f"
            alt="Logo"
            className="object-contain self-stretch my-auto aspect-[1.68] w-[77px]"
          />
        </div>
        <Navigation items={navItems} />
      </div>
      <MenuLinks links={menuLinks} />
      <div className="flex flex-col px-5 mt-48 w-full text-base font-semibold leading-snug whitespace-nowrap text-neutral-400">
        <button className="gap-2.5 self-stretch px-2.5 py-4 w-full rounded-lg border border-solid border-zinc-300">
          로그아웃
        </button>
      </div>
      <footer className="flex flex-col px-5 pt-3.5 pb-12 mt-6 w-full text-sm font-medium tracking-normal leading-snug whitespace-nowrap bg-neutral-100 min-h-[80px] text-neutral-400">
        <nav className="flex gap-6 justify-center items-center max-w-full w-[335px]">
          <a href="#" className="self-stretch my-auto">
            이용약관
          </a>
          <a href="#" className="self-stretch my-auto">
            개인정보처리방침
          </a>
          <a href="#" className="self-stretch my-auto">
            회원탈퇴
          </a>
        </nav>
      </footer>
      <div className="flex z-10 shrink-0 self-center mt-0 bg-black h-[5px] rounded-[100px] w-[134px] max-sm:hidden" />
    </div>
  )
}
