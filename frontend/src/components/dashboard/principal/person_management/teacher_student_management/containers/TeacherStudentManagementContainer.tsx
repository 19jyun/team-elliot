'use client';

import React, { useState } from 'react';
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
    <div className="flex flex-col h-full">
      {/* 탭 네비게이션 - EnrollmentRefundManagementTabs와 동일한 디자인 */}
      <div className="flex border-b border-stone-200 bg-white">
        <button
          onClick={() => handleTabClick('teachers')}
          className={`flex-1 py-3 px-4 text-sm font-medium transition-colors duration-200 ${
            activeSection === 'teachers'
              ? 'text-primary border-b-2 border-primary'
              : 'text-stone-500 hover:text-stone-700'
          }`}
        >
          선생 관리
        </button>
        <button
          onClick={() => handleTabClick('students')}
          className={`flex-1 py-3 px-4 text-sm font-medium transition-colors duration-200 ${
            activeSection === 'students'
              ? 'text-primary border-b-2 border-primary'
              : 'text-stone-500 hover:text-stone-700'
          }`}
        >
          수강생 관리
        </button>
      </div>

      {/* 스크롤 가능한 섹션 컨텐츠 */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {renderSectionContent()}
      </div>
    </div>
  );
} 