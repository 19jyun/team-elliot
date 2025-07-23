'use client'

import * as React from 'react'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Box } from '@mui/material'
import Image from 'next/image'
import { useAuth } from '@/contexts/AuthContext'

interface InputFieldProps {
  label: string
  icon?: string
  type?: string
  id: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  required?: boolean
  onIconClick?: () => void
  showPassword?: boolean
  error?: boolean
  errorMessage?: string
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  icon,
  type = 'text',
  id,
  value,
  onChange,
  required = false,
  onIconClick,
  showPassword,
  error = false,
  errorMessage,
}) => {
  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault()
    const event = {
      target: { value: '' },
    } as React.ChangeEvent<HTMLInputElement>
    onChange(event)
  }

  return (
    <div className="relative">
      {errorMessage && (
        <div className="absolute -top-5 right-0 text-sm text-red-500">
          {errorMessage}
        </div>
      )}
      <div
        className={cn(
          'flex justify-between items-center p-4 w-full bg-white rounded-lg border border-solid',
          error ? 'border-red-500' : 'border-zinc-300',
        )}
      >
        <div className="flex gap-4 items-center self-stretch my-auto">
          <label
            htmlFor={id}
            className="self-stretch my-auto w-[55px] text-[#595959] font-['Pretendard_Variable'] text-base font-medium leading-[140%] tracking-[-0.16px]"
          >
            {label}
          </label>
          <div
            className={cn(
              'shrink-0 self-stretch my-auto w-0 h-6 border border-solid',
              error
                ? 'bg-red-500 border-red-500'
                : 'bg-[#D9D9D9] border-[#D9D9D9]',
            )}
          />
        </div>
        <input
          type={type}
          id={id}
          value={value}
          onChange={onChange}
          required={required}
          className="ml-4 w-full bg-transparent border-none outline-none text-[#595959] font-['Pretendard_Variable'] text-base font-medium leading-[140%] tracking-[-0.16px]"
          aria-label={label}
        />
        <div className="flex items-center gap-2">
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            </button>
          )}
          {icon && onIconClick && (
            <button
              type="button"
              onClick={onIconClick}
              className="p-1 text-[#595959]"
            >
              {showPassword ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                  <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                  <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                  <line x1="2" y1="2" x2="22" y2="22" />
                </svg>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

const ProgressBarItem = ({ isActive }: { isActive: boolean }) => (
  <div
    className={cn(
      'flex-1 h-1 rounded-full',
      isActive ? 'bg-stone-700' : 'bg-stone-200',
    )}
  />
)

export function SignupPersonalPage() {
  const { navigateToAuthSubPage } = useAuth()
  const [currentStep] = useState(2)
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [verificationSent, setVerificationSent] = useState(false)
  const [errors, setErrors] = useState({
    name: '',
    phoneNumber: '',
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
    navigateToAuthSubPage('signup-account')
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
          <div>회원가입까지 {4 - currentStep}단계 남았어요!</div>
          <div className="flex items-center whitespace-nowrap">
            <span>{currentStep}/4</span>
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
    </div>
  )
} 