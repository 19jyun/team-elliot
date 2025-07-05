'use client'

import * as React from 'react'
import { Navigation } from '@/components/navigation/Navigation'
import { EnrollmentCard } from './EnrollmentCard'
import { Notice } from './Notice'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'

export default function EnrollPage() {
  const router = useRouter()
  const { status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/login')
    },
  })

  // 현재 달과 이전 달 계산
  const currentDate = new Date()
  const currentMonth = currentDate.getMonth() + 1 // JavaScript의 월은 0부터 시작
  const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1
  const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1
  const nowMonth = currentMonth

  // 현재가 월말(25일 이후)인지 확인
  // const isEndOfMonth = currentDate.getDate() >= 25
  const isEndOfMonth = true

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-700" />
      </div>
    )
  }

  return (
    <div className="flex overflow-hidden flex-col pb-2 mx-auto w-full bg-white max-w-[480px]">


      {/* 수강신청 카드 섹션 */}
      <div className="flex flex-col self-center mt-5 w-full font-semibold leading-snug text-center max-w-[335px]">
        {/* 이전 달 수강신청 */}
        <EnrollmentCard
          title={`${prevMonth}월 수강신청`}
          onClick={() => {
            if (!isEndOfMonth) {
              toast.error('신청 기간이 아닙니다')
              return
            }
          }}
        />
        {nowMonth === currentMonth && (
          <div className="mt-3">
            <EnrollmentCard
              title={`${nowMonth}월 수강신청`}
              onClick={() => {
                if (!isEndOfMonth) {
                  toast.error('신청 기간이 아닙니다')
                  return
                }
              }}
            />
          </div>
        )}

        {/* 다음 달 수강신청 (월말에만 표시) */}
        {isEndOfMonth && (
          <div className="mt-3">
            <EnrollmentCard
              title={`${nextMonth}월 수강신청`}
              isNew
              onClick={() =>
                router.push(`/dashboard/student/enroll/${nextMonth}`)
              }
            />
          </div>
        )}
      </div>

      {/* 구분선 */}
      <div className="flex gap-2 items-center self-center mt-6 w-full max-w-[327px]">
        <div className="flex-1 h-[1px] bg-stone-200" />
        <div className="flex-1 h-[1px] bg-stone-200" />
      </div>

      {/* 공지사항 섹션 */}
      <div className="flex flex-col self-center mt-5 w-full text-center max-w-[335px]">
        <div className="text-lg font-semibold leading-tight text-stone-700">
          공지사항
        </div>
        <Notice
          title={`[필독] ${nextMonth}월 수강신청 안내`}
          content={`${nextMonth}월에 클래스를 1개 이상 수강신청 했으면 ${currentMonth}/15 부터 신청 가능  신규 수강은 ${currentMonth}/18 부터  각 타임당 10명 정원 채워질 시 마감`}
        />
      </div>
    </div>
  )
}
