'use client';

import { TeacherProvider, useTeacherContext } from '@/contexts/TeacherContext';
import { CommonHeader } from '@/components/layout/CommonHeader';
import { useDashboardNavigation } from '@/contexts/DashboardContext';
import TeacherClassPage from '@/app/(dashboard)/dashboard/teacher/class/page';
import TeacherClassManagementPage from '@/app/(dashboard)/dashboard/teacher/class_management/page';
import TeacherProfilePage from '@/app/(dashboard)/dashboard/teacher/profile/page';
import { CreateClassContainer } from './teacher/class_management/containers/CreateClassContainer';
import { TeacherProfileManagement } from './teacher/profile/TeacherProfileManagement';
import { TeacherPersonalInfoManagement } from './teacher/profile/TeacherPersonalInfoManagement';
import AcademyManagement from './teacher/profile/AcademyManagement';
import { DashboardContainer } from './DashboardContainer';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

function TeacherDashboardContent() {
  const { activeTab, handleTabChange } = useTeacherContext();
  const { subPage, clearSubPage, isTransitioning } = useDashboardNavigation();

  // SubPage가 있는 경우 SubPage 렌더링
  if (subPage) {
    const renderSubPage = () => {
      switch (subPage) {
        case 'create-class':
          return <CreateClassContainer />;
        case 'profile':
          return <TeacherProfileManagement />;
        case 'personal-info':
          return <TeacherPersonalInfoManagement />;
        case 'academy-management':
          return <AcademyManagement onBack={clearSubPage} />;
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
    <TeacherClassPage key="class" />,
    <TeacherClassManagementPage key="management" />,
    <TeacherProfilePage key="profile" />
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

export function TeacherDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-700" />
      </div>
    );
  }

  if (!session?.user) {
    router.push('/login');
    return null;
  }

  return (
    <TeacherProvider>
      <TeacherDashboardContent />
    </TeacherProvider>
  );
} 