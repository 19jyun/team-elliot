'use client';

import { useApp } from '@/contexts/AppContext';
import TeacherClassPage from '@/app/(dashboard)/dashboard/teacher/class/page';
import TeacherClassManagementPage from '@/app/(dashboard)/dashboard/teacher/class_management/page';
import TeacherProfilePage from '@/app/(dashboard)/dashboard/teacher/profile/page';
import { DashboardContainer } from './DashboardContainer';
import { useSession } from '@/lib/auth/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { RoleBasedSocketListener } from '@/components/common/Socket/RoleBasedSocketListener';
import { ensureTrailingSlash } from '@/lib/utils/router';


function TeacherDashboardContent() {
  const { navigation } = useApp();
  const { activeTab, handleTabChange } = navigation;

  // 메인 탭 페이지들을 배열로 준비
  const tabPages = [
    <TeacherClassPage key="class" />,
    <TeacherClassManagementPage key="management" />,
    <TeacherProfilePage key="profile" />
  ];

  return (
    <>
      {/* DashboardContainer - 항상 렌더링 */}
      <DashboardContainer
        activeTab={activeTab}
        onTabChange={handleTabChange}
      >
        {tabPages}
      </DashboardContainer>

      {/* Socket 관련 컴포넌트들 */}
      <RoleBasedSocketListener />
      {/* <SocketStatus /> */}
    </>
  );
}

export function TeacherDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status !== 'loading' && !session?.user) {
      router.push(ensureTrailingSlash('/'));
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-700" />
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="flex items-center justify-center min-h-full">
        <p>인증이 필요합니다.</p>
      </div>
    );
  }

  return <TeacherDashboardContent />;
} 