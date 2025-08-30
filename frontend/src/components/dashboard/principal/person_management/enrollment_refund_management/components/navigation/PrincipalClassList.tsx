'use client';

import React from 'react';
import { usePrincipalContext } from '@/contexts/PrincipalContext';
import { usePrincipalData } from '@/hooks/redux/usePrincipalData';
import { Badge } from '@/components/ui/badge';


export function PrincipalClassList() {
  const {
    personManagement,
    setSelectedClassId,
    setPersonManagementStep
  } = usePrincipalContext();
  const { selectedTab } = personManagement;

  // Redux store에서 데이터 가져오기
  const {
    enrollments,
    refundRequests,
    isLoading,
    error
  } = usePrincipalData();

  // 선택된 탭에 따라 원본 데이터 결정
  const rawData = selectedTab === 'enrollment' 
    ? enrollments || []
    : refundRequests || [];

  // 클래스별로 그룹화
  const classMap = new Map();
  
  if (selectedTab === 'enrollment') {
    // 수강신청 데이터 처리
    const pendingEnrollments = rawData.filter((enrollment: any) => enrollment.status === "PENDING");
    
    pendingEnrollments.forEach((enrollment: any) => {
      const classId = enrollment.session?.class?.id;
      const className = enrollment.session?.class?.className;
      const teacherName = enrollment.session?.class?.teacher?.name;
      
      if (!classId) {
        console.warn('Enrollment without classId:', enrollment);
        return;
      }
      
      if (!classMap.has(classId)) {
        classMap.set(classId, {
          id: classId,
          name: className || `클래스 ${classId}`,
          pendingCount: 0,
          sessions: [],
          teacherName: teacherName || '미지정',
        });
      }
      
      const classData = classMap.get(classId);
      classData.pendingCount++;
      classData.sessions.push(enrollment);
    });
  } else {
    // 환불신청 데이터 처리
    const pendingRefunds = rawData.filter((refund: any) => refund.status === "PENDING");
    console.log('대기 중인 환불 요청 필터링 결과:', pendingRefunds);
    
    pendingRefunds.forEach((refund: any) => {
      const classId = refund.sessionEnrollment?.session?.class?.id;
      const className = refund.sessionEnrollment?.session?.class?.className;
      const teacherName = refund.sessionEnrollment?.session?.class?.teacher?.name;
      
      console.log('환불 요청 처리 중:', {
        refundId: refund.id,
        classId,
        className,
        teacherName,
        sessionEnrollment: refund.sessionEnrollment
      });
      
      // sessionEnrollment 구조 상세 확인
      console.log('sessionEnrollment 상세 구조:', {
        session: refund.sessionEnrollment?.session,
        sessionClass: refund.sessionEnrollment?.session?.class,
        classId: refund.sessionEnrollment?.session?.class?.id,
        className: refund.sessionEnrollment?.session?.class?.className
      });
      
      if (!classId) {
        console.warn('Refund without classId:', refund);
        return;
      }
      
      if (!classMap.has(classId)) {
        classMap.set(classId, {
          id: classId,
          name: className || `클래스 ${classId}`,
          pendingCount: 0,
          sessions: [],
          teacherName: teacherName || '미지정',
        });
      }
      
      const classData = classMap.get(classId);
      classData.pendingCount++;
      classData.sessions.push(refund);
    });
  }

  const classes = Array.from(classMap.values()).filter(classData => classData.id);

  const handleClassClick = (classId: number) => {
    setSelectedClassId(classId);
    setPersonManagementStep('session-list');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center flex-1">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-700" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center flex-1">
        <p className="text-stone-500">데이터를 불러오는 중 오류가 발생했습니다.</p>
      </div>
    );
  }

  if (!classes || classes.length === 0) {
    return (
      <div className="flex items-center justify-center flex-1">
        <div className="text-center">
          <p className="text-stone-500 mb-4">
            {selectedTab === 'enrollment' 
              ? '수강 신청이 대기 중인 클래스가 없습니다.'
              : '환불 요청이 대기 중인 클래스가 없습니다.'
            }
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
        {classes.map((classData: any) => (
          <div
            key={classData.id}
            className="cursor-pointer hover:shadow-md transition-shadow border border-stone-200 rounded-lg p-4"
            style={{ background: getLevelColor('BEGINNER') }}
            onClick={() => handleClassClick(classData.id)}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-stone-700 text-lg">{classData.name}</h3>
                <p className="text-sm text-stone-500 mt-1">강사: {classData.teacherName || '미지정'}</p>
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