'use client';

import React, { Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { SessionDetailContainer } from '@/components/dashboard/teacher/SessionDetail/SessionDetailContainer';

function SessionDetailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get('id');

  // 🛡️ 가드 로직: ID가 없으면 접근 불가
  useEffect(() => {
    if (!sessionId) {
      router.replace('/dashboard/teacher/class');
    }
  }, [sessionId, router]);

  if (!sessionId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-700" />
      </div>
    );
  }

  return <SessionDetailContainer />;
}

export default function TeacherSessionDetailPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-700" />
      </div>
    }>
      <SessionDetailContent />
    </Suspense>
  );
}

