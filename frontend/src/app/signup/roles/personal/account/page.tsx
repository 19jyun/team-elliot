'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SignupAccountPage } from '@/components/auth/pages/SignupAccountPage';
import { useApp } from '@/contexts/AppContext';

export default function SignupAccountPageRoute() {
  const router = useRouter();
  const { form } = useApp();

  // 역할 및 개인정보 확인 및 가드 로직
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // 역할이 없으면 roles 페이지로 리디렉션
    if (!form.auth.signup.role) {
      router.replace('/signup/roles');
      return;
    }
    
    // 개인정보가 없으면 personal 페이지로 리디렉션
    if (!form.auth.signup.personalInfo.name || !form.auth.signup.personalInfo.phoneNumber) {
      router.replace('/signup/roles/personal');
    }
  }, [router, form.auth.signup.role, form.auth.signup.personalInfo.name, form.auth.signup.personalInfo.phoneNumber]);

  return (
    <div className="flex overflow-hidden flex-col w-full bg-white h-full">
      <SignupAccountPage />
    </div>
  );
}

