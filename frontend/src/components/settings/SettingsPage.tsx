'use client';

import { CalendarSyncSettings } from './CalendarSyncSettings';

interface SettingsPageProps {
  role: 'STUDENT' | 'TEACHER' | 'PRINCIPAL';
}

export function SettingsPage({ role }: SettingsPageProps) {  
  return (
    <div className="flex flex-col h-full bg-white">
      
      {/* 설정 내용 */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-6">
          <div>
            <h2 className="text-base font-medium mb-4">동기화</h2>
            <CalendarSyncSettings role={role} />
          </div>
        </div>
      </div>
    </div>
  );
}
