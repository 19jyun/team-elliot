'use client';

import { useSession } from '@/lib/auth/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { StudentDashboard } from '@/components/dashboard/StudentDashboard';
import { TeacherDashboard } from '@/components/dashboard/TeacherDashboard';
import { PrincipalDashboard } from '@/components/dashboard/PrincipalDashboard';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // 클라이언트 사이드 인증 체크 (Capacitor 호환)
    if (status === 'unauthenticated') {
      router.push('/auth');
    }
  }, [status, router]);

  // 로딩 상태
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-700" />
      </div>
    );
  }

  // 인증되지 않은 사용자
  if (!session?.user) {
    return (
      <div className="flex items-center justify-center min-h-full">
        <p>인증이 필요합니다.</p>
      </div>
    );
  }

  // 역할별 대시보드 렌더링 (상태 기반)
  const renderDashboard = () => {
    switch (session.user.role) {
      case 'STUDENT':
        return <StudentDashboard />;
      case 'TEACHER':
        return <TeacherDashboard />;
      case 'PRINCIPAL':
        return <PrincipalDashboard />;
      default:
        // 알 수 없는 역할의 경우 기본적으로 학생 대시보드
        return <StudentDashboard />;
    }
  };

  return renderDashboard();
}
