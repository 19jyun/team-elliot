'use client'

import * as React from 'react'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { useApp } from '@/contexts/AppContext'

interface InputFieldProps {
  label: string
  id: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  required?: boolean
  error?: boolean
  errorMessage?: string
  type?: string
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  id,
  value,
  onChange,
  required = false,
  error = false,
  errorMessage,
  type = 'text',
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
            className="self-stretch my-auto w-[70px] text-[#595959] font-['Pretendard_Variable'] text-base font-medium leading-[140%] tracking-[-0.16px]"
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

export function SignupAcademyPage() {
  const { setSignupStep } = useApp()
  const [currentStep] = useState(4) // academy-info는 4단계
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    address: '',
    description: '',
  })
  const [errors, setErrors] = useState({
    name: '',
    phoneNumber: '',
    address: '',
    description: '',
  })
  const [usePersonalPhone, setUsePersonalPhone] = useState(false)
  const [personalPhoneNumber, setPersonalPhoneNumber] = useState('')

  useEffect(() => {
    const savedData = JSON.parse(sessionStorage.getItem('signupData') || '{}')
    if (savedData.academyInfo) {
      setFormData({
        name: savedData.academyInfo.name || '',
        phoneNumber: savedData.academyInfo.phoneNumber || '',
        address: savedData.academyInfo.address || '',
        description: savedData.academyInfo.description || '',
      })
    }
    
    // 개인 전화번호 가져오기
    if (savedData.phoneNumber) {
      setPersonalPhoneNumber(savedData.phoneNumber)
    }
  }, [])

  // 전화번호 포맷팅 함수
  const formatPhoneNumber = (input: string) => {
    const numbers = input.replace(/[^\d]/g, '');
    const limited = numbers.slice(0, 11);
    
    if (limited.length <= 3) {
      return limited;
    } else if (limited.length <= 7) {
      return `${limited.slice(0, 3)}-${limited.slice(3)}`;
    } else if (limited.length <= 10) {
      // 일반 전화번호: 02-1234-5678
      return `${limited.slice(0, 2)}-${limited.slice(2, 6)}-${limited.slice(6)}`;
    } else {
      // 휴대폰 번호: 010-1234-5678
      return `${limited.slice(0, 3)}-${limited.slice(3, 7)}-${limited.slice(7)}`;
    }
  };

  // 개인 전화번호 사용 체크박스 핸들러
  const handleUsePersonalPhone = (checked: boolean) => {
    setUsePersonalPhone(checked)
    if (checked && personalPhoneNumber) {
      setFormData({ ...formData, phoneNumber: personalPhoneNumber })
    }
  }

  // 전화번호 변경 시 동기화 체크
  useEffect(() => {
    if (usePersonalPhone && formData.phoneNumber !== personalPhoneNumber) {
      setUsePersonalPhone(false)
    }
  }, [formData.phoneNumber, personalPhoneNumber, usePersonalPhone])

  const handleNextStep = () => {
    // 유효성 검사
    let hasError = false
    const newErrors = {
      name: '',
      phoneNumber: '',
      address: '',
      description: '',
    }

    // 학원명 검증
    if (!formData.name.trim()) {
      newErrors.name = '학원명을 입력해주세요'
      hasError = true
    }

    // 전화번호 검증 (일반 전화번호와 휴대폰 번호 모두 허용)
    const formattedPhoneNumber = formatPhoneNumber(formData.phoneNumber);
    const phoneRegex = /^(0[0-9]-\d{4}-\d{4}|01[0-9]-\d{4}-\d{4})$/;
    
    
    if (!formData.phoneNumber) {
      newErrors.phoneNumber = '학원 전화번호를 입력해주세요'
      hasError = true
    } else if (!phoneRegex.test(formattedPhoneNumber)) {
      newErrors.phoneNumber = '올바른 전화번호 형식이 아닙니다 (예: 02-1234-5678 또는 010-1234-5678)'
      hasError = true
    }

    // 주소 검증
    if (!formData.address.trim()) {
      newErrors.address = '학원 주소를 입력해주세요'
      hasError = true
    }

    // 학원 소개 검증
    if (!formData.description.trim()) {
      newErrors.description = '학원 소개를 입력해주세요'
      hasError = true
    }

    setErrors(newErrors)

    if (hasError) {
      setTimeout(() => {
        setErrors({
          name: '',
          phoneNumber: '',
          address: '',
          description: '',
        })
      }, 3000)
      return
    }

    // 학원 정보를 세션에 저장 (전화번호는 포맷팅된 값으로 저장)
    const prevData = JSON.parse(sessionStorage.getItem('signupData') || '{}')
    sessionStorage.setItem(
      'signupData',
      JSON.stringify({
        ...prevData,
        academyInfo: {
          name: formData.name,
          phoneNumber: formattedPhoneNumber, // 위에서 이미 선언된 변수 사용
          address: formData.address,
          description: formData.description,
        },
      }),
    )
    
    setSignupStep('terms')
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
          {[1, 2, 3, 4, 5].map((step) => (
            <ProgressBarItem key={step} isActive={step <= currentStep} />
          ))}
        </div>
        <div className="flex gap-10 justify-between items-start mt-2 w-full text-sm font-medium text-stone-700">
          <div>회원가입까지 {5 - currentStep}단계 남았어요!</div>
          <div className="flex items-center whitespace-nowrap">
            <span>{currentStep}/5</span>
          </div>
        </div>
      </div>

      <div className="self-start mt-6 text-xl font-medium leading-tight text-stone-700">
        학원 정보를 입력해주세요
      </div>

      <div className="flex flex-col mt-16 w-full">
        <div className="flex flex-col w-full gap-6">
          <InputField
            label="학원명"
            id="name"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            required
            error={!!errors.name}
            errorMessage={errors.name}
          />

          <div className="flex flex-col gap-3">
            <InputField
              label="학원 전화번호"
              id="phoneNumber"
              type="tel"
              value={formatPhoneNumber(formData.phoneNumber)}
              onChange={(e) => {
                const onlyNumbers = e.target.value.replace(/[^0-9]/g, '')
                setFormData({ ...formData, phoneNumber: onlyNumbers })
              }}
              required
              error={!!errors.phoneNumber}
              errorMessage={errors.phoneNumber}
            />
            
            {/* 개인 전화번호와 동일 체크박스 */}
            <div className="flex items-center gap-2 ml-4">
              <input
                type="checkbox"
                id="usePersonalPhone"
                checked={usePersonalPhone}
                onChange={(e) => handleUsePersonalPhone(e.target.checked)}
                className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary focus:ring-2"
              />
              <label 
                htmlFor="usePersonalPhone" 
                className="text-sm text-gray-600 cursor-pointer"
              >
                나의 전화번호와 동일
              </label>
            </div>
          </div>

          <InputField
            label="학원 주소"
            id="address"
            value={formData.address}
            onChange={(e) =>
              setFormData({ ...formData, address: e.target.value })
            }
            required
            error={!!errors.address}
            errorMessage={errors.address}
          />

          <InputField
            label="학원 소개"
            id="description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            required
            error={!!errors.description}
            errorMessage={errors.description}
          />

          <div className="mt-2 text-sm font-medium text-stone-400">
            학원 정보는 추후 수정 가능합니다
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
    </div>
  )
}
