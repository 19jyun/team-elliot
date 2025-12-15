'use client'

import * as React from 'react'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ensureTrailingSlash } from '@/lib/utils/router'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { academyInfoSchema, AcademyInfoSchemaType } from '@/lib/schemas/auth-signup'
import { useApp } from '@/contexts/AppContext'

interface InputFieldProps {
  label: string
  id: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onBlur?: () => void
  required?: boolean
  error?: boolean
  errorMessage?: string
  type?: string
}

const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(
  (
    {
      label,
      id,
      value,
      onChange,
      onBlur,
      required = false,
      error = false,
      errorMessage,
      type = 'text',
    },
    ref,
  ) => {
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
            ref={ref}
            type={type}
            id={id}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
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
  },
)

InputField.displayName = 'InputField'

const ProgressBarItem = ({ isActive }: { isActive: boolean }) => (
  <div
    className={cn(
      'flex-1 h-1 rounded-full',
      isActive ? 'bg-stone-700' : 'bg-stone-200',
    )}
  />
)

export function SignupAcademyPage() {
  const router = useRouter()
  const { form, setAcademyInfo } = useApp()
  const [currentStep] = useState(4) // academy-info는 4단계
  const [usePersonalPhone, setUsePersonalPhone] = useState(false)

  // 개인 전화번호 가져오기
  const personalPhoneNumber = form.auth.signup.personalInfo.phoneNumber

  // RHF 설정 - Context에서 초기값 가져오기
  const {
    control,
    handleSubmit,
    watch,
    setValue,
  } = useForm<AcademyInfoSchemaType>({
    resolver: zodResolver(academyInfoSchema),
    defaultValues: {
      name: form.auth.signup.academyInfo?.name || '',
      phoneNumber: form.auth.signup.academyInfo?.phoneNumber || '',
      address: form.auth.signup.academyInfo?.address || '',
      description: form.auth.signup.academyInfo?.description || '',
    },
    mode: 'onBlur',
  })

  const phoneNumber = watch('phoneNumber')

  // 전화번호 포맷팅 함수
  const formatPhoneNumber = (input: string) => {
    const numbers = input.replace(/[^\d]/g, '')
    const limited = numbers.slice(0, 11)

    if (limited.length <= 2) {
      return limited
    } else if (limited.length <= 6) {
      return `${limited.slice(0, 2)}-${limited.slice(2)}`
    } else if (limited.length <= 10) {
      // 일반 전화번호: 02-1234-5678 (2-4-4 형태)
      return `${limited.slice(0, 2)}-${limited.slice(2, 6)}-${limited.slice(6)}`
    } else {
      // 휴대폰 번호: 010-1234-5678 (3-4-4 형태)
      return `${limited.slice(0, 3)}-${limited.slice(3, 7)}-${limited.slice(7)}`
    }
  }

  // 개인 전화번호 사용 체크박스 핸들러
  const handleUsePersonalPhone = (checked: boolean) => {
    setUsePersonalPhone(checked)
    if (checked && personalPhoneNumber) {
      setValue('phoneNumber', personalPhoneNumber, { shouldValidate: true })
    }
  }

  // 전화번호 변경 시 동기화 체크
  useEffect(() => {
    if (usePersonalPhone && phoneNumber !== personalPhoneNumber) {
      setUsePersonalPhone(false)
    }
  }, [phoneNumber, personalPhoneNumber, usePersonalPhone])

  // 제출 핸들러: Context 업데이트 -> 페이지 이동
  const onSubmit = (data: AcademyInfoSchemaType) => {
    // Context에 학원 정보 저장 (전화번호는 이미 포맷팅된 값)
    setAcademyInfo({
      name: data.name,
      phoneNumber: data.phoneNumber,
      address: data.address,
      description: data.description,
    })
    
    router.push(ensureTrailingSlash('/signup/roles/personal/account/academy/terms'))
  }

  return (
    <div className="flex flex-col w-full h-full">
      {/* Header - 고정 높이 (Logo, Progress Bar, 안내문구) */}
      <header className="flex-shrink-0 flex flex-col px-5 py-4 border-b border-gray-200 w-full">
        <Image
          src="/images/logo/team-eliot-1.png"
          alt="Team Eliot Logo"
          width={220}
          height={49}
          priority
          className="object-contain max-w-full w-[220px]"
        />

        <div className="flex flex-col self-center mt-4 w-full">
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

        <div className="self-start mt-4 text-xl font-medium leading-tight text-stone-700">
          학원 정보를 입력해주세요
        </div>
      </header>

      {/* Main Content - 고정 높이 + 스크롤 */}
      <main className="flex-shrink-0 overflow-y-auto px-5" style={{ height: 'calc(100vh - 320px)' }}>
        <form
          id="signup-academy-form"
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col mt-4 w-full pb-4"
        >
        <div className="flex flex-col w-full gap-6">
          <Controller
            control={control}
            name="name"
            render={({ field, fieldState: { error } }) => (
              <InputField
                {...field}
                label="학원명"
                id="name"
                required
                error={!!error}
                errorMessage={error?.message}
              />
            )}
          />

          <div className="flex flex-col gap-3">
            <Controller
              control={control}
              name="phoneNumber"
              render={({ field, fieldState: { error } }) => {
                // 전화번호 포맷팅 처리
                const handlePhoneChange = (
                  e: React.ChangeEvent<HTMLInputElement>,
                ) => {
                  const onlyNumbers = e.target.value.replace(/[^0-9]/g, '')
                  // 필드는 하이픈이 포함된 포맷값을 저장해 Zod 정규식과 일치시킨다.
                  const formatted = formatPhoneNumber(onlyNumbers)
                  field.onChange({
                    ...e,
                    target: { ...e.target, value: formatted },
                  })
                }

                return (
                  <InputField
                    {...field}
                    label="학원 전화번호"
                    id="phoneNumber"
                    type="tel"
                    value={formatPhoneNumber(field.value)}
                    onChange={handlePhoneChange}
                    required
                    error={!!error}
                    errorMessage={error?.message}
                  />
                )
              }}
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

          <Controller
            control={control}
            name="address"
            render={({ field, fieldState: { error } }) => (
              <InputField
                {...field}
                label="학원 주소"
                id="address"
                required
                error={!!error}
                errorMessage={error?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="description"
            render={({ field, fieldState: { error } }) => (
              <InputField
                {...field}
                label="학원 소개"
                id="description"
                required
                error={!!error}
                errorMessage={error?.message}
              />
            )}
          />

          <div className="mt-2 text-sm font-medium text-stone-400">
            학원 정보는 추후 수정 가능합니다
          </div>
        </div>
        </form>
      </main>

      {/* Footer - 고정 높이 (다음으로 버튼) */}
      <footer className="flex-shrink-0 border-t border-gray-200 px-5 py-4 w-full">
        <button
          type="submit"
          form="signup-academy-form"
          className="w-full h-11 px-8 inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium text-white bg-primary hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          다음으로
        </button>
      </footer>
    </div>
  )
}
