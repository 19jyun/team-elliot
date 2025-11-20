'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SignupTermsPage } from '@/components/auth/pages/SignupTermsPage';
import { useApp } from '@/contexts/AppContext';

export default function SignupTermsPageRoute() {
  const router = useRouter();
  const { form } = useApp();

  // 일반 사용자 전용 가드 로직 (원장은 academy/terms로 가야 함)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // 역할이 없으면 roles 페이지로 리디렉션
    if (!form.auth.signup.role) {
      router.replace('/signup/roles');
      return;
    }
    
    // 원장이면 academy/terms로 리디렉션
    if (form.auth.signup.role === 'PRINCIPAL') {
      router.replace('/signup/roles/personal/account/academy/terms');
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
    <div className="flex overflow-hidden flex-col mx-auto w-full bg-white max-w-[480px] h-full">
      <main className="flex flex-col px-5 mt-24 w-full flex-1 overflow-hidden">
        <SignupTermsPage />
      </main>
    </div>
  );
}

