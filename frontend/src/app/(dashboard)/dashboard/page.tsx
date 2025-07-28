'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { StudentDashboardPage } from '@/components/dashboard/StudentDashboardPage';
import { TeacherDashboardPage } from '@/components/dashboard/TeacherDashboardPage';
import { AdminDashboardPage } from '@/components/dashboard/AdminDashboardPage';
import { PrincipalDashboardPage } from '@/components/dashboard/PrincipalDashboardPage';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-700" />
      </div>
    );
  }

  // 사용자 역할에 따른 대시보드 페이지 렌더링
  const userRole = session?.user.role || 'STUDENT';

  switch (userRole) {
    case 'STUDENT':
      return <StudentDashboardPage />;
    case 'TEACHER':
      return <TeacherDashboardPage />;
    case 'ADMIN':
      return <AdminDashboardPage />;
    case 'PRINCIPAL':
      return <PrincipalDashboardPage />;
    default:
      return <StudentDashboardPage />;
  }
}
