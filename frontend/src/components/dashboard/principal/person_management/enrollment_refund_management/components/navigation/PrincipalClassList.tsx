'use client';

import React from 'react';
import { useImprovedApp } from '@/contexts/ImprovedAppContext';
import { usePrincipalData } from '@/hooks/redux/usePrincipalData';
import { Badge } from '@/components/ui/badge';
import { toPrincipalClassListForRequestsVM } from '@/lib/adapters/principal';
import type { PrincipalEnrollment } from '@/types/api/principal';
import type { PrincipalClassListForRequestsVM } from '@/types/view/principal';


export function PrincipalClassList() {
  const { form, setPrincipalSelectedClassId, setPrincipalPersonManagementStep } = useImprovedApp();
  const { principalPersonManagement } = form;
  const { selectedTab } = principalPersonManagement;

  // Redux store에서 데이터 가져오기
  const {
    enrollments,
    refundRequests,
    isLoading,
    error
  } = usePrincipalData();


  // ViewModel 생성
  const classListVM: PrincipalClassListForRequestsVM = toPrincipalClassListForRequestsVM({
    enrollments: (enrollments as unknown as PrincipalEnrollment[]) || [],
    refundRequests: refundRequests || [],
    selectedTab,
    isLoading,
    error,
  });

  const handleClassClick = (classId: number) => {
    setPrincipalSelectedClassId(classId);
    setPrincipalPersonManagementStep('session-list');
  };

  if (classListVM.isLoading) {
    return (
      <div className="flex items-center justify-center flex-1">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-700" />
      </div>
    );
  }

  if (classListVM.error) {
    return (
      <div className="flex items-center justify-center flex-1">
        <p className="text-stone-500">데이터를 불러오는 중 오류가 발생했습니다.</p>
      </div>
    );
  }

  if (!classListVM.hasClasses) {
    return (
      <div className="flex items-center justify-center flex-1">
        <div className="text-center">
          <p className="text-stone-500 mb-4">
            {classListVM.emptyMessage}
          </p>
        </div>
      </div>
    );
  }

  // 레벨별 색상 함수 (Principal Request Card와 동일)
  const getLevelColor = (level: string) => {
    const levelColors: Record<string, string> = {
      'BEGINNER': '#F4E7E7',
      'INTERMEDIATE': '#FBF4D8',
      'ADVANCED': '#CBDFE3',
    };
    return levelColors[level] || '#F4E7E7';
  };

  return (
    <div className="flex-1 overflow-y-auto px-5 py-4">
      <div className="space-y-4">
        {classListVM.classes.map((classData) => (
          <div
            key={classData.id}
            className="cursor-pointer hover:shadow-md transition-shadow border border-stone-200 rounded-lg p-4"
            style={{ background: getLevelColor(classData.level) }}
            onClick={() => handleClassClick(classData.id)}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-stone-700 text-lg">{classData.name}</h3>
                <p className="text-sm text-stone-500 mt-1">강사: {classData.teacherName}</p>
              </div>
              <Badge variant="secondary" className="bg-stone-100 text-stone-800">
                {classData.pendingCount}건 대기
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 