'use client';

import { useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDashboardNavigation } from '@/contexts/DashboardContext';

export function CommonHeader() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { navigationItems, activeTab, handleTabChange, isTransitioning } = useDashboardNavigation();

  // 기본 대시보드 페이지인지 확인
  const isDefaultDashboard = () => {
    if (!session?.user) return false;
    
    const userRole = session.user.role || 'STUDENT';
    const defaultPaths = {
      STUDENT: '/dashboard/student',
      TEACHER: '/dashboard/teacher',
      ADMIN: '/dashboard/admin',
    };
    
    return pathname === defaultPaths[userRole as keyof typeof defaultPaths] || pathname === '/dashboard';
  };

  // 뒤로가기 버튼 유무에 따라 메인 컨텐츠의 패딩 조정
  useEffect(() => {
    const mainElement = document.querySelector('main');
    if (mainElement) {
      if (isDefaultDashboard()) {
        mainElement.style.paddingTop = '140px'; // 로고 + 네비게이션
      } else {
        mainElement.style.paddingTop = '80px'; // 로고만
      }
    }
  }, [pathname, session]);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b border-gray-200">
      {/* 로고 섹션 */}
      <div className="flex items-center justify-between px-2.5 py-4 w-full min-h-[60px]">
        {/* 뒤로가기 버튼 (기본 대시보드가 아닐 때만 표시) */}
        {!isDefaultDashboard() ? (
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center w-8 h-8 text-gray-600 hover:text-gray-800 transition-colors"
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

      {/* 네비게이션 바 (대시보드에서만 표시) */}
      {isDefaultDashboard() && (
        <nav className="flex items-center justify-center px-5 w-full bg-white shadow-sm">
          <div
            className="flex justify-center gap-1 -mb-px w-full max-w-[480px]"
            role="tablist"
          >
            {navigationItems.map((item) => (
              <button
                key={item.index}
                onClick={() => handleTabChange(item.index)}
                className={`flex-1 focus:outline-none transition-colors ${
                  activeTab === item.index
                    ? 'text-stone-700 border-b-2 border-stone-700 bg-stone-50'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
                disabled={isTransitioning}
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