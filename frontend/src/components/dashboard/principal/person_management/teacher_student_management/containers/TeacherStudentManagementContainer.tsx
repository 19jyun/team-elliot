'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import PrincipalTeacherManagementSection from '../components/PrincipalTeacherManagementSection';
import PrincipalStudentManagementSection from '../components/PrincipalStudentManagementSection';

type ManagementSection = 'teachers' | 'students';

export function TeacherStudentManagementContainer() {
  const [activeSection, setActiveSection] = useState<ManagementSection>('teachers');

  const handleTabClick = (section: ManagementSection) => {
    setActiveSection(section);
  };

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'teachers':
        return <PrincipalTeacherManagementSection />;
      case 'students':
        return <PrincipalStudentManagementSection />;
      default:
        return <PrincipalTeacherManagementSection />;
    }
  };

  return (
    <div className="w-full h-full overflow-hidden flex flex-col bg-white max-w-[480px] mx-auto">
      {/* 헤더 */}
      <header className="flex-shrink-0 bg-white border-b border-gray-200 py-5 px-5">
        <div>
          <h1 className="text-2xl font-bold text-stone-700">인원 관리</h1>
        </div>
        
        {/* 탭 버튼들 */}
        <div className="flex gap-2 mt-4">
          <Button
            variant={activeSection === 'teachers' ? 'default' : 'outline'}
            size="sm"
            className="text-xs px-3 py-2 h-8"
            onClick={() => handleTabClick('teachers')}
          >
            선생 관리
          </Button>
          <Button
            variant={activeSection === 'students' ? 'default' : 'outline'}
            size="sm"
            className="text-xs px-3 py-2 h-8"
            onClick={() => handleTabClick('students')}
          >
            수강생 관리
          </Button>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="flex-1 min-h-0 bg-white px-5 py-4">
        <div className="h-full overflow-y-auto">
          {renderSectionContent()}
        </div>
      </main>
    </div>
  );
} 