'use client';

import { useSession } from '@/lib/auth/AuthProvider';
import { AuthGuard } from '@/components/guards/AuthGuard';
import { StudentDashboard } from '@/components/dashboard/StudentDashboard';
import { TeacherDashboard } from '@/components/dashboard/TeacherDashboard';
import { PrincipalDashboard } from '@/components/dashboard/PrincipalDashboard';

export default function DashboardPage() {
  return (
    <AuthGuard requireAuth={true}>
      <DashboardContent />
    </AuthGuard>
  );
}

function DashboardContent() {
  const { data: session } = useSession();

  // 역할별 대시보드 렌더링 (상태 기반)
  const renderDashboard = () => {
    switch (session?.user?.role) {
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
