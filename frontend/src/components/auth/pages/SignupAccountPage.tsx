'use client'

import * as React from 'react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useCheckDuplicateUserId } from '@/hooks/useCheckDuplicateUserId'
import { ensureTrailingSlash } from '@/lib/utils/router'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { accountInfoSchema, AccountInfoSchemaType } from '@/lib/schemas/auth-signup'
import { useApp } from '@/contexts/AppContext'

interface InputFieldProps {
  label: string
  icon?: string
  type?: string
  id: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onBlur?: () => void
  required?: boolean
  onIconClick?: () => void
  showPassword?: boolean
  error?: boolean
  errorMessage?: string
}

const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(
  (
    {
      label,
      icon,
      type = 'text',
      id,
      value,
      onChange,
      onBlur,
      required = false,
      onIconClick,
      showPassword,
      error = false,
      errorMessage,
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

export function SignupAccountPage() {
  const router = useRouter()
  const { form, setAccountInfo } = useApp()
  const [currentStep] = useState(3)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const { check: checkDuplicateUserId } = useCheckDuplicateUserId()

  // RHF 설정 - Context에서 초기값 가져오기
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    setError,
  } = useForm<AccountInfoSchemaType>({
    resolver: zodResolver(accountInfoSchema),
    defaultValues: {
      userId: form.auth.signup.accountInfo.userId,
      password: form.auth.signup.accountInfo.password,
      confirmPassword: form.auth.signup.accountInfo.confirmPassword,
    },
    mode: 'onBlur',
  })

  // 제출 핸들러: 아이디 중복 체크 -> Context 업데이트 -> 페이지 이동
  const onSubmit = async (data: AccountInfoSchemaType) => {
    // 아이디 중복 체크 (async validation)
    const isAvailable = await checkDuplicateUserId(data.userId)
    if (!isAvailable) {
      setError('userId', {
        type: 'manual',
        message: '이미 사용중인 아이디입니다',
      })
      return
    }

    // Context에 데이터 저장
    setAccountInfo({
      userId: data.userId,
      password: data.password,
      confirmPassword: data.confirmPassword,
    })

    // 역할에 따라 다음 페이지 결정
    const nextPath =
      form.auth.signup.role === 'PRINCIPAL'
        ? '/signup/roles/personal/account/academy'
        : '/signup/roles/personal/account/terms'

    router.push(ensureTrailingSlash(nextPath))
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
        아이디와 비밀번호를 입력해주세요
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col mt-16 w-full"
      >
        <div className="flex flex-col w-full gap-6">
          <Controller
            control={control}
            name="userId"
            render={({ field, fieldState: { error } }) => (
              <InputField
                {...field}
                label="아이디"
                id="userId"
                required
                error={!!error}
                errorMessage={error?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field, fieldState: { error } }) => (
              <InputField
                {...field}
                label="비밀번호"
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                error={!!error}
                errorMessage={error?.message}
                icon="password-toggle"
                onIconClick={() => setShowPassword(!showPassword)}
                showPassword={showPassword}
              />
            )}
          />

          <Controller
            control={control}
            name="confirmPassword"
            render={({ field, fieldState: { error } }) => (
              <InputField
                {...field}
                label="비밀번호 확인"
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                required
                error={!!error}
                errorMessage={error?.message}
                icon="password-toggle"
                onIconClick={() => setShowConfirmPassword(!showConfirmPassword)}
                showPassword={showConfirmPassword}
              />
            )}
          />

          <div className="mt-2 text-sm font-medium text-stone-400">
            아이디는 영문, 숫자 8~15자로 설정해주세요
          </div>
        </div>

        <button
          type="submit"
          className="mt-6 w-full h-11 px-8 inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium text-white bg-primary hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          다음으로
        </button>
      </form>
    </div>
  )
} 