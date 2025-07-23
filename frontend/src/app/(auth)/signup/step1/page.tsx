'use client';

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
    const savedData = JSON.parse(
      sessionStorage.getItem('signupData') || '{}',
    )
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
        <div className="flex gap-1 w-20">
          <ProgressBarItem isActive={currentStep >= 1} />
          <ProgressBarItem isActive={currentStep >= 2} />
          <ProgressBarItem isActive={currentStep >= 3} />
        </div>
        <div className="w-10"></div>
      </div>

      <div className="flex flex-col px-5 w-full">
        <Image
          src="/images/logo/team-eliot-3.png"
          alt="Logo"
          width={220}
          height={49}
          className="object-contain max-w-full aspect-[4.48] w-[220px] mx-auto"
        />

        <h1 className="self-start mt-6 text-xl font-medium leading-tight text-stone-700">
          기본 정보를 입력해주세요
        </h1>

        <div className="flex flex-col mt-5 w-full gap-4">
          <InputField
            label="이름"
            value={formData.name}
            onChange={(value: string) => setFormData({ ...formData, name: value })}
            placeholder="이름을 입력하세요"
          />
          
          <InputField
            label="전화번호"
            value={formData.phoneNumber}
            onChange={(value: string) => setFormData({ ...formData, phoneNumber: value })}
            placeholder="전화번호를 입력하세요"
          />
        </div>

        <button
          onClick={handleNextStep}
          className="mt-6 w-full py-4 text-base font-semibold text-white bg-stone-700 rounded-lg hover:bg-stone-800 transition-colors"
        >
          다음
        </button>
      </div>
    </div>
  )
} 