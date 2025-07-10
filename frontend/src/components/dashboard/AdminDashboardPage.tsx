'use client';

import { AdminProvider, useAdminContext } from '@/contexts/AdminContext';
import { CommonHeader } from '@/components/layout/CommonHeader';
import { useDashboardNavigation } from '@/contexts/DashboardContext';
import AdminStudentsPage from '@/app/(dashboard)/dashboard/admin/students/page';
import AdminTeachersPage from '@/app/(dashboard)/dashboard/admin/teachers/page';
import AdminClassesPage from '@/app/(dashboard)/dashboard/admin/classes/page';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

function AdminDashboardContent() {
  const { activeTab } = useAdminContext();
  const { subPage } = useDashboardNavigation();

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

  // 탭에 따라 각 페이지 렌더링
  let content = null;
  switch (activeTab) {
    case 0:
      content = <AdminStudentsPage />;
      break;
    case 1:
      content = <AdminTeachersPage />;
      break;
    case 2:
      content = <AdminClassesPage />;
      break;
    default:
      content = <AdminStudentsPage />;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <CommonHeader />
      <main className="flex-1 overflow-hidden">
        <div className="w-full h-full">
          <div className="flex-1">{content}</div>
        </div>
      </main>
    </div>
  );
}

export function AdminDashboardPage() {
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
    <AdminProvider>
      <AdminDashboardContent />
    </AdminProvider>
  );
} 