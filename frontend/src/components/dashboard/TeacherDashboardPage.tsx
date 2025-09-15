'use client';

import { useApp } from '@/contexts/AppContext';
import { CommonHeader } from '@/components/layout/CommonHeader';
import TeacherClassPage from '@/app/(dashboard)/dashboard/teacher/class/page';
import TeacherClassManagementPage from '@/app/(dashboard)/dashboard/teacher/class_management/page';
import TeacherProfilePage from '@/app/(dashboard)/dashboard/teacher/profile/page';
import { TeacherProfileManagement } from './teacher/profile/TeacherProfileManagement/TeacherProfileManagement';
import { TeacherPersonalInfoManagement } from './teacher/profile/TeacherPersonalInfoManagement/TeacherPersonalInfoManagement';
import AcademyManagementContainer from './teacher/profile/AcademyManagement/AcademyManagementContainer';
import { TeacherClassesContainer } from '../features/teacher/classes/TeacherClasses/TeacherClassesContainer';
import { DashboardContainer } from './DashboardContainer';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { RoleBasedSocketListener } from '@/components/common/Socket/RoleBasedSocketListener';


function TeacherDashboardContent() {
  const { navigation } = useApp();
  const { activeTab, handleTabChange, subPage, clearSubPage, isTransitioning } = navigation;

  // SubPage 렌더링 함수
  const renderSubPage = () => {
    if (!subPage) return null;

    switch (subPage) {
      case 'teacher-classes':
        return <TeacherClassesContainer />;
      case 'profile':
        return <TeacherProfileManagement />;
      case 'personal-info':
        return <TeacherPersonalInfoManagement />;
      case 'academy-management':
        return <AcademyManagementContainer onBack={clearSubPage} />;
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

        {/* Socket 관련 컴포넌트들 */}
        <RoleBasedSocketListener />
        {/* <SocketStatus /> */}
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
        <p>인증이 필요합니다.</p>
      </div>
    );
  }

  return <TeacherDashboardContent />;
} 