'use client'

import * as React from 'react'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { useApp } from '@/contexts/AppContext'

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
  const { navigation } = useApp()
  const { navigateToSubPage } = navigation
  const [currentStep] = useState(2)
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
  })
  const [, setVerificationSent] = useState(false)
  const [errors, setErrors] = useState({
    name: '',
    phoneNumber: '',
  })

  // 전화번호 인증 관련 상태
  const [isPhoneVerificationRequired, setIsPhoneVerificationRequired] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [timeLeft, setTimeLeft] = useState(180); // 3분 = 180초
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  useEffect(() => {
    const savedData = JSON.parse(sessionStorage.getItem('signupData') || '{}')
    if (savedData.name || savedData.phoneNumber) {
      setFormData({
        name: savedData.name || '',
        phoneNumber: savedData.phoneNumber || '',
      })
    }
  }, [])

  // 타이머 효과
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            setIsPhoneVerificationRequired(false);
            setIsPhoneVerified(false);
            setVerificationSent(false);
            return 180;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isTimerRunning, timeLeft]);

  // 전화번호 포맷팅 함수
  const formatPhoneNumber = (input: string) => {
    const numbers = input.replace(/[^\d]/g, '');
    const limited = numbers.slice(0, 11);
    
    if (limited.length <= 3) {
      return limited;
    } else if (limited.length <= 7) {
      return `${limited.slice(0, 3)}-${limited.slice(3)}`;
    } else {
      return `${limited.slice(0, 3)}-${limited.slice(3, 7)}-${limited.slice(7)}`;
    }
  };

  // 전화번호 변경 감지
  useEffect(() => {
    const cleanPhoneNumber = formData.phoneNumber.replace(/-/g, '');
    const phoneRegex = /^01[0|1|6|7|8|9][0-9]{8}$/;
    
    if (phoneRegex.test(cleanPhoneNumber)) {
      setIsPhoneVerificationRequired(true);
      setIsPhoneVerified(false);
      setTimeLeft(180);
      setIsTimerRunning(false);
    } else {
      setIsPhoneVerificationRequired(false);
      setIsPhoneVerified(false);
      setIsTimerRunning(false);
      setTimeLeft(180);
      setVerificationCode('');
      setVerificationSent(false);
    }
  }, [formData.phoneNumber]);

  const handleSendVerification = async () => {
    const cleanPhoneNumber = formData.phoneNumber.replace(/-/g, '')
    const phoneRegex = /^01[0|1|6|7|8|9][0-9]{8}$/

    if (!phoneRegex.test(cleanPhoneNumber)) {
      setErrors((prev) => ({
        ...prev,
        phoneNumber: '올바른 전화번호 형식이 아닙니다',
      }))
      return
    }
    // 인증 로직은 미구현 상태이므로 바로 인증 완료 처리
    toast.success('인증 로직은 미구현 상태입니다. 다음단계로 진행하세요.');
    setIsPhoneVerified(true);
    setIsTimerRunning(false);
    setVerificationSent(true);
  }

  const handleVerifyCode = async () => {
    // 인증 로직은 미구현 상태이므로 바로 인증 완료 처리
    toast.success('인증 로직은 미구현 상태입니다. 다음단계로 진행하세요.');
    setIsPhoneVerified(true);
    setIsTimerRunning(false);
    setVerificationCode('');
  }

  const handleClearVerificationCode = () => {
    setVerificationCode('');
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // 다음 버튼 활성화 조건 체크
  const isNextButtonEnabled = () => {
    // 이름이 없으면 비활성화
    if (!formData.name.trim()) {
      return false;
    }

    // 전화번호가 없으면 비활성화
    if (!formData.phoneNumber) {
      return false;
    }

    // 전화번호 형식 검증
    const cleanPhoneNumber = formData.phoneNumber.replace(/-/g, '');
    const phoneRegex = /^01[0|1|6|7|8|9][0-9]{8}$/;
    
    if (!phoneRegex.test(cleanPhoneNumber)) {
      return false;
    }

    // 인증이 필요한 경우 인증 완료 여부 확인
    if (isPhoneVerificationRequired && !isPhoneVerified) {
      return false;
    }

    return true;
  };

  const handleNextStep = () => {
    if (!formData.name) {
      toast.error('이름을 입력해주세요')
      return
    }

    if (!formData.phoneNumber) {
      toast.error('전화번호를 입력해주세요')
      return
    }

    // 전화번호 형식 검증
    const cleanPhoneNumber = formData.phoneNumber.replace(/-/g, '');
    const phoneRegex = /^01[0|1|6|7|8|9][0-9]{8}$/;
    
    if (!phoneRegex.test(cleanPhoneNumber)) {
      toast.error('올바른 전화번호 형식을 입력해주세요')
      return
    }

    if (isPhoneVerificationRequired && !isPhoneVerified) {
      toast.error('전화번호 인증을 완료해주세요.')
      return
    }

    // 세션 스토리지에서 기존 데이터 가져오기
    const existingData = JSON.parse(sessionStorage.getItem('signupData') || '{}')
    
    sessionStorage.setItem(
      'signupData',
      JSON.stringify({
        ...existingData,
        name: formData.name,
        phoneNumber: formatPhoneNumber(formData.phoneNumber), 
      }),
    )
    
    // 모든 역할은 동일하게 account-info 단계로 진행
    sessionStorage.setItem('currentSignupStep', 'account-info')
    navigateToSubPage('signup-account')
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
              value={formatPhoneNumber(formData.phoneNumber)}
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
              disabled={!isPhoneVerificationRequired || isTimerRunning}
              className={cn(
                "gap-2.5 self-stretch p-4 font-semibold text-white rounded-lg transition-colors",
                isPhoneVerificationRequired && !isTimerRunning
                  ? "bg-stone-400 hover:bg-stone-500"
                  : "bg-stone-300 cursor-not-allowed"
              )}
            >
              인증
            </button>
          </div>

          {/* 인증번호 입력 필드 */}
          {isPhoneVerificationRequired && isTimerRunning && !isPhoneVerified && (
            <div className="flex gap-2.5 items-start mt-3 w-full text-base">
              <div className="flex-1">
                <div className="flex justify-between items-center p-4 w-full bg-white rounded-lg border border-solid border-zinc-300">
                  <div className="flex gap-4 items-center self-stretch my-auto">
                    <label className="self-stretch my-auto w-[55px] text-[#595959] font-['Pretendard_Variable'] text-base font-medium leading-[140%] tracking-[-0.16px]">
                      인증번호
                    </label>
                    <div className="shrink-0 self-stretch my-auto w-0 h-6 border border-solid bg-[#D9D9D9] border-[#D9D9D9]" />
                  </div>
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="인증번호 6자리"
                    maxLength={6}
                    className="ml-4 w-full bg-transparent border-none outline-none text-[#595959] font-['Pretendard_Variable'] text-base font-medium leading-[140%] tracking-[-0.16px]"
                  />
                  <div className="flex items-center gap-2">
                    {verificationCode && (
                      <button
                        type="button"
                        onClick={handleClearVerificationCode}
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
                    <div className="text-sm font-mono" style={{ color: '#573B30', fontFamily: 'Pretendard Variable' }}>
                      {formatTime(timeLeft)}
                    </div>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleVerifyCode}
                disabled={verificationCode.length < 6}
                className={cn(
                  "gap-2.5 self-stretch p-4 font-semibold text-white rounded-lg transition-colors",
                  verificationCode.length === 6
                    ? "bg-stone-400 hover:bg-stone-500"
                    : "bg-stone-300 cursor-not-allowed"
                )}
              >
                확인
              </button>
            </div>
          )}

          {/* 인증완료 표시 */}
          {isPhoneVerified && (
            <div className="mt-3 flex items-center px-4 py-3 text-sm text-green-600 bg-green-50 rounded-lg">
              <span className="mr-2">✓</span>
              <span>전화번호 인증이 완료되었습니다.</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleNextStep}
            className={cn(
              'mt-6 w-full h-11 px-8 inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              isNextButtonEnabled()
                ? 'bg-primary text-white hover:bg-primary/90'
                : 'bg-stone-300 text-white cursor-not-allowed',
            )}
            disabled={!isNextButtonEnabled()}
          >
            다음으로
          </button>
        </div>
      </div>
    </div>
  )
} 