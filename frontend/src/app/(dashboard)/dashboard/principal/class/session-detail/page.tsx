'use client';

import React, { Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useApp } from '@/contexts/AppContext';
import { SessionDetailContainer } from '@/components/dashboard/teacher/SessionDetail/SessionDetailContainer';

function SessionDetailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get('id');
  const { data } = useApp();

  // 🛡️ 가드 로직: ID가 없으면 접근 불가
  useEffect(() => {
    if (!sessionId) {
      router.replace('/dashboard/principal/class');
    }
  }, [sessionId, router]);

  // 세션 데이터가 DataContext에 없으면 돌아가기
  const selectedSession = data.getCache('selectedSession');
  
  useEffect(() => {
    if (!selectedSession && sessionId) {
      // 세션 데이터가 없으면 클래스 페이지로 돌아가기
      router.replace('/dashboard/principal/class');
    }
  }, [selectedSession, sessionId, router]);

  if (!sessionId || !selectedSession) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-700" />
      </div>
    );
  }

  return <SessionDetailContainer />;
}

export default function PrincipalSessionDetailPage() {
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

