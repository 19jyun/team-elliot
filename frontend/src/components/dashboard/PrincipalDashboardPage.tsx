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
import PrincipalPersonManagementPage from '@/app/(dashboard)/dashboard/principal/person_management/page';
import { PrincipalClassesContainer } from '@/components/features/principal/classes/PrincipalClassesContainer';
import { CreateClassContainer } from './principal/class_management/create-class/containers/CreateClassContainer';
import PrincipalAcademyManagementPage from '@/app/(dashboard)/dashboard/principal/academy_management/page';
import { PrincipalProfileManagement } from './principal/profile/PrincipalProfileManagement/PrincipalProfileManagement';
import { PrincipalPersonalInfoManagement } from './principal/profile/PrincipalPersonalInfoManagement/PrincipalPersonalInfoManagement';
import { EnrollmentRefundManagementContainer } from './principal/person_management/enrollment_refund_management/containers/EnrollmentRefundManagementContainer';
import { TeacherStudentManagementContainer } from './principal/person_management/teacher_student_management/containers/TeacherStudentManagementContainer';
import { ReduxTestComponent } from '@/components/common/ReduxTestComponent';
import { RoleBasedSocketListener } from '@/components/common/Socket/RoleBasedSocketListener';
import { SocketStatus } from '@/components/common/Socket/SocketStatus';
import { usePrincipalInitialization } from '@/hooks/redux/usePrincipalInitialization';



function PrincipalDashboardContent() {
  const { activeTab, handleTabChange } = usePrincipalContext();
  const { subPage, isTransitioning } = useDashboardNavigation();

  // Principal 데이터 초기화
  usePrincipalInitialization();

  // SubPage 렌더링 함수
  const renderSubPage = () => {
    if (!subPage) return null;
    
    switch (subPage) {
      case 'principal-all-classes':
        return <PrincipalClassesContainer />;
      case 'create-class':
        return <CreateClassContainer />;
      case 'profile':
        return <PrincipalProfileManagement />;
      case 'personal-info':
        return <PrincipalPersonalInfoManagement />;
      case 'enrollment-refund-management':
        return <EnrollmentRefundManagementContainer />;
      case 'teacher-student-management':
        return <TeacherStudentManagementContainer />;
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
    <PrincipalPersonManagementPage key="person-management" />,
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

        {/* Socket 관련 컴포넌트들 */}
        <RoleBasedSocketListener />
        <SocketStatus />
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