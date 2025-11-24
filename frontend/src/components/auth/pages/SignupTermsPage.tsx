'use client'

import * as React from 'react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useSignup, useSignupPrincipal } from '@/hooks/mutations/auth/useSignup'
import Image from 'next/image'
import { TermsModal } from '@/components/common/TermsModal'
import { PrivacyPolicyModal } from '@/components/common/PrivacyPolicyModal'
import { toast } from 'sonner'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { termsSchema, TermsSchemaType } from '@/lib/schemas/auth-signup'
import { useApp } from '@/contexts/AppContext'
import { useRouter } from 'next/navigation'
import { ensureTrailingSlash } from '@/lib/utils/router'

const ProgressBarItem = ({ isActive }: { isActive: boolean }) => (
  <div
    className={cn(
      'flex-1 h-1 rounded-full',
      isActive ? 'bg-stone-700' : 'bg-stone-200',
    )}
  />
)

export function SignupTermsPage() {
  const { form, setTerms } = useApp()
  const [currentStep] = useState(4)
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false)
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false)

  // React Query 기반 mutation hooks
  const signupMutation = useSignup()
  const signupPrincipalMutation = useSignupPrincipal()
  const router = useRouter()

  const isLoading = signupMutation.isPending || signupPrincipalMutation.isPending

  // RHF 설정 - Context에서 초기값 가져오기
  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<TermsSchemaType>({
    resolver: zodResolver(termsSchema),
    defaultValues: {
      age: form.auth.signup.terms.age,
      terms1: form.auth.signup.terms.terms1,
      terms2: form.auth.signup.terms.terms2,
      marketing: form.auth.signup.terms.marketing || false,
    },
    mode: 'onChange',
  })

  const watchedValues = watch()
  const allChecked =
    watchedValues.age && watchedValues.terms1 && watchedValues.terms2

  const handleAllCheck = () => {
    const newValue = !allChecked
    setValue('age', newValue, { shouldValidate: true })
    setValue('terms1', newValue, { shouldValidate: true })
    setValue('terms2', newValue, { shouldValidate: true })
  }

  const handleSingleCheck = (
    key: 'age' | 'terms1' | 'terms2',
    currentValue: boolean,
  ) => {
    setValue(key, !currentValue, { shouldValidate: true })
  }

  // 제출 핸들러: 약관 저장 -> 회원가입 API 호출
  const onSubmit = async (data: TermsSchemaType) => {
    // Context에 약관 데이터 저장
    setTerms({
      age: data.age,
      terms1: data.terms1,
      terms2: data.terms2,
      marketing: data.marketing || false,
    })

    const signupData = form.auth.signup

    try {
      // Principal인 경우 별도 mutation 사용
      if (signupData.role === 'PRINCIPAL') {
        if (!signupData.academyInfo) {
          toast.error('학원 정보가 없습니다. 다시 시도해주세요.')
          return
        }

        await signupPrincipalMutation.mutateAsync({
          name: signupData.personalInfo.name,
          userId: signupData.accountInfo.userId,
          password: signupData.accountInfo.password,
          phoneNumber: signupData.personalInfo.phoneNumber,
          role: 'PRINCIPAL',
          academyInfo: signupData.academyInfo,
        })
      } else {
        // Student, Teacher는 일반 signup mutation 사용
        await signupMutation.mutateAsync({
          name: signupData.personalInfo.name,
          userId: signupData.accountInfo.userId,
          password: signupData.accountInfo.password,
          phoneNumber: signupData.personalInfo.phoneNumber,
          role: signupData.role!,
        })
      }

      // 성공 시 Context 데이터 초기화 및 리디렉션
      router.push(ensureTrailingSlash('/'))
    } catch (error) {
      // 에러는 mutation hook에서 처리됨
      console.error('회원가입 오류:', error)
    }
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

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col mt-5 w-full">
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
                className={cn(
                  'w-6 h-6 border rounded',
                  allChecked
                    ? 'bg-stone-700 border-stone-700'
                    : 'border-stone-300',
                )}
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
          <Controller
            control={control}
            name="age"
            render={({ field }) => (
              <label className="flex gap-2 items-center group cursor-pointer">
                <div className="relative w-6 h-6">
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={(e) => {
                      field.onChange(e.target.checked)
                      handleSingleCheck('age', field.value)
                    }}
                    className="absolute opacity-0 w-6 h-6 cursor-pointer"
                  />
                  <div
                    className={cn(
                      'w-6 h-6 border rounded transition-colors',
                      field.value
                        ? 'bg-stone-700 border-stone-700'
                        : 'border-stone-300 group-hover:border-stone-400',
                    )}
                  >
                    {field.value && (
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
                  <span className="text-base text-stone-700">
                    만 18세 이상입니다
                  </span>
                  <span className="text-base text-stone-500">(필수)</span>
                </div>
              </label>
            )}
          />

          {/* 서비스 이용약관 동의 */}
          <Controller
            control={control}
            name="terms1"
            render={({ field }) => (
              <div className="flex gap-2 items-center group">
                <div className="relative w-6 h-6">
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={(e) => {
                      field.onChange(e.target.checked)
                      handleSingleCheck('terms1', field.value)
                    }}
                    className="absolute opacity-0 w-6 h-6 cursor-pointer"
                  />
                  <div
                    className={cn(
                      'w-6 h-6 border rounded transition-colors cursor-pointer',
                      field.value
                        ? 'bg-stone-700 border-stone-700'
                        : 'border-stone-300 group-hover:border-stone-400',
                    )}
                  >
                    {field.value && (
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
            )}
          />

          {/* 개인정보 처리방침 동의 */}
          <Controller
            control={control}
            name="terms2"
            render={({ field }) => (
              <div className="flex gap-2 items-center group">
                <div className="relative w-6 h-6">
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={(e) => {
                      field.onChange(e.target.checked)
                      handleSingleCheck('terms2', field.value)
                    }}
                    className="absolute opacity-0 w-6 h-6 cursor-pointer"
                  />
                  <div
                    className={cn(
                      'w-6 h-6 border rounded transition-colors cursor-pointer',
                      field.value
                        ? 'bg-stone-700 border-stone-700'
                        : 'border-stone-300 group-hover:border-stone-400',
                    )}
                  >
                    {field.value && (
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
            )}
          />
        </div>

        {Object.keys(errors).length > 0 && (
          <div className="mt-4 text-sm text-red-500">
            {errors.age?.message || errors.terms1?.message || errors.terms2?.message}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !allChecked}
          className="mt-10 w-full h-11 px-8 inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium text-white bg-primary hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50"
        >
          {isLoading ? '처리중...' : '가입완료'}
        </button>
      </form>

      {/* 모달들 */}
      <TermsModal
        isOpen={isTermsModalOpen}
        onClose={() => setIsTermsModalOpen(false)}
        isSignUp={true}
        onAgree={(agreed) => {
          if (agreed) {
            setValue('terms1', true)
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
            setValue('terms2', true)
          }
          setIsPrivacyModalOpen(false)
        }}
      />
    </div>
  )
} 