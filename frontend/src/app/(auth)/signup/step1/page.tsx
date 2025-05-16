'use client'

import * as React from 'react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Box } from '@mui/material'
import { InputField } from '@/components/auth/InputField'
import Image from 'next/image'

export default function SignupPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [verificationSent, setVerificationSent] = useState(false)
  const [errors, setErrors] = useState({
    name: '',
    phoneNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  useEffect(() => {
    const savedData = JSON.parse(sessionStorage.getItem('signupData') || '{}')
    if (savedData.name || savedData.phoneNumber) {
      setFormData({
        name: savedData.name || '',
        phoneNumber: savedData.phoneNumber || '',
      })
    }
  }, [])

  const handleSendVerification = async () => {
    const cleanPhoneNumber = formData.phoneNumber.replace(/-/g, '')
    const phoneRegex = /^01[0|1|6|7|8|9][0-9]{7,8}$/

    if (!phoneRegex.test(cleanPhoneNumber)) {
      setErrors((prev) => ({
        ...prev,
        phoneNumber: '올바른 전화번호 형식이 아닙니다',
      }))
      return
    }

    toast.info('현재 SMS 인증을 지원하지 않습니다. 다음 단계로 진행해 주세요.')
    setVerificationSent(true)
  }

  const handleNextStep = () => {
    if (!formData.name || !formData.phoneNumber) {
      toast.error('이름과 전화번호를 입력해주세요')
      return
    }
    sessionStorage.setItem(
      'signupData',
      JSON.stringify({
        name: formData.name,
        phoneNumber: formData.phoneNumber,
      }),
    )
    router.push('/signup/step2')
  }

  const handleBack = () => {
    router.push('/login')
  }

  const ProgressBarItem = ({ isActive }: { isActive: boolean }) => (
    <div
      className={cn(
        'flex-1 h-1 rounded-full',
        isActive ? 'bg-stone-700' : 'bg-stone-200',
      )}
    />
  )

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

      <form
        className="flex flex-col px-5 mt-8 w-full"
        onSubmit={(e) => e.preventDefault()}
      >
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
            {[1, 2, 3].map((step) => (
              <ProgressBarItem key={step} isActive={step === currentStep} />
            ))}
          </div>
          <div className="flex gap-10 justify-between items-start mt-2 w-full text-sm font-medium text-stone-700">
            <div>회원가입까지 {4 - currentStep}단계 남았어요!</div>
            <div className="flex items-center whitespace-nowrap">
              <span>{currentStep}/3</span>
            </div>
          </div>
        </div>

        <div className="self-start mt-6 text-xl font-medium leading-tight text-stone-700">
          이름과 전화번호를 입력해주세요
        </div>

        <div className="flex flex-col mt-16 w-full whitespace-nowrap">
          <div className="flex flex-col w-full">
            <InputField
              label="이름"
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              error={!!errors.name}
              errorMessage={errors.name}
            />

            <div className="flex gap-2.5 items-start mt-3 w-full text-base">
              <InputField
                label="전화번호"
                id="phoneNumber"
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => {
                  const onlyNumbers = e.target.value.replace(/[^0-9]/g, '')
                  setFormData({ ...formData, phoneNumber: onlyNumbers })
                }}
                required
                error={!!errors.phoneNumber}
                errorMessage={errors.phoneNumber}
              />
              <button
                type="button"
                onClick={handleSendVerification}
                className="gap-2.5 self-stretch p-4 font-semibold text-white rounded-lg bg-stone-400 hover:bg-stone-500"
              >
                인증
              </button>
            </div>

            <button
              type="button"
              onClick={handleNextStep}
              className={cn(
                'mt-6 w-full h-11 px-8 inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                verificationSent
                  ? 'bg-primary text-white hover:bg-primary/90'
                  : 'bg-stone-300 text-white cursor-not-allowed',
              )}
              disabled={!verificationSent}
            >
              다음으로
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
