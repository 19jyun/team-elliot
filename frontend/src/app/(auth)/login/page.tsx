'use client'

import * as React from 'react'
import { useState } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { cva } from 'class-variance-authority'
import { Box, Button, Typography } from '@mui/material'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import Image from 'next/image'

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

const InputField = ({
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
          {icon && (
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

const StatusBar = () => {
  return (
    <div className="flex justify-center items-center w-full bg-white min-h-[60px] max-sm:hidden">
      <div className="flex overflow-hidden flex-1 shrink gap-1 justify-center items-center self-stretch px-9 py-6 my-auto text-lg tracking-tight leading-none text-center text-black whitespace-nowrap basis-0 font-[590] min-h-[60px]">
        <div className="self-stretch my-auto w-[35px]">9:41</div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    userId: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({
    userId: '',
    password: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({ userId: '', password: '' })

    try {
      const result = await signIn('credentials', {
        userId: formData.userId,
        password: formData.password,
        redirect: false,
      })

      if (result?.error) {
        const errorMessage = result.error

        if (errorMessage.includes('아이디와 비밀번호가 일치하지 않아요')) {
          // 둘 다 에러 상태로 변경
          setErrors({
            userId: '아이디와 비밀번호가 일치하지 않아요',
            password: ' ',
          })
        } else if (errorMessage.includes('Invalid password')) {
          // 비밀번호만 에러 상태로 변경하고, 에러 메시지도 password에 설정
          setErrors({
            userId: '', // email 필드는 정상 상태 유지
            password: '비밀번호가 일치하지 않습니다.',
          })
        } else if (errorMessage.includes('User not found')) {
          // 아이디만 에러 상태로 변경
          setErrors({
            userId: '존재하지 않는 계정입니다.',
            password: '',
          })
        } else {
          // 기타 에러는 아이디 필드에만 표시
          setErrors({
            userId: errorMessage,
            password: '',
          })
        }
        return
      }

      if (result.ok) {
        router.push('/dashboard')
      }
    } catch (error) {
      setErrors({
        userId: '로그인 중 오류가 발생했습니다.',
        password: '',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex overflow-hidden flex-col pb-2 mx-auto w-full bg-white max-w-[480px]">
      <main className="flex flex-col px-5 mt-24 w-full">
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
              error={!!errors.userId}
              errorMessage={errors.userId || errors.password}
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
              error={!!errors.password}
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
            alignSelf: 'center',
            mt: '32px',
            maxWidth: '100%',
            width: '124px',
          }}
        >
          <Typography
            sx={{
              fontSize: '14px',
              fontWeight: 500,
              lineHeight: '140%',
              color: '#9F9F9F',
              whiteSpace: 'nowrap',
            }}
          >
            계정이 아직 없으신가요?
          </Typography>
          <Button
            onClick={() => router.push('/signup/step1')}
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
          mt: '40px',
          width: '100%',
          fontWeight: 500,
          lineHeight: '140%',
          bgcolor: '#F7F7F7',
          minHeight: '87px',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            gap: '40px',
            justifyContent: 'space-between',
            alignItems: 'center',
            maxWidth: '100%',
            width: '335px',
          }}
        >
          <Typography
            sx={{
              fontSize: '14px',
              color: '#9F9F9F',
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
              textAlign: 'right',
            }}
          >
            고객센터 연락
          </Button>
        </Box>
      </Box>
    </div>
  )
}
