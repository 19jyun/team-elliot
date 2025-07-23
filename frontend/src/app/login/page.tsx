'use client';

import * as React from 'react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { StatusBar } from '@/components/ui/StatusBar'
import { InputField } from '@/components/auth/InputField'
import { Button } from '@/components/auth/Button'

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    userId: '',
    password: '',
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.userId || !formData.password) {
      toast.error('아이디와 비밀번호를 입력해주세요')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast.success('로그인되었습니다')
        router.push('/dashboard')
      } else {
        const error = await response.json()
        toast.error(error.message || '로그인에 실패했습니다')
      }
    } catch (error) {
      toast.error('로그인 중 오류가 발생했습니다')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex overflow-hidden flex-col pb-2 mx-auto w-full bg-white max-w-[480px]">
      <StatusBar 
        time="9:41"
        icons={[
          { src: '/icons/signal.svg', alt: 'Signal', width: 'w-4', aspectRatio: 'square' },
          { src: '/icons/wifi.svg', alt: 'WiFi', width: 'w-4', aspectRatio: 'square' },
          { src: '/icons/battery.svg', alt: 'Battery', width: 'w-6', aspectRatio: 'square' }
        ]}
        logoSrc="/icons/logo.svg"
      />

      <div className="flex gap-2.5 items-center px-2.5 py-2">
        <div className="flex gap-2.5 items-center self-stretch p-2.5 my-auto w-11">
          <img
            loading="lazy"
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/99d663a7cc4ce56bcb24a91168e88c60bb7df63e17dace2e992d6911ce1c206c?placeholderIfAbsent=true&apiKey=1a4d049d8fe54d8aa58f4ebfa539d65f"
            alt="Back"
            className="object-contain self-stretch my-auto w-6 aspect-square"
          />
        </div>
      </div>

      <div className="flex flex-col px-5 w-full">
        <img
          loading="lazy"
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/97130cde9aeee244b068f8f7ae85c80577a223db166a059a272277cf5c389cd?placeholderIfAbsent=true&apiKey=1a4d049d8fe54d8aa58f4ebfa539d65f"
          alt="Logo"
          className="object-contain max-w-full aspect-[4.48] w-[220px] mx-auto"
        />

        <h1 className="self-start mt-6 text-xl font-medium leading-tight text-stone-700">
          로그인
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col mt-5 w-full">
          <InputField
            label="아이디"
            value={formData.userId}
            onChange={(value: string) => setFormData({ ...formData, userId: value })}
            placeholder="아이디를 입력하세요"
          />
          
          <InputField
            label="비밀번호"
            type="password"
            value={formData.password}
            onChange={(value: string) => setFormData({ ...formData, password: value })}
            placeholder="비밀번호를 입력하세요"
          />

          <Button type="submit" className="mt-6" disabled={isLoading}>
            {isLoading ? '로그인 중...' : '로그인'}
          </Button>
        </form>

        <div className="flex justify-center mt-6">
          <button
            onClick={() => router.push('/signup')}
            className="text-blue-600 hover:text-blue-800"
          >
            회원가입하기
          </button>
        </div>
      </div>
    </div>
  )
} 