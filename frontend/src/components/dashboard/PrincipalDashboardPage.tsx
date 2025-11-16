'use client';

import { useApp } from '@/contexts/AppContext';
import { DashboardContainer } from './DashboardContainer';
import { useSession } from '@/lib/auth/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import PrincipalClassPage from '@/app/(dashboard)/dashboard/principal/class/page';
import PrincipalProfilePage from '@/app/(dashboard)/dashboard/principal/profile/page';
import PrincipalPersonManagementPage from '@/app/(dashboard)/dashboard/principal/person_management/page';
import PrincipalEnrollmentManagementPage from '@/app/(dashboard)/dashboard/principal/enrollment_management/page';
import { RoleBasedSocketListener } from '@/components/common/Socket/RoleBasedSocketListener';
import { ensureTrailingSlash } from '@/lib/utils/router';



function PrincipalDashboardContent() {
  const { navigation } = useApp();
  const { activeTab, handleTabChange } = navigation;

  // 메인 탭 페이지들을 배열로 준비
  const tabPages = [
    <PrincipalClassPage key="class" />,
    <PrincipalEnrollmentManagementPage key="enrollment-management" />,
    <PrincipalPersonManagementPage key="person-management" />,
    <PrincipalProfilePage key="profile" />
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

export function PrincipalDashboardPage() {
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

  return <PrincipalDashboardContent />;
} 