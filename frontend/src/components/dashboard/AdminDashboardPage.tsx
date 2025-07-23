'use client';

import { AdminProvider, useAdminContext } from '@/contexts/AdminContext';
import { CommonHeader } from '@/components/layout/CommonHeader';
import { useDashboardNavigation } from '@/contexts/DashboardContext';
import AdminStudentsPage from '@/app/(dashboard)/dashboard/admin/students/page';
import AdminTeachersPage from '@/app/(dashboard)/dashboard/admin/teachers/page';
import AdminClassesPage from '@/app/(dashboard)/dashboard/admin/classes/page';
import { DashboardContainer } from './DashboardContainer';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

function AdminDashboardContent() {
  const { activeTab, handleTabChange } = useAdminContext();
  const { subPage, isTransitioning } = useDashboardNavigation();

  // SubPage가 있는 경우 SubPage 렌더링
  if (subPage) {
    const renderSubPage = () => {
      switch (subPage) {
        // 관리자 SubPage들이 있다면 여기에 추가
        default:
          return null;
      }
    };

    return (
      <div className="flex flex-col h-screen bg-gray-50">
        <CommonHeader />
        <main className="flex-1 overflow-hidden">
          <div className="w-full h-full overflow-y-auto overflow-x-hidden">
            {renderSubPage()}
          </div>
        </main>
      </div>
    );
  }

  // 메인 탭 페이지들을 배열로 준비
  const tabPages = [
    <AdminStudentsPage key="students" />,
    <AdminTeachersPage key="teachers" />,
    <AdminClassesPage key="classes" />
  ];

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <CommonHeader />
      <main className="flex-1 overflow-hidden">
        <DashboardContainer
          activeTab={activeTab}
          onTabChange={handleTabChange}
          isTransitioning={isTransitioning}
          subPage={subPage}
        >
          {tabPages}
        </DashboardContainer>
      </main>
    </div>
  );
}

export function AdminDashboardPage() {
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-700" />
      </div>
    );
  }

  return (
    <AdminProvider>
      <AdminDashboardContent />
    </AdminProvider>
  );
} 