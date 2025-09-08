'use client';

import { useSession } from 'next-auth/react';

import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';

import { useDashboardNavigation } from '@/contexts/DashboardContext';
import { useStudentContext } from '@/contexts/StudentContext';
import { useTeacherContext } from '@/contexts/TeacherContext';
import { usePrincipalContext } from '@/contexts/PrincipalContext';
import { PrincipalPersonManagementState } from '@/contexts/PrincipalContext';

export function CommonHeader() {
  const { data: session } = useSession();

  const { subPage, goBack } = useDashboardNavigation();
  const userRole = session?.user?.role || 'STUDENT';
  
  // 모든 Hook을 최상위에서 호출 (조건부 Hook 호출 문제 해결)
  const studentContext = useStudentContext();
  const teacherContext = useTeacherContext();
  const principalContext = usePrincipalContext();
  
  // 조건부로 context 값 결정
  let navigationItems: { label: string; value: number }[] = [];
  let activeTab = 0;
  let handleTabChange = (_tab: number) => {};
  let principalPersonManagement: PrincipalPersonManagementState | null = null;
  let principalGoBack: (() => void) | null = null;
  
  try {
    if (userRole === 'STUDENT') {
      navigationItems = studentContext.navigationItems;
      activeTab = studentContext.activeTab;
      handleTabChange = studentContext.handleTabChange;
    } else if (userRole === 'TEACHER') {
      navigationItems = teacherContext.navigationItems;
      activeTab = teacherContext.activeTab;
      handleTabChange = teacherContext.handleTabChange;
    } else if (userRole === 'PRINCIPAL') {
      navigationItems = principalContext.navigationItems;
      activeTab = principalContext.activeTab;
      handleTabChange = principalContext.handleTabChange;
      principalPersonManagement = principalContext.personManagement;
      principalGoBack = principalContext.goBack;
    }
  } catch {
    // Context가 아직 준비되지 않은 경우 기본값 사용
  }

  // 뒤로가기 버튼이 표시되어야 하는지 확인
  const shouldShowBackButton = () => {
    if (subPage !== null) return true;
    
    return false;
  };

  // 뒤로가기 함수 결정
  const handleGoBack = () => {
    if (userRole === 'PRINCIPAL' && principalGoBack && principalPersonManagement && subPage === 'enrollment-refund-management') {
      // Principal의 enrollment-refund-management 서브페이지에서만 PrincipalContext의 goBack 함수 사용
      // 단, class-list 단계에서는 DashboardContext의 goBack을 사용하여 서브페이지 닫기
      if (principalPersonManagement.currentStep === 'class-list') {
        goBack();
        return;
      }
      principalGoBack();
      return;
    }
    
    // 기본 뒤로가기 (DashboardContext)
    goBack();
  };

  return (
    <div className="sticky top-0 left-0 right-0 z-50 bg-white shadow-sm border-b border-gray-200 flex-shrink-0">
      {/* 로고 섹션 */}
      <div className="flex items-center justify-between px-2.5 py-4 w-full min-h-[60px]">
        {/* 뒤로가기 버튼 (SubPage가 있을 때만 표시) */}
        {shouldShowBackButton() ? (
          <button
            onClick={handleGoBack}
            className="flex items-center justify-center w-8 h-8 text-gray-600 hover:text-gray-800 transition-colors"
            aria-label="뒤로가기"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        ) : (
          <div className="w-8 h-8"></div>
        )}
        
        {/* 로고 */}
        <div className="flex gap-2.5 justify-center items-center">
          <Image
            src="/images/logo/team-eliot-3.png"
            alt="Team Eliot Logo"
            width={77}
            height={46}
            className="object-contain"
            priority
          />
        </div>
        
        {/* 우측 여백 (좌우 균형을 위해) */}
        <div className="w-8 h-8"></div>
      </div>

      {/* 네비게이션 바 (서브 페이지가 아닐 때만 표시) */}
      {!subPage && navigationItems.length > 0 && (
        <nav className="flex items-center justify-center px-5 w-full bg-white shadow-sm">
          <div
            className="flex justify-center gap-1 -mb-px w-full max-w-[480px]"
            role="tablist"
          >
            {navigationItems.map((item) => (
              <button
                key={item.value}
                onClick={() => handleTabChange(item.value)}
                className={`flex-1 focus:outline-none transition-colors ${
                  activeTab === item.value
                    ? 'text-stone-700 border-b-2 border-stone-700 bg-stone-50'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <div className="flex justify-center items-center py-3 px-4 text-sm font-medium">
                  {item.label}
                </div>
              </button>
            ))}
          </div>
        </nav>
      )}

      {/* 네비게이션 바 (서브 페이지일 때도 표시) */}
      {subPage && navigationItems.length > 0 && (
        <nav className="flex items-center justify-center px-5 w-full bg-white shadow-sm">
          <div
            className="flex justify-center gap-1 -mb-px w-full max-w-[480px]"
            role="tablist"
          >
            {navigationItems.map((item) => (
              <button
                key={item.value}
                onClick={() => handleTabChange(item.value)}
                className={`flex-1 focus:outline-none transition-colors ${
                  activeTab === item.value
                    ? 'text-stone-700 border-b-2 border-stone-700 bg-stone-50'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <div className="flex justify-center items-center py-3 px-4 text-sm font-medium">
                  {item.label}
                </div>
              </button>
            ))}
          </div>
        </nav>
      )}
    </div>
  );
} 