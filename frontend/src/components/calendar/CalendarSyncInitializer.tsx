'use client';

import { useEffect, useState } from 'react';
import { useSession } from '@/lib/auth/AuthProvider';
import { useCalendarSync } from '@/hooks/useCalendarSync';
import { Button } from '@/components/ui/button';
import { Calendar, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface CalendarSyncInitializerProps {
  role: 'STUDENT' | 'PRINCIPAL' | 'TEACHER';
}

export function CalendarSyncInitializer({ role }: CalendarSyncInitializerProps) {
  const { data: session, status } = useSession();
  const {
    syncStatus,
    checkAndRequestPermissions,
    setSyncEnabled,
    clearError,
  } = useCalendarSync(role);

  const [isInitializing, setIsInitializing] = useState(false);

  // 앱 시작 시 권한 확인 및 동기화 활성화
  useEffect(() => {
    const initializeSync = async () => {
      if (status === 'authenticated' && session?.user) {
        setIsInitializing(true);
        try {
          const hasPermission = await checkAndRequestPermissions();
          if (hasPermission) {
            console.log(`${role} 캘린더 동기화 초기화 완료`);
          }
        } catch (error) {
          console.error(`${role} 캘린더 동기화 초기화 실패:`, error);
        } finally {
          setIsInitializing(false);
        }
      }
    };

    initializeSync();
  }, [status, session, role, checkAndRequestPermissions]);

  // 권한 요청 처리
  const handleRequestPermission = async () => {
    setIsInitializing(true);
    try {
      const success = await checkAndRequestPermissions();
      if (!success) {
        console.log('캘린더 권한 요청이 거부되었습니다.');
      }
    } catch (error) {
      console.error('권한 요청 실패:', error);
    } finally {
      setIsInitializing(false);
    }
  };

  // 동기화 활성화/비활성화
  const handleToggleSync = () => {
    setSyncEnabled(!syncStatus.isEnabled);
  };

  // 에러 초기화
  const handleClearError = () => {
    clearError();
  };

  // 로딩 중
  if (isInitializing) {
    return (
      <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
        <Calendar className="h-4 w-4 text-blue-600 animate-spin" />
        <span className="text-sm text-blue-700">캘린더 동기화 초기화 중...</span>
      </div>
    );
  }

  // 권한이 없는 경우
  if (!syncStatus.isEnabled && !syncStatus.error) {
    return (
      <div className="border border-orange-200 bg-orange-50 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <span className="text-orange-700">
              캘린더 동기화를 위해 권한이 필요합니다.
            </span>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={handleRequestPermission}
            className="ml-2"
          >
            권한 요청
          </Button>
        </div>
      </div>
    );
  }

  // 에러가 있는 경우
  if (syncStatus.error) {
    return (
      <div className="border border-red-200 bg-red-50 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <XCircle className="h-4 w-4 text-red-600" />
            <div>
              <span className="text-red-700 font-medium">동기화 오류</span>
              <p className="text-sm text-red-600 mt-1">{syncStatus.error}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleClearError}
            >
              닫기
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleRequestPermission}
            >
              재시도
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 동기화 활성화된 경우
  if (syncStatus.isEnabled) {
    return (
      <div className="border border-green-200 bg-green-50 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <div>
              <span className="text-green-700 font-medium">캘린더 동기화 활성화</span>
              {syncStatus.lastSyncTime && (
                <p className="text-sm text-green-600 mt-1">
                  마지막 동기화: {syncStatus.lastSyncTime.toLocaleString()}
                </p>
              )}
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={handleToggleSync}
            className="ml-2"
          >
            동기화 끄기
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
