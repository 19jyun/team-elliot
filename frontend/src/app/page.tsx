'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return; // 로딩 중이면 대기
    
    if (session?.user) {
      // 로그인된 사용자 → /dashboard로 리다이렉트
      router.push('/dashboard');
    } else {
      // 로그인되지 않은 사용자 → /auth로 리다이렉트
      router.push('/auth');
    }
  }, [status, session, router]);

  // 리다이렉트 중 로딩 표시
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-700 mx-auto mb-4"></div>
        <p className="text-gray-600">페이지를 로딩하는 중...</p>
      </div>
    </div>
  );
}