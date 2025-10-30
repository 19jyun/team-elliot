'use client';

import { useState, useEffect } from 'react';
import { CalendarSyncSettings } from './CalendarSyncSettings';
import { PushNotificationSettings } from './PushNotificationSettings';
import { SlideUpModal } from '@/components/common/SlideUpModal';
import { CalendarSelectionList } from '@/components/calendar/CalendarSelectionList';
import { calendarSyncService } from '@/services/calendarSyncService';
import type { CalendarInfo } from '@/types/calendar/CalendarInfo';

interface SettingsPageProps {
  role: 'STUDENT' | 'TEACHER' | 'PRINCIPAL';
}

export function SettingsPage({ role }: SettingsPageProps) {
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [calendars, setCalendars] = useState<CalendarInfo[]>([]);
  const [selectedCalendarId, setSelectedCalendarId] = useState<string | null>(null);
  const [_isLoadingCalendars, setIsLoadingCalendars] = useState(false);

  // 캘린더 목록 로드
  const loadCalendars = async () => {
    setIsLoadingCalendars(true);
    try {
      const availableCalendars = await calendarSyncService.getAvailableCalendars();
      setCalendars(availableCalendars);
    } catch (error) {
      console.error('캘린더 목록 로드 실패:', error);
    } finally {
      setIsLoadingCalendars(false);
    }
  };

  // 캘린더 선택 모달 열기
  const handleCalendarSelect = async () => {
    await loadCalendars();
    setShowCalendarModal(true);
  };

  // 캘린더 선택 완료
  const handleCalendarSelectComplete = async (calendarId: string) => {
    try {
      await calendarSyncService.saveSelectedCalendar(calendarId);
      setSelectedCalendarId(calendarId);
      setShowCalendarModal(false);
    } catch (error) {
      console.error('캘린더 선택 저장 실패:', error);
    }
  };

  // 모달 닫기
  const handleCloseModal = () => {
    setShowCalendarModal(false);
  };

  // 초기 선택된 캘린더 ID 로드
  useEffect(() => {
    const storedId = calendarSyncService.getStoredCalendarId();
    setSelectedCalendarId(storedId);
  }, []);

  return (
    <div className="flex flex-col h-full bg-white">
      
      {/* 설정 내용 */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-6">
          <div>
            <h2 className="text-base font-medium mb-4">동기화</h2>
            <CalendarSyncSettings 
              role={role} 
              onCalendarSelect={handleCalendarSelect}
            />
          </div>
          <div>
            <h2 className="text-base font-medium mb-4">알림</h2>
            <PushNotificationSettings role={role} />
          </div>
        </div>
      </div>

      {/* 캘린더 선택 모달 */}
      <SlideUpModal
        isOpen={showCalendarModal}
        onClose={handleCloseModal}
        title="캘린더 선택"
        contentClassName="pb-6"
      >
        <CalendarSelectionList
          calendars={calendars}
          selectedCalendarId={selectedCalendarId}
          onCalendarSelect={handleCalendarSelectComplete}
          onClose={handleCloseModal}
        />
      </SlideUpModal>
    </div>
  );
}
