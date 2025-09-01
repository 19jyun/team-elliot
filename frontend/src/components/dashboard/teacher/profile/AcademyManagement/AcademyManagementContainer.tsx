'use client';

import AcademyManagement from './BasicManagement/AcademyManagement';

interface AcademyManagementContainerProps {
  onBack?: () => void;
}

export default function AcademyManagementContainer({ onBack }: AcademyManagementContainerProps) {
  return (
    <div className="flex flex-col h-full bg-white max-w-[480px] mx-auto">
      <div className="flex-1 overflow-y-auto">
        <AcademyManagement />
      </div>
    </div>
  );
} 