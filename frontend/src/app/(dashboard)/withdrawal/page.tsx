'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { toast } from 'sonner'
import axios from 'axios'

const cancellationOptions = [
  {
    id: 1,
    text: '더 이상 서비스를 이용하지 않아요',
    selected: false,
  },
  {
    id: 2,
    text: '서비스가 불만족스러워요',
    selected: false,
  },
  {
    id: 3,
    text: '다른 서비스를 이용하고 싶어요',
    selected: false,
  },
  {
    id: 4,
    text: '기타',
    selected: false,
  },
]

export default function WithdrawalPage() {
  const router = useRouter()
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/login')
    },
  })
  const [selectedReason, setSelectedReason] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleBack = () => {
    router.back()
  }

  const handleReasonSelect = (id: number) => {
    setSelectedReason(id)
  }

  const handleWithdrawal = async () => {
    if (!selectedReason) {
      toast.error('탈퇴 사유를 선택해주세요')
      return
    }

    if (!confirm('정말로 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return
    }

    setIsLoading(true)

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/withdrawal`,
        {
          reason: cancellationOptions[selectedReason - 1].text,
        },
        {
          headers: {
            Authorization: `Bearer ${session?.user?.id}`,
          },
        },
      )

      await signOut({ redirect: false })
      toast.success('회원 탈퇴가 완료되었습니다')
      router.push('/login')
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message || '회원 탈퇴 중 오류가 발생했습니다',
        )
      } else {
        toast.error('알 수 없는 오류가 발생했습니다')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex overflow-hidden flex-col pb-2 mx-auto w-full bg-white max-w-[480px]">
      <div className="flex justify-between items-center w-full bg-white min-h-[60px] px-4">
        <button
          onClick={handleBack}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M15 19L8 12L15 5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <div className="text-base font-semibold text-stone-900">회원 탈퇴</div>
        <div className="w-10" /> {/* 좌우 균형을 맞추기 위한 빈 공간 */}
      </div>

      <div className="px-5 py-3.5">
        <h1 className="text-xl font-semibold leading-7 text-neutral-800">
          회원탈퇴를 하는
          <br />
          이유를 알려주세요
        </h1>
      </div>

      <div className="flex flex-col px-5 mt-1.5 w-full text-base font-semibold">
        {cancellationOptions.map((option) => (
          <div
            key={option.id}
            className={`flex gap-10 justify-between items-center py-4 px-5 w-full rounded-lg cursor-pointer mb-3 ${
              selectedReason === option.id
                ? 'bg-stone-200 border border-solid border-stone-700 text-stone-700'
                : 'bg-neutral-50 hover:bg-stone-100'
            }`}
            onClick={() => handleReasonSelect(option.id)}
          >
            <div>{option.text}</div>
            {selectedReason === option.id && (
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 6L9 17L4 12" />
              </svg>
            )}
          </div>
        ))}
      </div>

      <div className="flex flex-col mt-auto w-full">
        <div className="flex px-5 pt-2.5 pb-4 w-full">
          <button
            onClick={handleWithdrawal}
            disabled={!selectedReason || isLoading}
            className="w-full py-4 text-base font-semibold text-white rounded-lg bg-stone-700 hover:bg-stone-800 disabled:bg-stone-400 disabled:cursor-not-allowed"
          >
            {isLoading ? '처리중...' : '탈퇴하기'}
          </button>
        </div>
      </div>
    </div>
  )
}
