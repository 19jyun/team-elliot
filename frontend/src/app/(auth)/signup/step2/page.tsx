'use client';

import * as React from 'react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { InputField } from '@/components/auth/InputField'
import Image from 'next/image'

export default function SignupStep2Page() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(2)
  const [formData, setFormData] = useState({
    userId: '',
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState({
    userId: '',
    password: '',
    confirmPassword: '',
  })

  useEffect(() => {
    const savedData = JSON.parse(
      sessionStorage.getItem('signupData') || '{}',
    )
    if (savedData.userId || savedData.password) {
      setFormData({
        userId: savedData.userId || '',
        password: savedData.password || '',
        confirmPassword: savedData.confirmPassword || '',
      })
    }
  }, [])

  const validateForm = () => {
    const newErrors = {
      userId: '',
      password: '',
      confirmPassword: '',
    }

    if (!formData.userId) {
      newErrors.userId = '아이디를 입력해주세요'
    } else if (formData.userId.length < 4) {
      newErrors.userId = '아이디는 4자 이상이어야 합니다'
    }

    if (!formData.password) {
      newErrors.password = '비밀번호를 입력해주세요'
    } else if (formData.password.length < 6) {
      newErrors.password = '비밀번호는 6자 이상이어야 합니다'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호 확인을 입력해주세요'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다'
    }

    setErrors(newErrors)
    return !Object.values(newErrors).some(error => error)
  }

  const handleNextStep = () => {
    if (!validateForm()) {
      return
    }

    const savedData = JSON.parse(
      sessionStorage.getItem('signupData') || '{}',
    )
    sessionStorage.setItem(
      'signupData',
      JSON.stringify({
        ...savedData,
        userId: formData.userId,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      }),
    )
    router.push('/signup/step3')
  }

  const handleBack = () => {
    router.push('/signup/step1')
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
          계정 정보를 입력해주세요
        </h1>

        <div className="flex flex-col mt-5 w-full gap-4">
          <InputField
            label="아이디"
            value={formData.userId}
            onChange={(value: string) => setFormData({ ...formData, userId: value })}
            placeholder="아이디를 입력하세요"
            error={errors.userId}
          />
          
          <InputField
            label="비밀번호"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={(value: string) => setFormData({ ...formData, password: value })}
            placeholder="비밀번호를 입력하세요"
            error={errors.password}
          />
          
          <InputField
            label="비밀번호 확인"
            type={showConfirmPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={(value: string) => setFormData({ ...formData, confirmPassword: value })}
            placeholder="비밀번호를 다시 입력하세요"
            error={errors.confirmPassword}
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