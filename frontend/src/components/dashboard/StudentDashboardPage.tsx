'use client';

import { StudentProvider, useStudentContext } from '@/contexts/StudentContext';
import { CommonHeader } from '@/components/layout/CommonHeader';
import { useDashboardNavigation } from '@/contexts/DashboardContext';
import StudentClassPage from '@/app/(dashboard)/dashboard/student/class/page';
import StudentEnrollPage from '@/app/(dashboard)/dashboard/student/enroll/page';
import StudentProfilePage from '@/app/(dashboard)/dashboard/student/profile/page';
import { EnrollmentContainer } from './student/Enrollment/enroll/EnrollmentContainer';
import { EnrollmentSubPageRenderer } from './student/Enrollment/EnrollmentSubPageRenderer';
import { AcademyManagement } from './student/Profile/AcademyManagement';
import { PersonalInfoManagement } from './student/Profile/PersonalInfoManagement';
import { EnrollmentHistory } from './student/Profile/EnrollmentHistory';
import { CancellationHistory } from './student/Profile/CancellationHistory';
import { DashboardContainer } from './DashboardContainer';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

function StudentDashboardContent() {
  const { activeTab, handleTabChange } = useStudentContext();
  const { subPage, isTransitioning } = useDashboardNavigation();

  // SubPage가 있는 경우 SubPage 렌더링
  if (subPage) {
    const renderSubPage = () => {
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
        case 'academy':
          return <AcademyManagement />;
        case 'personal-info':
          return <PersonalInfoManagement />;
        case 'enrollment-history':
          return <EnrollmentHistory />;
        case 'cancellation-history':
          return <CancellationHistory />;
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
    <StudentClassPage key="class" />,
    <StudentEnrollPage key="enroll" />,
    <StudentProfilePage key="profile" />
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

export function StudentDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status !== 'loading' && !session?.user) {
      router.push('/login');
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
    <StudentProvider>
      <StudentDashboardContent />
    </StudentProvider>
  );
} 