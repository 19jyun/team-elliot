'use client'

import * as React from 'react'
import { useState } from 'react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { signup, signupPrincipal } from '@/api/auth'
import Image from 'next/image'
import { TermsModal } from '@/components/common/TermsModal'
import { PrivacyPolicyModal } from '@/components/common/PrivacyPolicyModal'


const ProgressBarItem = ({ isActive }: { isActive: boolean }) => (
  <div
    className={cn(
      'flex-1 h-1 rounded-full',
      isActive ? 'bg-stone-700' : 'bg-stone-200',
    )}
  />
)

export function SignupTermsPage() {
  const [currentStep] = useState(4)
  const [isLoading, setIsLoading] = useState(false)
  const [agreements, setAgreements] = useState({
    age: false,
    terms1: false,
    terms2: false,
  })
  const [allChecked, setAllChecked] = useState(false)
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false)
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false)

  const handleAllCheck = () => {
    const newValue = !allChecked
    setAllChecked(newValue)
    setAgreements({
      age: newValue,
      terms1: newValue,
      terms2: newValue,
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

      let response

      // Principal인 경우 별도 API 호출
      if (signupData.role === 'PRINCIPAL') {
        if (!signupData.academyInfo) {
          toast.error('학원 정보가 없습니다. 다시 시도해주세요.')
          return
        }

        response = await signupPrincipal({
          name: signupData.name,
          userId: signupData.userId,
          password: signupData.password,
          phoneNumber: signupData.phoneNumber,
          role: 'PRINCIPAL',
          academyInfo: signupData.academyInfo,
        })
      } else {
        // Student, Teacher는 기존 API 사용
        response = await signup({
          name: signupData.name,
          userId: signupData.userId,
          password: signupData.password,
          phoneNumber: signupData.phoneNumber,
          role: signupData.role,
        })
      }

      if (response) {
        toast.success('회원가입이 완료되었습니다')
        sessionStorage.removeItem('signupData') // 세션 데이터 삭제
        // 로그인 페이지로 이동 (기본 페이지)
        window.location.href = '/'
      }
    } catch (error) {
      console.error('회원가입 오류:', error)
      toast.error('회원가입에 실패했습니다')
    } finally {
      setIsLoading(false)
    }
  }

  // 필수 약관 동의 여부 확인 함수 추가
  const isRequiredTermsChecked = () => {
    return agreements.age && agreements.terms1 && agreements.terms2
  }

  return (
    <div className="flex flex-col mt-8 w-full">
      <Image
        src="/images/logo/team-eliot-1.png"
        alt="Team Eliot Logo"
        width={220}
        height={49}
        priority
        className="object-contain max-w-full w-[220px]"
      />

      <div className="flex flex-col self-center mt-6 w-full">
        <div className="flex gap-2 items-center w-full">
          {[1, 2, 3, 4].map((step) => (
            <ProgressBarItem key={step} isActive={step === currentStep} />
          ))}
        </div>
        <div className="flex gap-10 justify-between items-start mt-2 w-full text-sm font-medium text-stone-700">
          <div>마지막 단계입니다!</div>
          <div className="flex items-center whitespace-nowrap">
            <span>{currentStep}/4</span>
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
          {/* 만 18세 이상 */}
          <label className="flex gap-2 items-center group cursor-pointer">
            <div className="relative w-6 h-6">
              <input
                type="checkbox"
                checked={agreements.age}
                onChange={() => handleSingleCheck('age')}
                className="absolute opacity-0 w-6 h-6 cursor-pointer"
              />
              <div
                className={`w-6 h-6 border rounded transition-colors ${
                  agreements.age
                    ? 'bg-stone-700 border-stone-700'
                    : 'border-stone-300 group-hover:border-stone-400'
                }`}
              >
                {agreements.age && (
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
              <span className="text-base text-stone-700">만 18세 이상입니다</span>
              <span className="text-base text-stone-500">(필수)</span>
            </div>
          </label>

          {/* 서비스 이용약관 동의 */}
          <div className="flex gap-2 items-center group">
            <div className="relative w-6 h-6">
              <input
                type="checkbox"
                checked={agreements.terms1}
                onChange={() => handleSingleCheck('terms1')}
                className="absolute opacity-0 w-6 h-6 cursor-pointer"
              />
              <div
                className={`w-6 h-6 border rounded transition-colors cursor-pointer ${
                  agreements.terms1
                    ? 'bg-stone-700 border-stone-700'
                    : 'border-stone-300 group-hover:border-stone-400'
                }`}
              >
                {agreements.terms1 && (
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
              <button
                type="button"
                onClick={() => setIsTermsModalOpen(true)}
                className="text-base text-stone-700 underline hover:text-stone-900"
              >
                서비스 이용약관 동의
              </button>
              <span className="text-base text-stone-500">(필수)</span>
            </div>
          </div>

          {/* 개인정보 처리방침 동의 */}
          <div className="flex gap-2 items-center group">
            <div className="relative w-6 h-6">
              <input
                type="checkbox"
                checked={agreements.terms2}
                onChange={() => handleSingleCheck('terms2')}
                className="absolute opacity-0 w-6 h-6 cursor-pointer"
              />
              <div
                className={`w-6 h-6 border rounded transition-colors cursor-pointer ${
                  agreements.terms2
                    ? 'bg-stone-700 border-stone-700'
                    : 'border-stone-300 group-hover:border-stone-400'
                }`}
              >
                {agreements.terms2 && (
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
              <button
                type="button"
                onClick={() => setIsPrivacyModalOpen(true)}
                className="text-base text-stone-700 underline hover:text-stone-900"
              >
                개인정보 처리방침 동의
              </button>
              <span className="text-base text-stone-500">(필수)</span>
            </div>
          </div>
        </div>

        <button
          type="submit"
          onClick={handleSubmit}
          disabled={isLoading || !isRequiredTermsChecked()}
          className="mt-10 w-full h-11 px-8 inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium text-white bg-primary hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50"
        >
          {isLoading ? '처리중...' : '가입완료'}
        </button>
      </div>

      {/* 모달들 */}
      <TermsModal
        isOpen={isTermsModalOpen}
        onClose={() => setIsTermsModalOpen(false)}
        isSignUp={true}
        onAgree={(agreed) => {
          if (agreed) {
            setAgreements(prev => ({ ...prev, terms1: true }))
          }
          setIsTermsModalOpen(false)
        }}
      />

      <PrivacyPolicyModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
        isSignUp={true}
        onAgree={(agreed) => {
          if (agreed) {
            setAgreements(prev => ({ ...prev, terms2: true }))
          }
          setIsPrivacyModalOpen(false)
        }}
      />
    </div>
  )
} 