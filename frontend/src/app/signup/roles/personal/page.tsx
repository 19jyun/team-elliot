'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SignupPersonalPage } from '@/components/auth/pages/SignupPersonalPage';
import { useApp } from '@/contexts/AppContext';

export default function SignupPersonalPageRoute() {
  const router = useRouter();
  const { form } = useApp();

  // 역할 확인 및 가드 로직
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // 역할이 없으면 roles 페이지로 리디렉션
    if (!form.auth.signup.role) {
      router.replace('/signup/roles');
    }
  }, [router, form.auth.signup.role]);

  return (
    <div className="flex overflow-hidden flex-col w-full bg-white h-full">
      <SignupPersonalPage />
    </div>
  );
}

