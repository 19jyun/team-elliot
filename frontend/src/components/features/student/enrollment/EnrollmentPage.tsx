import * as React from 'react'
import { NavigationItem } from './NavigationItem'
import { EnrollmentCard } from './EnrollmentCard'
import { Notice } from './Notice'

export const EnrollmentPage: React.FC = () => {
  const navigationItems = [
    { label: '클래스 정보', isActive: false },
    { label: '수강신청', isActive: true },
    { label: '나의 정보', isActive: false },
  ]

  return (
    <div className="flex overflow-hidden flex-col pb-2 mx-auto w-full bg-white max-w-[480px]">
      <div className="flex justify-center items-center w-full bg-white min-h-[60px] max-sm:hidden">
        <div className="flex overflow-hidden flex-1 shrink gap-1 justify-center items-center self-stretch px-9 py-6 my-auto text-lg tracking-tight leading-none text-center text-black whitespace-nowrap basis-0 font-[590] min-h-[60px] max-sm:hidden">
          <div className="self-stretch my-auto w-[35px]">9:41</div>
          <img
            loading="lazy"
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/4e8736a26a142e1ec8b201682842001784745b236983c002f8b27d3bc6251b4f?placeholderIfAbsent=true&apiKey=1a4d049d8fe54d8aa58f4ebfa539d65f"
            alt=""
            className="object-contain shrink-0 self-stretch my-auto w-3.5 aspect-square"
          />
        </div>
        <img
          loading="lazy"
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/594ade567ded8303d67c357c3ffc10a1d2c3806966b6ac85dfb2f1740ea2d863?placeholderIfAbsent=true&apiKey=1a4d049d8fe54d8aa58f4ebfa539d65f"
          alt="Logo"
          className="object-contain shrink-0 self-stretch my-auto aspect-[3.39] fill-black w-[122px] max-sm:hidden"
        />
        <div className="flex overflow-hidden flex-1 shrink gap-2.5 justify-center items-center self-stretch py-6 pr-6 pl-5 my-auto basis-[31px] min-h-[60px] max-sm:hidden">
          <img
            loading="lazy"
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/b20cf3d1a1089c2ce3efe80fde511dfa79ef6f908eb5c2afa869720c4b684cd6?placeholderIfAbsent=true&apiKey=1a4d049d8fe54d8aa58f4ebfa539d65f"
            alt="Status icon"
            className="object-contain shrink-0 self-stretch my-auto aspect-[1.29] w-[18px]"
          />
          <img
            loading="lazy"
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/66bdfbf4144bc6fe6e7c9aaad83d0d997eb74a2c0d0f143be9a2a02fcbc6416e?placeholderIfAbsent=true&apiKey=1a4d049d8fe54d8aa58f4ebfa539d65f"
            alt="Status icon"
            className="object-contain shrink-0 self-stretch my-auto aspect-[1.29] w-[18px]"
          />
          <img
            loading="lazy"
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/ad8416e32d558b3e2e98e7b3505a32dddc696afea388798cbb7abed266bcf512?placeholderIfAbsent=true&apiKey=1a4d049d8fe54d8aa58f4ebfa539d65f"
            alt="Status icon"
            className="object-contain shrink-0 self-stretch my-auto aspect-[1.93] w-[27px]"
          />
        </div>
      </div>
      <div className="flex flex-col justify-center px-3 py-2.5 w-full text-lg whitespace-nowrap bg-white shadow-sm text-neutral-800 max-sm:hidden">
        <div className="flex gap-5 justify-between py-2 pr-3.5 pl-16 w-full bg-gray-200 rounded-[30px] max-sm:hidden">
          <div className="flex gap-2 justify-center items-center">
            <img
              loading="lazy"
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/4d74427f5efa3bb80636af8afc7bd65185b50a388a7ea910c1be17801ef8c6ec?placeholderIfAbsent=true&apiKey=1a4d049d8fe54d8aa58f4ebfa539d65f"
              alt="URL icon"
              className="object-contain shrink-0 self-stretch my-auto w-4 aspect-square"
            />
            <div className="self-stretch my-auto">teamelliot.kr/</div>
          </div>
          <img
            loading="lazy"
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/e52511d6c5f60e9f9c3b11bf91e9b94a881bfe5786f53d160c28e24d7a17c460?placeholderIfAbsent=true&apiKey=1a4d049d8fe54d8aa58f4ebfa539d65f"
            alt="Menu icon"
            className="object-contain shrink-0 aspect-square w-[21px]"
          />
        </div>
      </div>
      <div className="flex gap-2.5 justify-center items-center px-2.5 py-2 min-h-[60px]">
        <img
          loading="lazy"
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/e94b4108806c5e24acc0a1b86a5f51f22a6f8a2afdb27522cea58111d5f835bf?placeholderIfAbsent=true&apiKey=1a4d049d8fe54d8aa58f4ebfa539d65f"
          alt="Brand logo"
          className="object-contain self-stretch my-auto aspect-[1.68] w-[77px]"
        />
      </div>
      <div className="flex items-center px-5 w-full text-base font-semibold tracking-normal leading-snug border-b border-solid border-b-zinc-100">
        {navigationItems.map((item, index) => (
          <NavigationItem key={index} {...item} />
        ))}
      </div>
      <div className="flex flex-col self-center mt-5 w-full font-semibold leading-snug text-center max-w-[335px]">
        <EnrollmentCard title="8월 수강신청" />
        <div className="mt-3">
          <EnrollmentCard title="9월 수강신청" isNew />
        </div>
      </div>
      <div className="flex gap-2 items-center self-center mt-6 w-full max-w-[327px]">
        <img
          loading="lazy"
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/255f19094a6a82682e8f3620f63dc1a523f63e687d6d6964999bc8b85cdf5afc?placeholderIfAbsent=true&apiKey=1a4d049d8fe54d8aa58f4ebfa539d65f"
          alt=""
          className="object-contain flex-1 shrink self-stretch my-auto aspect-[166.67] basis-0 stroke-[1px] stroke-stone-400 w-[155px]"
        />
        <img
          loading="lazy"
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/b879ad653a2874c9129c2d820f9485ed8ee2b2878b7c32d5be6cb5037b25d7fa?placeholderIfAbsent=true&apiKey=1a4d049d8fe54d8aa58f4ebfa539d65f"
          alt=""
          className="object-contain flex-1 shrink self-stretch my-auto aspect-[166.67] basis-0 stroke-[1px] stroke-stone-400 w-[154px]"
        />
      </div>
      <div className="flex flex-col self-center mt-5 w-full text-center max-w-[335px]">
        <div className="text-lg font-semibold leading-tight text-stone-700">
          공지사항
        </div>
        <Notice
          title="[필독] 9월 수강신청 안내"
          content="9월에 클래스를 1개 이상 수강신청 했으면 8/15 부터 신청 가능  신규 수강은 8/18 부터  각 타임당 10명 정원 채워질 시 마감"
        />
      </div>
      <div className="flex shrink-0 self-center mt-36 bg-black h-[5px] rounded-[100px] w-[134px] max-sm:hidden" />
    </div>
  )
}
