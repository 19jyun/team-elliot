'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { DashboardContainer } from '@/components/dashboard/DashboardContainer';
import { useDashboardNavigation } from '@/contexts/DashboardContext';

// 학생 페이지 컴포넌트들
import StudentEnrollPage from '@/app/(dashboard)/dashboard/student/enroll/page';
import StudentProfilePage from '@/app/(dashboard)/dashboard/student/profile/page';
import StudentDashboardPage from '@/app/(dashboard)/dashboard/student/page';

// 강사 페이지 컴포넌트들
import TeacherStudentsPage from '@/app/(dashboard)/dashboard/teacher/students/page';
import TeacherProfilePage from '@/app/(dashboard)/dashboard/teacher/profile/page';
import TeacherDashboardPage from '@/app/(dashboard)/dashboard/teacher/page';

// 관리자 페이지 컴포넌트들
import AdminStudentsPage from '@/app/(dashboard)/dashboard/admin/students/page';
import AdminTeachersPage from '@/app/(dashboard)/dashboard/admin/teachers/page';
import AdminClassesPage from '@/app/(dashboard)/dashboard/admin/classes/page';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { navigationItems } = useDashboardNavigation();

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-700" />
      </div>
    );
  }

  if (!session?.user) {
    router.push('/login');
    return null;
  }

  // 사용자 역할에 따른 페이지 컴포넌트 매핑
  const getPageComponents = () => {
    const userRole = session.user.role || 'STUDENT';

    switch (userRole) {
      case 'STUDENT':
        return [
          <StudentDashboardPage key="classes" />,
          <StudentEnrollPage key="enroll" />,
          <StudentProfilePage key="profile" />,
        ];
      case 'TEACHER':
        return [
          <TeacherDashboardPage key="classes" />,
          <TeacherStudentsPage key="students" />,
          <TeacherProfilePage key="profile" />,
        ];
      case 'ADMIN':
        return [
          <AdminStudentsPage key="students" />,
          <AdminTeachersPage key="teachers" />,
          <AdminClassesPage key="classes" />,
        ];
      default:
        return [];
    }
  };

  const pageComponents = getPageComponents();

  return (
    <div className="w-full h-full">
      <DashboardContainer>
        {pageComponents}
      </DashboardContainer>
    </div>
  );
}
