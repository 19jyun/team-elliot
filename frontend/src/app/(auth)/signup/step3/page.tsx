'use client'

import * as React from 'react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import axios from 'axios'

export default function SignupStep3Page() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [agreements, setAgreements] = useState({
    age: false,
    terms1: false,
    terms2: false,
    marketing: false,
  })
  const [allChecked, setAllChecked] = useState(false)

  const handleBack = () => {
    router.push('/signup/step2')
  }

  const handleAllCheck = () => {
    const newValue = !allChecked
    setAllChecked(newValue)
    setAgreements({
      age: newValue,
      terms1: newValue,
      terms2: newValue,
      marketing: newValue,
    })
  }

  const handleSingleCheck = (key: keyof typeof agreements) => {
    const newAgreements = {
      ...agreements,
      [key]: !agreements[key],
    }
    setAgreements(newAgreements)
    setAllChecked(Object.values(newAgreements).every((value) => value === true))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // 필수 약관 체크 확인
    if (!agreements.age || !agreements.terms1 || !agreements.terms2) {
      toast.error('필수 약관에 동의해주세요')
      return
    }

    setIsLoading(true)

    try {
      // 세션 스토리지에서 이전 단계 데이터 가져오기
      const signupData = JSON.parse(
        sessionStorage.getItem('signupData') || '{}',
      )

      // API 호출
      const response = await axios.post('/api/auth/signup', {
        name: signupData.name,
        userId: signupData.userId,
        password: signupData.password,
        phoneNumber: signupData.phoneNumber,
        marketing: agreements.marketing,
      })

      if (response.status === 200) {
        toast.success('회원가입이 완료되었습니다')
        sessionStorage.removeItem('signupData') // 세션 데이터 삭제
        router.push('/login') // 로그인 페이지로 리다이렉트
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || '회원가입에 실패했습니다')
      } else {
        toast.error('알 수 없는 오류가 발생했습니다')
      }
    } finally {
      setIsLoading(false)
    }
  }

  // 필수 약관 동의 여부 확인 함수 추가
  const isRequiredTermsChecked = () => {
    return agreements.age && agreements.terms1 && agreements.terms2
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
      </div>

      <form className="flex flex-col px-5 mt-8 w-full" onSubmit={handleSubmit}>
        <img
          src="/images/auth/team-eliot-1.png"
          alt="Team Eliot Logo"
          className="object-contain max-w-full aspect-[4.48] w-[220px]"
        />

        <div className="flex flex-col self-center mt-6 w-full">
          <div className="flex gap-2 items-center w-full">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={cn(
                  'flex-1 h-1 rounded-full',
                  step <= 3 ? 'bg-stone-700' : 'bg-stone-200',
                )}
              />
            ))}
          </div>
          <div className="flex gap-10 justify-between items-start mt-2 w-full text-sm font-medium text-stone-700">
            <div>마지막 단계입니다!</div>
            <div className="flex items-center whitespace-nowrap">
              <span>3/3</span>
            </div>
          </div>
        </div>

        <div className="self-start mt-6 text-xl font-medium leading-tight text-stone-700">
          약관에 동의해주세요
        </div>

        <div className="flex flex-col mt-5 w-full">
          <button
            type="button"
            onClick={handleAllCheck}
            className="flex gap-2 items-center py-4 w-full text-base font-medium border-b border-solid border-b-stone-400"
          >
            <div className="flex gap-2 items-center self-stretch px-1 my-auto">
              <div className="relative w-6 h-6">
                <input
                  type="checkbox"
                  checked={allChecked}
                  onChange={handleAllCheck}
                  className="absolute opacity-0 w-6 h-6 cursor-pointer"
                />
                <div
                  className={`w-6 h-6 border rounded ${
                    allChecked
                      ? 'bg-stone-700 border-stone-700'
                      : 'border-stone-300'
                  }`}
                >
                  {allChecked && (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      className="w-6 h-6 text-white"
                    >
                      <path
                        d="M20 6L9 17L4 12"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
              </div>
              <span>모두 동의합니다</span>
            </div>
          </button>

          <div className="flex flex-col gap-3 mt-4">
            {[
              { key: 'age', label: '만 18세 이상입니다', required: true },
              { key: 'terms1', label: '서비스 이용약관 동의', required: true },
              {
                key: 'terms2',
                label: '개인정보 처리방침 동의',
                required: true,
              },
              {
                key: 'marketing',
                label: '혜택/이벤트 정보 수신 동의',
                required: false,
              },
            ].map((item) => (
              <label
                key={item.key}
                className="flex gap-2 items-center group cursor-pointer"
              >
                <div className="relative w-6 h-6">
                  <input
                    type="checkbox"
                    checked={agreements[item.key as keyof typeof agreements]}
                    onChange={() =>
                      handleSingleCheck(item.key as keyof typeof agreements)
                    }
                    className="absolute opacity-0 w-6 h-6 cursor-pointer"
                  />
                  <div
                    className={`w-6 h-6 border rounded transition-colors ${
                      agreements[item.key as keyof typeof agreements]
                        ? 'bg-stone-700 border-stone-700'
                        : 'border-stone-300 group-hover:border-stone-400'
                    }`}
                  >
                    {agreements[item.key as keyof typeof agreements] && (
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        className="w-6 h-6 text-white"
                      >
                        <path
                          d="M20 6L9 17L4 12"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                </div>
                <div className="flex gap-1 items-center">
                  <span className="text-base text-stone-700">{item.label}</span>
                  {item.required && (
                    <span className="text-base text-stone-500">(필수)</span>
                  )}
                  {!item.required && (
                    <span className="text-base text-stone-500">(선택)</span>
                  )}
                </div>
              </label>
            ))}
          </div>

          <button
            type="submit"
            disabled={isLoading || !isRequiredTermsChecked()}
            className="mt-10 w-full h-11 px-8 inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium text-white bg-primary hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50"
          >
            {isLoading ? '처리중...' : '가입완료'}
          </button>
        </div>
      </form>
    </div>
  )
}
