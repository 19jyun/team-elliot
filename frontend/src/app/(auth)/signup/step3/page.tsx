'use client';

import * as React from 'react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { InputField } from '@/components/auth/InputField'
import Image from 'next/image'

export default function SignupStep3Page() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(3)
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    userId: '',
    password: '',
    confirmPassword: '',
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const savedData = JSON.parse(
      sessionStorage.getItem('signupData') || '{}',
    )
    setFormData({
      name: savedData.name || '',
      phoneNumber: savedData.phoneNumber || '',
      userId: savedData.userId || '',
      password: savedData.password || '',
      confirmPassword: savedData.confirmPassword || '',
    })
  }, [])

  const handleSubmit = async () => {
    if (!formData.name || !formData.phoneNumber || !formData.userId || !formData.password) {
      toast.error('모든 필수 정보를 입력해주세요')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('비밀번호가 일치하지 않습니다')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          phoneNumber: formData.phoneNumber,
          userId: formData.userId,
          password: formData.password,
          role: 'STUDENT', // 기본값
        }),
      })

      if (response.ok) {
        toast.success('회원가입이 완료되었습니다')
        sessionStorage.removeItem('signupData')
        router.push('/login')
      } else {
        const error = await response.json()
        toast.error(error.message || '회원가입에 실패했습니다')
      }
    } catch (error) {
      toast.error('회원가입 중 오류가 발생했습니다')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    router.push('/signup/step2')
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
          입력한 정보를 확인해주세요
        </h1>

        <div className="flex flex-col mt-5 w-full gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-2">이름</div>
            <div className="text-base font-medium">{formData.name}</div>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-2">전화번호</div>
            <div className="text-base font-medium">{formData.phoneNumber}</div>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-2">아이디</div>
            <div className="text-base font-medium">{formData.userId}</div>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="mt-6 w-full py-4 text-base font-semibold text-white bg-stone-700 rounded-lg hover:bg-stone-800 transition-colors disabled:bg-gray-400"
        >
          {isLoading ? '가입 중...' : '회원가입 완료'}
        </button>
      </div>
    </div>
  )
} 