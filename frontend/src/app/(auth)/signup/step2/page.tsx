'use client'

import * as React from 'react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { InputField } from '@/components/auth/InputField'
import axios from 'axios'

export default function SignupStep2Page() {
  const router = useRouter()
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

  // 아이디 중복 체크 함수 추가
  const checkDuplicateUserId = async (userId: string) => {
    try {
      const response = await axios.post('/api/auth/check-userid', {
        userId,
      })
      return response.data.available
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return false
      }
      return false
    }
  }

  const handleBack = () => {
    // 현재 step2의 데이터도 세션에 저장
    const prevData = JSON.parse(sessionStorage.getItem('signupData') || '{}')
    sessionStorage.setItem(
      'signupData',
      JSON.stringify({
        ...prevData,
        userId: formData.userId,
        password: formData.password,
      }),
    )
    router.push('/signup/step1')
  }

  const handleNextStep = async () => {
    // 유효성 검사
    let hasError = false
    const newErrors = {
      userId: '',
      password: '',
      confirmPassword: '',
    }

    // 아이디 검증
    if (formData.userId.length < 8 || formData.userId.length > 15) {
      newErrors.userId = '아이디는 8~15자로 입력해주세요'
      hasError = true
    } else {
      // 아이디 중복 체크
      const isAvailable = await checkDuplicateUserId(formData.userId)
      if (!isAvailable) {
        newErrors.userId = '이미 사용중인 아이디입니다'
        hasError = true
      }
    }

    // 비밀번호 검증
    if (formData.password.length < 8) {
      newErrors.password = '비밀번호는 8자 이상이어야 합니다'
      hasError = true
    }

    // 비밀번호 확인 검증
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다'
      hasError = true
    }

    setErrors(newErrors)

    if (!hasError) {
      // step2 데이터도 세션에 저장
      const prevData = JSON.parse(sessionStorage.getItem('signupData') || '{}')
      sessionStorage.setItem(
        'signupData',
        JSON.stringify({
          ...prevData,
          userId: formData.userId,
          password: formData.password,
        }),
      )
      router.push('/signup/step3')
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
      </div>

      <form className="flex flex-col px-5 mt-8 w-full">
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
                  step <= 2 ? 'bg-stone-700' : 'bg-stone-200',
                )}
              />
            ))}
          </div>
          <div className="flex gap-10 justify-between items-start mt-2 w-full text-sm font-medium text-stone-700">
            <div>회원가입까지 1단계 남았어요!</div>
            <div className="flex items-center whitespace-nowrap">
              <span>2/3</span>
            </div>
          </div>
        </div>

        <div className="self-start mt-6 text-xl font-medium leading-tight text-stone-700">
          아이디와 비밀번호를 입력해주세요
        </div>

        <div className="flex flex-col mt-16 w-full">
          <div className="flex flex-col w-full gap-3">
            <InputField
              label="아이디"
              id="userId"
              value={formData.userId}
              onChange={(e) =>
                setFormData({ ...formData, userId: e.target.value })
              }
              required
              error={!!errors.userId}
              errorMessage={errors.userId}
            />

            <InputField
              label="비밀번호"
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
              error={!!errors.password}
              errorMessage={errors.password}
              icon="password-toggle"
              onIconClick={() => setShowPassword(!showPassword)}
              showPassword={showPassword}
              onClear={
                formData.password
                  ? (e) => {
                      e.preventDefault()
                      setFormData({ ...formData, password: '' })
                    }
                  : undefined
              }
            />

            <InputField
              label="비밀번호 확인"
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
              required
              error={!!errors.confirmPassword}
              errorMessage={errors.confirmPassword}
              icon="password-toggle"
              onIconClick={() => setShowConfirmPassword(!showConfirmPassword)}
              showPassword={showConfirmPassword}
              onClear={
                formData.confirmPassword
                  ? (e) => {
                      e.preventDefault()
                      setFormData({ ...formData, confirmPassword: '' })
                    }
                  : undefined
              }
            />

            <div className="mt-2 text-sm font-medium text-stone-400">
              아이디는 영문, 숫자 8~15자로 설정해주세요
            </div>
          </div>

          <button
            type="button"
            onClick={handleNextStep}
            className="mt-6 w-full h-11 px-8 inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium text-white bg-primary hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            다음으로
          </button>
        </div>
      </form>
    </div>
  )
}
