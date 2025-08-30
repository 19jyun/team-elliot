'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

import { User, Building2 } from 'lucide-react';
import { TeacherPersonalInfoManagement } from './profile/TeacherPersonalInfoManagement/TeacherPersonalInfoManagement';
import AcademyManagementContainer from './profile/AcademyManagement/AcademyManagementContainer';

type TabType = 'personal' | 'academy';

export function TeacherProfilePage() {

  const [activeTab, setActiveTab] = useState<TabType>('personal');

  const tabs = [
    {
      id: 'personal' as TabType,
      label: '개인정보 관리',
      icon: User,
    },
    {
      id: 'academy' as TabType,
      label: '내 학원 관리',
      icon: Building2,
    },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'personal':
        return <TeacherPersonalInfoManagement />;
      case 'academy':
        return <AcademyManagementContainer onBack={() => setActiveTab('personal')} />;
      default:
        return <TeacherPersonalInfoManagement />;
    }
  };

  return (
    <div className="flex overflow-hidden flex-col pb-2 mx-auto w-full bg-white">
      {/* 헤더 */}
      <div className="flex flex-col px-5 py-6">
        <h1 className="text-2xl font-bold text-stone-700">
          나의 정보
        </h1>
        <p className="mt-2 text-stone-500">
          개인정보와 학원 설정을 관리하세요.
        </p>
      </div>

      {/* 탭 네비게이션 */}
      <div className="px-5 pb-4">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center space-x-2 flex-1"
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* 탭 컨텐츠 */}
      <div className="flex-1 overflow-hidden">
        {renderTabContent()}
      </div>
    </div>
  );
} 