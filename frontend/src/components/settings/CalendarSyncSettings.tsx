'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { useCalendarSync } from '@/hooks/useCalendarSync';


interface CalendarSyncSettingsProps {
  role: 'STUDENT' | 'TEACHER' | 'PRINCIPAL';
}

export function CalendarSyncSettings({ role }: CalendarSyncSettingsProps) {
  const { syncStatus, checkAndRequestPermissions, setSyncEnabled, clearError } = useCalendarSync(role);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 초기 상태 로드
  useEffect(() => {
    setIsEnabled(syncStatus.isEnabled);
  }, [syncStatus.isEnabled]);

  // 토글 처리
  const handleToggle = async (enabled: boolean) => {
    setIsLoading(true);
    
    try {
      if (enabled) {
        // 활성화: 권한 확인 및 요청
        const hasPermission = await checkAndRequestPermissions();
        if (hasPermission) {
          setIsEnabled(true);
          setSyncEnabled(true);
        } else {
          setIsEnabled(false);
        }
      } else {
        // 비활성화
        setIsEnabled(false);
        setSyncEnabled(false);
      }
    } catch (error) {
      console.error('캘린더 동기화 설정 변경 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 권한 재요청
  const handleRequestPermission = async () => {
    setIsLoading(true);
    try {
      const success = await checkAndRequestPermissions();
      if (success) {
        setIsEnabled(true);
        setSyncEnabled(true);
      }
    } catch (error) {
      console.error('권한 요청 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* 메인 토글 */}
      <div className="flex items-center justify-between p-4 border rounded-lg">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-medium">캘린더 동기화</h3>
            {isEnabled && <CheckCircle className="w-4 h-4 text-green-600" />}
          </div>
          <p className="text-sm text-gray-500 mt-1">
            기기 캘린더와 수업 일정을 자동으로 동기화합니다
          </p>
        </div>
        <input
          type="checkbox"
          checked={isEnabled}
          onChange={(e) => handleToggle(e.target.checked)}
          disabled={isLoading}
          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
        />
      </div>

      {/* 에러 상태 */}
      {syncStatus.error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <XCircle className="w-4 h-4 text-red-600" />
          <div className="flex-1">
            <p className="text-sm text-red-700">{syncStatus.error}</p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={clearError}
          >
            닫기
          </Button>
        </div>
      )}

      {/* 권한이 없는 경우 */}
      {!isEnabled && !syncStatus.error && (
        <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <AlertCircle className="w-4 h-4 text-orange-600" />
          <div className="flex-1">
            <p className="text-sm text-orange-700">
              캘린더 동기화를 사용하려면 권한이 필요합니다
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={handleRequestPermission}
            disabled={isLoading}
          >
            권한 요청
          </Button>
        </div>
      )}

      {/* 성공 상태 */}
      {isEnabled && !syncStatus.error && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <div className="flex-1">
            <p className="text-sm text-green-700">
              캘린더 동기화가 활성화되었습니다
            </p>
            {syncStatus.lastSyncTime && (
              <p className="text-xs text-green-600 mt-1">
                마지막 동기화: {syncStatus.lastSyncTime.toLocaleString()}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
