'use client';

import { useApp } from '@/contexts/AppContext';
import { CommonHeader } from '@/components/layout/CommonHeader';
import StudentClassPage from '@/app/(dashboard)/dashboard/student/class/page';
import StudentEnrollPage from '@/app/(dashboard)/dashboard/student/enroll/page';
import StudentProfilePage from '@/app/(dashboard)/dashboard/student/profile/page';
import { EnrollmentContainer } from './student/Enrollment/enroll/EnrollmentContainer';
import { EnrollmentSubPageRenderer } from './student/Enrollment/EnrollmentSubPageRenderer';
import { AcademyManagement } from './student/Profile/AcademyManagement';
import { PersonalInfoManagement } from './student/Profile/PersonalInfoManagement';
import { EnrollmentHistory } from './student/Profile/EnrollmentHistory';
import { CancellationHistory } from './student/Profile/CancellationHistory';
import { EnrolledClassesContainer } from './student/EnrolledClasses/EnrolledClassesContainer';
import { DashboardContainer } from './DashboardContainer';
import { useSession } from '@/lib/auth/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useStudentInitialization } from '@/hooks/redux/useStudentInitialization';
import { RoleBasedSocketListener } from '@/components/common/Socket/RoleBasedSocketListener';
import { SettingsPage } from '@/components/settings/SettingsPage';


function StudentDashboardContent() {
  const { navigation } = useApp();
  const { activeTab, handleTabChange, subPage, isTransitioning } = navigation;

  // Student 데이터 초기화
  useStudentInitialization();

  // SubPage 렌더링 함수
  const renderSubPage = () => {
    if (!subPage) return null;

    // 수강 변경 관련 SubPage (modify-*)
    if (subPage.startsWith('modify-')) {
      return <EnrollmentSubPageRenderer page={subPage} />;
    }
    
    // 월별 수강신청 SubPage (enroll-*)
    if (subPage.startsWith('enroll-')) {
      return <EnrollmentSubPageRenderer page={subPage} />;
    }
    
    switch (subPage) {
      case 'enroll':
        return <EnrollmentContainer />;
      case 'enrolled-classes':
        return <EnrolledClassesContainer />;
      case 'academy':
        return <AcademyManagement />;
      case 'personal-info':
        return <PersonalInfoManagement />;
      case 'enrollment-history':
        return <EnrollmentHistory />;
      case 'cancellation-history':
        return <CancellationHistory />;
      case 'settings':
        return <SettingsPage role="STUDENT" />;
      default:
        return null;
    }
  };

  // 메인 탭 페이지들을 배열로 준비
  const tabPages = [
    <StudentClassPage key="class" />,
    <StudentEnrollPage key="enroll" />,
    <StudentProfilePage key="profile" />
  ];

  return (
    <div className="flex flex-col h-screen bg-gray-50 pb-safe">
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

export function StudentDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status !== 'loading' && !session?.user) {
      router.push('/');
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

  return <StudentDashboardContent />;
} 