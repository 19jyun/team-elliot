'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { usePushNotification } from '@/hooks/usePushNotification';

interface PushNotificationSettingsProps {
  role?: 'STUDENT' | 'TEACHER' | 'PRINCIPAL';
}

export function PushNotificationSettings({ role }: PushNotificationSettingsProps) {
  const { status, checkAndRequestPermissions, setEnabled, clearError, getToken } = usePushNotification();
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 초기 상태 로드
  useEffect(() => {
    setIsEnabled(status.isEnabled);
  }, [status.isEnabled]);

  // 토글 처리
  const handleToggle = async (enabled: boolean) => {
    setIsLoading(true);
    
    try {
      if (enabled) {
        // 활성화: 권한 확인 및 요청
        const hasPermission = await checkAndRequestPermissions();
        if (hasPermission) {
          setIsEnabled(true);
          setEnabled(true);
        } else {
          setIsEnabled(false);
        }
      } else {
        // 비활성화
        setIsEnabled(false);
        setEnabled(false);
      }
    } catch (error) {
      console.error('푸시 알림 설정 변경 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 토큰 복사
  const handleCopyToken = async () => {
    const token = getToken();
    if (token) {
      try {
        await navigator.clipboard.writeText(token);
        alert('토큰이 클립보드에 복사되었습니다.');
      } catch (error) {
        console.error('토큰 복사 실패:', error);
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* 메인 토글 */}
      <div className="flex items-center justify-between p-4 border rounded-lg">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-medium">푸시 알림</h3>
            {isEnabled && status.isRegistered && <CheckCircle className="w-4 h-4 text-green-600" />}
          </div>
          <p className="text-sm text-gray-500 mt-1">
            수업 일정 및 중요한 알림을 받습니다
          </p>
        </div>
        <input
          type="checkbox"
          checked={isEnabled}
          onChange={(e) => handleToggle(e.target.checked)}
          disabled={isLoading}
          className="w-4 h-4 text-[#AC9592] bg-gray-100 border-gray-300 rounded focus:ring-[#AC9592]"
        />
      </div>

      {/* 에러 상태 */}
      {status.error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <XCircle className="w-4 h-4 text-red-600" />
          <div className="flex-1">
            <p className="text-sm text-red-700">{status.error}</p>
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
      {!isEnabled && !status.error && (
        <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <AlertCircle className="w-4 h-4 text-orange-600" />
          <div className="flex-1">
            <p className="text-sm text-orange-700">
              푸시 알림을 사용하려면 권한이 필요합니다
            </p>
          </div>
        </div>
      )}

      {/* 성공 상태 */}
      {isEnabled && !status.error && status.isRegistered && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <div className="flex-1">
            <p className="text-sm text-green-700">
              푸시 알림이 활성화되었습니다
            </p>
            {status.lastRegisterTime && (
              <p className="text-xs text-green-600 mt-1">
                등록 시간: {status.lastRegisterTime.toLocaleString()}
              </p>
            )}
            {status.token && (
              <div className="mt-2">
                <p className="text-xs text-gray-600 mb-1">등록 토큰:</p>
                <div className="flex items-center gap-2">
                  <code className="text-xs bg-gray-100 p-1 rounded break-all flex-1">
                    {status.token.substring(0, 50)}...
                  </code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCopyToken}
                    className="text-xs"
                  >
                    복사
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 등록 대기 중 */}
      {isEnabled && !status.error && !status.isRegistered && (
        <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <AlertCircle className="w-4 h-4 text-yellow-600" />
          <div className="flex-1">
            <p className="text-sm text-yellow-700">
              푸시 알림 등록 중...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

