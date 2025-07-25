'use client';

import { TeacherProvider, useTeacherContext } from '@/contexts/TeacherContext';
import { CommonHeader } from '@/components/layout/CommonHeader';
import { useDashboardNavigation } from '@/contexts/DashboardContext';
import TeacherClassPage from '@/app/(dashboard)/dashboard/teacher/class/page';
import TeacherClassManagementPage from '@/app/(dashboard)/dashboard/teacher/class_management/page';
import TeacherProfilePage from '@/app/(dashboard)/dashboard/teacher/profile/page';
import { CreateClassContainer } from './teacher/class_management/create-class/containers/CreateClassContainer';
import { EnrollmentManagementContainer } from './teacher/class_management/enrollment_management/containers/EnrollmentManagementContainer';
import { TeacherProfileManagement } from './teacher/profile/TeacherProfileManagement/TeacherProfileManagement';
import { TeacherPersonalInfoManagement } from './teacher/profile/TeacherPersonalInfoManagement/TeacherPersonalInfoManagement';
import AcademyManagement from './teacher/profile/AcademyManagement/AcademyManagement';
import { TeacherClassesContainer } from './teacher/TeacherClasses/TeacherClassesContainer';
import { DashboardContainer } from './DashboardContainer';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

function TeacherDashboardContent() {
  const { activeTab, handleTabChange } = useTeacherContext();
  const { subPage, clearSubPage, isTransitioning } = useDashboardNavigation();

  // SubPage 렌더링 함수
  const renderSubPage = () => {
    if (!subPage) return null;

    switch (subPage) {
      case 'create-class':
        return <CreateClassContainer />;
      case 'enrollment-management':
        return <EnrollmentManagementContainer />;
      case 'teacher-classes':
        return <TeacherClassesContainer />;
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

  // 메인 탭 페이지들을 배열로 준비
  const tabPages = [
    <TeacherClassPage key="class" />,
    <TeacherClassManagementPage key="management" />,
    <TeacherProfilePage key="profile" />
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

export function TeacherDashboardPage() {
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
    <TeacherProvider>
      <TeacherDashboardContent />
    </TeacherProvider>
  );
} 