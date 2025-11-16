'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SignupTermsPage } from '@/components/auth/pages/SignupTermsPage';

export default function SignupTermsPageRoute() {
  const router = useRouter();

  // 일반 사용자 전용 가드 로직 (원장은 academy/terms로 가야 함)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const signupData = JSON.parse(sessionStorage.getItem('signupData') || '{}');
    
    // 원장이면 academy/terms로 리디렉션
    if (signupData.role === 'PRINCIPAL') {
      router.replace('/signup/roles/personal/account/academy/terms');
    }
    
    // 역할이 없으면 roles 페이지로 리디렉션
    if (!signupData.role) {
      router.replace('/signup/roles');
    }
  }, [router]);

  return (
    <div className="flex overflow-hidden flex-col mx-auto w-full bg-white max-w-[480px] h-full">
      <main className="flex flex-col px-5 mt-24 w-full flex-1 overflow-hidden">
        <SignupTermsPage />
      </main>
    </div>
  );
}

