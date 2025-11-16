'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SignupAccountPage } from '@/components/auth/pages/SignupAccountPage';

export default function SignupAccountPageRoute() {
  const router = useRouter();

  // 역할 확인 및 가드 로직
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const signupData = JSON.parse(sessionStorage.getItem('signupData') || '{}');
    
    // 역할이 없으면 roles 페이지로 리디렉션
    if (!signupData.role) {
      router.replace('/signup/roles');
    }
  }, [router]);

  return (
    <div className="flex overflow-hidden flex-col mx-auto w-full bg-white max-w-[480px] h-full">
      <main className="flex flex-col px-5 mt-24 w-full flex-1 overflow-hidden">
        <SignupAccountPage />
      </main>
    </div>
  );
}

