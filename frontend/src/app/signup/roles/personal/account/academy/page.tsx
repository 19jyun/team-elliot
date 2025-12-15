'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SignupAcademyPage } from '@/components/auth/pages/SignupAcademyPage';
import { useApp } from '@/contexts/AppContext';

export default function SignupAcademyPageRoute() {
  const router = useRouter();
  const { form } = useApp();

  // 원장 전용 가드 로직
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // 역할이 없으면 roles 페이지로 리디렉션
    if (!form.auth.signup.role) {
      router.replace('/signup/roles');
      return;
    }
    
    // 원장이 아니면 account 페이지로 리디렉션
    if (form.auth.signup.role !== 'PRINCIPAL') {
      router.replace('/signup/roles/personal/account');
      return;
    }
    
    // 개인정보가 없으면 personal 페이지로 리디렉션
    if (!form.auth.signup.personalInfo.name || !form.auth.signup.personalInfo.phoneNumber) {
      router.replace('/signup/roles/personal');
      return;
    }
    
    // 계정정보가 없으면 account 페이지로 리디렉션
    if (!form.auth.signup.accountInfo.userId || !form.auth.signup.accountInfo.password) {
      router.replace('/signup/roles/personal/account');
    }
  }, [router, form.auth.signup.role, form.auth.signup.personalInfo.name, form.auth.signup.personalInfo.phoneNumber, form.auth.signup.accountInfo.userId, form.auth.signup.accountInfo.password]);

  return (
    <div className="flex overflow-hidden flex-col w-full bg-white h-full">
      <SignupAcademyPage />
    </div>
  );
}

