'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Building2, Settings } from 'lucide-react';
import AcademyManagement from './BasicManagement/AcademyManagement';
import AcademyDetailManagement from './DetailManagement/AcademyDetailManagement';

type TabType = 'basic' | 'detail';

interface AcademyManagementContainerProps {
  onBack?: () => void;
}

export default function AcademyManagementContainer({ onBack }: AcademyManagementContainerProps) {
  const [activeTab, setActiveTab] = useState<TabType>('basic');

  const tabs = [
    {
      id: 'basic' as TabType,
      label: '기본 관리',
      icon: Building2,
      description: '학원 생성, 가입, 기본 정보 관리',
    },
    {
      id: 'detail' as TabType,
      label: '상세 관리',
      icon: Settings,
      description: '선생님, 수강생, 강의 관리',
    },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'basic':
        return <AcademyManagement onBack={onBack} />;
      case 'detail':
        return <AcademyDetailManagement onBack={onBack} />;
      default:
        return <AcademyManagement onBack={onBack} />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-white max-w-[480px] mx-auto">
      {/* 고정된 탭 네비게이션 */}
      <div className="flex-shrink-0 px-5 py-4">
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

      {/* 고정된 Separator */}
      <div className="flex-shrink-0">
        <Separator className="mx-5" />
      </div>

      {/* 스크롤 가능한 컨텐츠 영역 */}
      <div className="flex-1 overflow-y-auto">
        {renderTabContent()}
      </div>
    </div>
  );
} 