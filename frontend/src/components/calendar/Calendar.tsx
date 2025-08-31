import * as React from 'react'
import { CalendarDay } from './CalendarDay'
import { Tab } from '@/components/common/Tab'
import { EmptyState } from '@/components/ui/EmptyState'
import { useDashboardNavigation } from '@/contexts/DashboardContext'
import Image from 'next/image'

export function Calendar() {
  const { enrollment } = useDashboardNavigation()
  const { selectedClassesWithSessions } = enrollment

  const tabs = [
    { label: '클래스 정보', isActive: true },
    { label: '수강신청', isActive: false },
    { label: '나의 정보', isActive: false },
  ]

  // 선택된 클래스들의 세션 정보를 날짜별로 정리
  const sessionDates = React.useMemo(() => {
    const dates = new Set<string>()
    
    selectedClassesWithSessions.forEach(classInfo => {
      classInfo.sessions.forEach(session => {
        const dateStr = new Date(session.date).toISOString().split('T')[0]
        dates.add(dateStr)
      })
    })
    
    return Array.from(dates)
  }, [selectedClassesWithSessions])

  const generateCalendarDays = () => {
    const days = []
    const totalDays = 35

    for (let i = 0; i < totalDays; i++) {
      if (i < 1) {
        days.push({ day: 31, isCurrentMonth: false })
      } else if (i >= 32) {
        days.push({ day: i - 31, isCurrentMonth: false })
      } else {
        // 해당 날짜에 세션이 있는지 확인
        const currentDate = new Date(2024, 0, i) // 2024년 1월 기준
        const dateStr = currentDate.toISOString().split('T')[0]
        const hasSession = sessionDates.includes(dateStr)
        
        days.push({ day: i, isCurrentMonth: true, hasEvent: hasSession })
      }
    }
    return days
  }

  return (
    <div className="flex overflow-hidden flex-col pb-2 mx-auto w-full bg-white max-w-[480px]">
      <div className="flex justify-center items-center w-full bg-white min-h-[60px] max-sm:hidden">
        <div className="flex overflow-hidden flex-1 shrink gap-1 justify-center items-center self-stretch px-9 py-6 my-auto text-lg tracking-tight leading-none text-center text-black whitespace-nowrap basis-0 font-[590] min-h-[60px] max-sm:hidden">
          <div className="self-stretch my-auto w-[35px]">9:41</div>
          <Image
            loading="lazy"
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/4e8736a26a142e1ec8b201682842001784745b236983c002f8b27d3bc6251b4f?placeholderIfAbsent=true&apiKey=1a4d049d8fe54d8aa58f4ebfa539d65f"
            alt=""
            width={14}
            height={14}
            className="object-contain shrink-0 self-stretch my-auto w-3.5 aspect-square max-sm:hidden"
          />
        </div>
        <Image
          loading="lazy"
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/166296ca83fd516527c548b0550ab4e791e5c1cd46664e5ca94c71b1978b85b9?placeholderIfAbsent=true&apiKey=1a4d049d8fe54d8aa58f4ebfa539d65f"
          alt="Logo"
          width={122}
          height={36}
          className="object-contain shrink-0 self-stretch my-auto aspect-[3.39] fill-black w-[122px] max-sm:hidden"
        />
        <div className="flex overflow-hidden flex-1 shrink gap-2.5 justify-center items-center self-stretch py-6 pr-6 pl-5 my-auto basis-[31px] min-h-[60px] max-sm:hidden">
          {[3, 4, 5].map((num) => (
            <Image
              key={num}
              loading="lazy"
              src={`http://b.io/ext_${num}-`}
              alt=""
              width={18}
              height={14}
              className="object-contain shrink-0 self-stretch my-auto aspect-[1.29] w-[18px]"
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col justify-center px-3 py-2.5 w-full text-lg whitespace-nowrap bg-white shadow-sm text-neutral-800 max-sm:hidden">
        <div className="flex gap-5 justify-between py-2 pr-3.5 pl-16 w-full bg-gray-200 rounded-[30px] max-sm:hidden">
          <div className="flex gap-2 justify-center items-center">
            <Image
              loading="lazy"
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/352d224f256ed6f439a51281d759a310f2e4283345b2231407cc138112e9a5e2?placeholderIfAbsent=true&apiKey=1a4d049d8fe54d8aa58f4ebfa539d65f"
              alt=""
              width={16}
              height={16}
              className="object-contain shrink-0 self-stretch my-auto w-4 aspect-square"
            />
            <div className="self-stretch my-auto">teamelliot.kr/</div>
          </div>
          <Image
            loading="lazy"
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/0a6f999fc003e1ce58009d125d93f1e980012734eb6d59543a7d8dc27fcb9d83?placeholderIfAbsent=true&apiKey=1a4d049d8fe54d8aa58f4ebfa539d65f"
            alt=""
            width={21}
            height={21}
            className="object-contain shrink-0 aspect-square w-[21px]"
          />
        </div>
      </div>

      <div className="flex flex-col w-full">
        <div className="flex flex-col w-full">
          <div className="flex gap-2.5 justify-center items-center px-2.5 py-2 w-full min-h-[60px]">
            <Image
              loading="lazy"
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/e94b4108806c5e24acc0a1b86a5f51f22a6f8a2afdb27522cea58111d5f835bf?placeholderIfAbsent=true&apiKey=1a4d049d8fe54d8aa58f4ebfa539d65f"
              alt="Brand Logo"
              width={77}
              height={46}
              className="object-contain self-stretch my-auto aspect-[1.68] w-[77px]"
            />
          </div>
          <div className="flex items-center px-5 w-full text-base font-semibold tracking-normal leading-snug border-b border-solid border-b-zinc-100 text-stone-300">
            {tabs.map((tab, index) => (
              <Tab key={index} {...tab} />
            ))}
          </div>
        </div>

        <div className="flex flex-col w-full text-center whitespace-nowrap bg-white text-stone-700">
          <div className="flex items-center px-7 pt-3 pb-2 w-full text-base font-semibold tracking-normal leading-snug">
            <div className="flex gap-1.5 items-center self-stretch my-auto">
              <div className="self-stretch my-auto">2024년</div>
              <div className="self-stretch my-auto">1월</div>
            </div>
            <Image
              loading="lazy"
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/8e80d656261a9135b861c3289a94066a71a11854c2d4a8208ba578cf330c4442?placeholderIfAbsent=true&apiKey=1a4d049d8fe54d8aa58f4ebfa539d65f"
              alt=""
              width={24}
              height={24}
              className="object-contain shrink-0 self-stretch my-auto w-6 aspect-square"
            />
          </div>

          <div className="flex flex-col w-full font-medium">
            <div className="flex justify-center items-center px-2.5 w-full text-sm tracking-normal leading-snug">
              {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
                <div
                  key={index}
                  className="self-stretch pt-0.5 pb-1 my-auto w-[50px]"
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="flex flex-col w-full text-base tracking-normal">
              {Array.from({ length: 5 }).map((_, weekIndex) => (
                <div
                  key={weekIndex}
                  className="flex justify-center items-center px-2.5 mt-2 w-full"
                >
                  {generateCalendarDays()
                    .slice(weekIndex * 7, (weekIndex + 1) * 7)
                    .map((day, dayIndex) => (
                      <CalendarDay key={dayIndex} {...day} />
                    ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex mt-4 w-full opacity-50 bg-zinc-100 min-h-[8px]" />

      <div className="flex flex-col px-5 mt-4 w-full text-center">
        {[
          { title: '수강중인 클래스', message: '수강중인 클래스가 없습니다' },
          { title: '신청중인 클래스', message: '신청중인 클래스가 없습니다' },
        ].map((section, index) => (
          <div key={index} className="flex flex-col mt-5 w-full">
            <div className="gap-2.5 self-start px-2 text-base font-semibold tracking-normal leading-snug text-stone-700">
              {section.title}
            </div>
            <EmptyState
              title={section.title}
              imageUrl="https://cdn.builder.io/api/v1/image/assets/TEMP/4ce3811c3feda5f9b5b7e243932c01f9ec25f0ab1363ce5fa7d63bb3964c4637?placeholderIfAbsent=true&apiKey=1a4d049d8fe54d8aa58f4ebfa539d65f"
              message={section.message}
            />
          </div>
        ))}
      </div>

      <div className="flex shrink-0 self-center mt-9 bg-black h-[5px] rounded-[100px] w-[134px] max-sm:hidden" />
    </div>
  )
}
