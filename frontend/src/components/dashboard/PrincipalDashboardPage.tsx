'use client';

import { PrincipalProvider, usePrincipalContext } from '@/contexts/PrincipalContext';
import { CommonHeader } from '@/components/layout/CommonHeader';
import { useDashboardNavigation } from '@/contexts/DashboardContext';
import { DashboardContainer } from './DashboardContainer';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import PrincipalClassPage from '@/app/(dashboard)/dashboard/principal/class/page';
import PrincipalProfilePage from '@/app/(dashboard)/dashboard/principal/profile/page';
import { PrincipalClassesContainer } from '@/components/features/principal/classes/PrincipalClassesContainer';
import { CreateClassContainer } from './principal/class_management/create-class/containers/CreateClassContainer';
import PrincipalAcademyManagementPage from '@/app/(dashboard)/dashboard/principal/academy_management/page';

// 임시 페이지 컴포넌트들 (추후 구현)
const PrincipalUserManagementPage = () => (
  <div className="flex items-center justify-center h-full">
    <div className="text-center">
      <h2 className="text-xl font-semibold mb-2">수강생/강사 관리</h2>
      <p className="text-gray-600">수강생 및 강사 관리 페이지</p>
      <p className="text-sm text-gray-500 mt-2">개발 중...</p>
    </div>
  </div>
);

const PrincipalAcademyManagementTab = () => {
  return <PrincipalAcademyManagementPage />;
};

function PrincipalDashboardContent() {
  const { activeTab, handleTabChange } = usePrincipalContext();
  const { subPage, isTransitioning } = useDashboardNavigation();

  // SubPage 렌더링 함수
  const renderSubPage = () => {
    if (!subPage) return null;
    
    switch (subPage) {
      case 'principal-all-classes':
        return <PrincipalClassesContainer />;
      case 'create-class':
        return <CreateClassContainer />;
      default:
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">SubPage</h2>
              <p className="text-gray-600">SubPage: {subPage}</p>
              <p className="text-sm text-gray-500 mt-2">개발 중...</p>
            </div>
          </div>
        );
    }
  };

  // 메인 탭 페이지들을 배열로 준비
  const tabPages = [
    <PrincipalClassPage key="class" />,
    <PrincipalUserManagementPage key="user-management" />,
    <PrincipalAcademyManagementPage key="academy-management" />,
    <PrincipalProfilePage key="profile" />
  ];

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <CommonHeader />
      <main className="flex-1 overflow-hidden relative">
        {/* DashboardContainer - 항상 렌더링 */}
        <DashboardContainer
          activeTab={activeTab}
          onTabChange={handleTabChange}
          isTransitioning={isTransitioning}
          subPage={subPage}
        >
          {tabPages}
        </DashboardContainer>

        {/* SubPage 오버레이 */}
        {subPage && (
          <div className="absolute inset-0 bg-white z-10">
            <div className="w-full h-full overflow-y-auto overflow-x-hidden">
              {renderSubPage()}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export function PrincipalDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status !== 'loading' && !session?.user) {
      router.push('/auth');
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

  return (
    <PrincipalProvider>
      <PrincipalDashboardContent />
    </PrincipalProvider>
  );
} 