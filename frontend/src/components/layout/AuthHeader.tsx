'use client';

import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import { useDeviceInfo } from '@/hooks/useDeviceInfo';
import { useRouter } from 'next/navigation';

export function AuthHeader() {
  const deviceInfo = useDeviceInfo();
  const router = useRouter();

  const handleBackClick = () => {
    router.back();
  };

  // 디바이스별 safe area 클래스 결정 (CommonHeader와 동일한 로직)
  const getSafeAreaClass = () => {
    if (!deviceInfo.isNative) return 'pt-safe';
    if (deviceInfo.hasDynamicIsland) return 'ios-safe-top';
    if (deviceInfo.hasNotch) return 'pt-safe';
    if (deviceInfo.platform === 'android') return 'android-safe-top';
    return 'pt-safe';
  };

  return (
    <div className={`sticky top-0 left-0 right-0 z-50 bg-white shadow-sm border-b border-gray-200 flex-shrink-0 ${getSafeAreaClass()}`}>
      {/* 로고 섹션 */}
      <div className="flex items-center justify-between px-2.5 py-4 w-full min-h-[60px]">
        {/* 뒤로가기 버튼 */}
        <button
          onClick={handleBackClick}
          className="flex items-center justify-center w-8 h-8 text-gray-600 hover:text-gray-800 transition-colors"
          aria-label="뒤로가기"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        
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
    </div>
  );
} 