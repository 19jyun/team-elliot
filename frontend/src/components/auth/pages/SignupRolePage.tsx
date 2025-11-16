'use client'

import * as React from 'react'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ensureTrailingSlash } from '@/lib/utils/router';

const ProgressBarItem = ({ isActive }: { isActive: boolean }) => (
  <div
    className={cn(
      'flex-1 h-1 rounded-full',
      isActive ? 'bg-stone-700' : 'bg-stone-200',
    )}
  />
)

export function SignupRolePage() {
  const router = useRouter()
  const [currentStep] = useState(1)
  const [_selectedRole, setSelectedRole] = useState<'STUDENT' | 'TEACHER' | 'PRINCIPAL' | null>(null)

  useEffect(() => {
    const savedData = JSON.parse(sessionStorage.getItem('signupData') || '{}')
    if (savedData.role) {
      setSelectedRole(savedData.role)
    }
  }, [])

  const handleRoleSelect = (role: 'STUDENT' | 'TEACHER' | 'PRINCIPAL') => {
    setSelectedRole(role)
    sessionStorage.setItem(
      'signupData',
      JSON.stringify({
        role: role,
      }),
    )
    router.push(ensureTrailingSlash('/signup/roles/personal'))
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
        회원 유형을 선택해주세요
      </div>

      <div className="flex flex-col gap-4 mt-16 w-full">
        <button 
          onClick={() => handleRoleSelect('STUDENT')}
          className="w-full p-6 border border-stone-300 rounded-lg transition-colors text-center bg-white hover:border-stone-400"
        >
          <div className="flex flex-col items-center">
            <h3 className="font-semibold text-lg mb-2 text-stone-700">학생</h3>
            <p className="text-sm text-stone-600">수강생으로 가입</p>
          </div>
        </button>
        
        <button 
          onClick={() => handleRoleSelect('TEACHER')}
          className="w-full p-6 border border-stone-300 rounded-lg transition-colors text-center bg-white hover:border-stone-400"
        >
          <div className="flex flex-col items-center">
            <h3 className="font-semibold text-lg mb-2 text-stone-700">선생님</h3>
            <p className="text-sm text-stone-600">강사로 가입</p>
          </div>
        </button>
        
        <button 
          onClick={() => handleRoleSelect('PRINCIPAL')}
          className="w-full p-6 border border-stone-300 rounded-lg transition-colors text-center bg-white hover:border-stone-400"
        >
          <div className="flex flex-col items-center">
            <h3 className="font-semibold text-lg mb-2 text-stone-700">원장</h3>
            <p className="text-sm text-stone-600">학원 운영자로 가입</p>
          </div>
        </button>
      </div>
    </div>
  )
} 