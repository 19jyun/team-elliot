'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SignupAcademyPage } from '@/components/auth/pages/SignupAcademyPage';

export default function SignupAcademyPageRoute() {
  const router = useRouter();

  // 원장 전용 가드 로직
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const signupData = JSON.parse(sessionStorage.getItem('signupData') || '{}');
    
    // 원장이 아니면 account 페이지로 리디렉션
    if (signupData.role !== 'PRINCIPAL') {
      router.replace('/signup/roles/personal/account');
    }
  }, [router]);

  return (
    <div className="flex overflow-hidden flex-col mx-auto w-full bg-white max-w-[480px] h-full">
      <main className="flex flex-col px-5 mt-24 w-full flex-1 overflow-hidden">
        <SignupAcademyPage />
      </main>
    </div>
  );
}

