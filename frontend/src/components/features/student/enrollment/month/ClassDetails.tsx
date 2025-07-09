import * as React from 'react'
import { TeacherSection } from './TeacherSection'
import { LocationSection } from './LocationSection'
import { ClassInfo } from './types'

const classInfo: ClassInfo = {
  title: '비기너반',
  teacher: '고예진 선생님',
  schedule: '월요일 7:30 - 9:00PM',
  description:
    '발레를 처음 도전하는 분들을 위한 클래스입니다. 스트레칭부터 시작해 발레를 위한 근육 운동, 턴아웃의 개념, 그리고 기본 용어에 대한 이해까지 천천히 진행할 예정입니다.',
  dividerImageUrl: '/images/dividers.svg',
  teacher_info: {
    name: '고예진 선생님',
    education: [
      '동덕여대 무용(발레) 졸업',
      '현) 서초동 이지라인무용 발레강사',
      '현) 신도림 레베랑스 발레 발레전임강사',
      '전) 방배동 자이로토닉서래 발레전임강사',
      '(배우 이하늬 개인레슨)',
      '전) 압구정 인사이드발레 성인반 강사',
    ],
    imageUrl:
      'https://cdn.builder.io/api/v1/image/assets/TEMP/003275e14680a43ac88565992b56287db7bb7004591769f658d3301ab4451933?placeholderIfAbsent=true&apiKey=1a4d049d8fe54d8aa58f4ebfa539d65f',
  },
  location: {
    name: '더엘 스튜디오 무용연습실',
    station: '성신여대입구역 2번출구에서',
    distance: '240m',
    line: '4',
    mapImageUrl:
      'https://cdn.builder.io/api/v1/image/assets/TEMP/5b7ef8992fb5c481fbdbc004b7599da5878d072d295ce6986f287f11754dc84b?placeholderIfAbsent=true&apiKey=1a4d049d8fe54d8aa58f4ebfa539d65f',
  },
}

interface ClassDetailsProps {
  onClose: () => void
}

export function ClassDetails({ onClose }: ClassDetailsProps) {
  return (
    <div className="flex overflow-hidden flex-col mx-auto w-full bg-white max-w-[480px]">
      <div className="flex flex-col pt-28 w-full bg-stone-900 bg-opacity-30">
        <div className="flex overflow-hidden flex-col pt-3 w-full bg-white rounded-3xl">
          <div className="flex gap-10 justify-between items-center mx-3 w-full max-w-[351px]">
            <div className="flex gap-2.5 items-center self-stretch p-2.5 my-auto w-11">
              <div className="flex self-stretch my-auto w-6 min-h-[24px]" />
            </div>
            <div className="self-stretch my-auto text-base font-semibold tracking-normal leading-snug text-stone-900">
              클래스 상세 정보
            </div>
            <button
              onClick={onClose}
              className="flex gap-2.5 items-center self-stretch p-2.5 my-auto w-11"
            >
              <img
                loading="lazy"
                src="/icons/Close.svg"
                alt="Close"
                className="object-contain self-stretch my-auto w-6 aspect-square"
              />
            </button>
          </div>
          <div className="flex z-10 flex-col mt-1 w-full">
            <div className="gap-2.5 self-stretch px-5 pt-3 w-full text-xl font-semibold leading-tight whitespace-nowrap text-neutral-800">
              {classInfo.title}
            </div>
            <div className="flex flex-col px-5 mt-2.5 w-full">
              <div className="flex flex-col w-full text-base tracking-normal leading-snug text-neutral-800">
                <div className="flex flex-col w-full">
                  <div className="font-semibold">{classInfo.teacher}</div>
                  <div>{classInfo.schedule}</div>
                </div>
                <img
                  loading="lazy"
                  src={classInfo.dividerImageUrl}
                  alt=""
                  className="object-contain mt-4 w-full aspect-[333.33] stroke-[1px] stroke-zinc-300"
                />
              </div>
              <div className="flex flex-col mt-5 w-full">
                <div className="text-base tracking-normal leading-5 text-neutral-800">
                  {classInfo.description}
                </div>
                <TeacherSection teacherInfo={classInfo.teacher_info} />
                <LocationSection location={classInfo.location} />
              </div>
            </div>
          </div>
          <div className="flex overflow-hidden flex-col justify-center pb-2 mt-0 w-full bg-white">
            <div className="flex z-10 flex-col w-full">
              <div className="flex flex-col items-center px-20 pt-5 pb-2 w-full max-sm:hidden">
                <div className="flex shrink-0 bg-black h-[5px] rounded-[100px] w-[134px]" />
              </div>
            </div>
            <div className="flex shrink-0 self-center mt-0 bg-black rounded-md h-[5px] w-[120px]" />
          </div>
        </div>
      </div>
    </div>
  )
}
