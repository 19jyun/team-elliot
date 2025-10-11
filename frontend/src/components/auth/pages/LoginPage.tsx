'use client'

import * as React from 'react'
import { useState } from 'react'
import { useSignIn } from '@/lib/auth/AuthProvider'
import { AuthRouter } from '@/lib/auth/AuthRouter'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { cva } from 'class-variance-authority'
import { Box, Button, Typography } from '@mui/material'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import Image from 'next/image'
import { useApp } from '@/contexts/AppContext'
import { useApiError } from '@/hooks/useApiError'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline:
          'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

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

  // 비밀번호 라벨의 경우 더 넓은 공간 할당
  const labelWidth = label === '비밀번호' ? 'w-[70px]' : 'w-[55px]'

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
            className={cn(
              'self-stretch my-auto text-[#595959] font-["Pretendard_Variable"] text-base font-medium leading-[140%] tracking-[-0.16px]',
              labelWidth
            )}
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
                <Visibility sx={{ width: 24, height: 24 }} />
              ) : (
                <VisibilityOff sx={{ width: 24, height: 24 }} />
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export function LoginPage() {
  const { setAuthMode, setSignupStep } = useApp()
  const signIn = useSignIn()
  const [formData, setFormData] = useState({
    userId: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { fieldErrors, clearErrors, handleApiError } = useApiError()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearErrors() // 로딩 상태 설정을 제거하고 에러만 클리어

    try {
      const result = await signIn('credentials', {
        userId: formData.userId,
        password: formData.password,
      })

      if (result?.error) {
        handleApiError({
          type: 'AUTHENTICATION',
          code: 'INVALID_CREDENTIALS',
          message: '아이디 또는 비밀번호가 올바르지 않습니다.',
          field: 'credentials',
          recoverable: true
        })
        return
      }

      if (result?.ok) {
        setIsLoading(true)
        toast.success('로그인되었습니다.')
        
        // AuthRouter를 통한 SPA 리디렉션
        setTimeout(() => {
          AuthRouter.redirectToDashboard()
        }, 100) // 세션 상태 업데이트를 위한 짧은 지연
      }
    } catch (error) {
      console.error('로그인 오류:', error)
      handleApiError(error)
    }
    // finally 블록 제거 - 로딩 상태는 성공 시에만 관리
  }

  return (
    <div className="flex overflow-hidden flex-col mx-auto w-full bg-white max-w-[480px] h-full">
      <main className="flex flex-col px-5 mt-24 w-full flex-1 overflow-hidden">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            maxWidth: '100%',
            width: '220px',
          }}
        >
          <Image
            src="/images/logo/team-eliot-1.png"
            alt="Team Eliot Logo"
            width={220}
            height={49}
            priority
            className="w-full object-contain"
          />
          <Typography
            sx={{
              mt: '28px',
              color: '#573b2f',
              fontSize: '24px',
              fontFamily: '"Pretendard Variable"',
              fontWeight: 500,
              lineHeight: '140%',
            }}
          >
            안녕하세요.
            <br />팀 엘리엇입니다.
          </Typography>
        </Box>

        <form className="flex flex-col mt-16 w-full" onSubmit={handleSubmit}>
          <div className="flex flex-col w-full gap-3">
            <InputField
              label="아이디"
              id="userId"
              value={formData.userId}
              onChange={(e) =>
                setFormData({ ...formData, userId: e.target.value })
              }
              required
              error={!!fieldErrors.userId}
              errorMessage={fieldErrors.userId || fieldErrors.password}
            />
            <InputField
              label="비밀번호"
              type={showPassword ? 'text' : 'password'}
              id="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
              icon="password-toggle"
              onIconClick={() => setShowPassword(!showPassword)}
              showPassword={showPassword}
              error={!!fieldErrors.password}
            />
          </div>
          <button
            type="submit"
            className={cn(
              buttonVariants({ variant: 'default', size: 'lg' }),
              'mt-6 w-full bg-primary text-white font-medium',
            )}
            disabled={isLoading}
          >
            {isLoading ? '로그인 중...' : '로그인하기'}
          </button>
        </form>

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            mt: '32px',
            maxWidth: '100%',
            width: '100%',
          }}
        >
          <Typography
            sx={{
              fontSize: '14px',
              fontWeight: 500,
              lineHeight: '140%',
              color: '#9F9F9F',
              whiteSpace: 'nowrap',
              textAlign: 'center',
            }}
          >
            계정이 아직 없으신가요?
          </Typography>
          <Button
            onClick={() => {
              setAuthMode('signup');
              setSignupStep('role-selection');
            }}
            sx={{
              fontSize: '16px',
              fontWeight: 500,
              lineHeight: '140%',
              color: '#404040',
              textAlign: 'center',
            }}
          >
            회원가입
          </Button>
        </Box>
      </main>

      <Box
        component="footer"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          px: '20px',
          pt: '14px',
          pb: '48px',
          width: '100%',
          fontWeight: 500,
          lineHeight: '140%',
          bgcolor: '#F7F7F7',
          minHeight: '87px',
          mt: 'auto',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            maxWidth: '100%',
            width: '100%',
          }}
        >
          <Typography
            sx={{
              fontSize: '14px',
              color: '#9F9F9F',
              textAlign: 'center',
            }}
          >
            로그인에 문제가 있나요?
          </Typography>
          <Button
            onClick={() =>
              window.open('http://pf.kakao.com/_yxjExnG/chat', '_blank')
            }
            sx={{
              fontSize: '16px',
              color: '#404040',
              textAlign: 'center',
            }}
          >
            고객센터 연락
          </Button>
        </Box>
      </Box>
    </div>
  )
} 