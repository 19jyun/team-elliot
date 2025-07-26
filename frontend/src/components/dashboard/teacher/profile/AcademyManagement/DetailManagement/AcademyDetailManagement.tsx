'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Users, UserPlus, GraduationCap, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { useDashboardNavigation } from '@/contexts/DashboardContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMyAcademy, getAcademyTeachers, getAcademyStudents, removeTeacherFromAcademy, assignAdminRole, removeAdminRole, removeStudentFromAcademy } from '@/api/teacher';
import { AcademyStudent } from '@/types/api/teacher';

// 분리된 컴포넌트들 import
import TeacherManagementSection from './TeacherManagementSection';
import StudentManagementSection from './StudentManagementSection';
import ClassManagementSection from './ClassManagementSection';
import AcademyInfoSection from './AcademyInfoSection';
import StudentSessionHistoryModal from './StudentSessionHistoryModal';

interface AcademyDetailManagementProps {
  onBack?: () => void;
}

type ManagementSection = 'teachers' | 'students' | 'classes' | 'info';

export default function AcademyDetailManagement({ onBack }: AcademyDetailManagementProps) {
  const { pushFocus, popFocus } = useDashboardNavigation();
  const [activeSection, setActiveSection] = useState<ManagementSection>('teachers');
  const [selectedStudent, setSelectedStudent] = useState<AcademyStudent | null>(null);
  const queryClient = useQueryClient();

  // 학원 정보 조회
  const { data: academy, isLoading: isAcademyLoading } = useQuery({
    queryKey: ['teacher-academy'],
    queryFn: getMyAcademy,
  });

  // 학원 소속 선생님 목록 조회
  const { data: teachers, isLoading: isTeachersLoading } = useQuery({
    queryKey: ['academy-teachers'],
    queryFn: getAcademyTeachers,
    enabled: !!academy,
  });

  // 학원 소속 수강생 목록 조회
  const { data: students, isLoading: isStudentsLoading } = useQuery({
    queryKey: ['academy-students'],
    queryFn: getAcademyStudents,
    enabled: !!academy,
  });

  // 선생님 제거 뮤테이션
  const removeTeacherMutation = useMutation({
    mutationFn: removeTeacherFromAcademy,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academy-teachers'] });
      queryClient.invalidateQueries({ queryKey: ['teacher-academy'] });
      toast.success('선생님이 학원에서 제거되었습니다.');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || '선생님 제거에 실패했습니다.');
    },
  });

  // 관리자 권한 부여 뮤테이션
  const assignAdminMutation = useMutation({
    mutationFn: assignAdminRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academy-teachers'] });
      toast.success('관리자 권한이 부여되었습니다.');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || '권한 부여에 실패했습니다.');
    },
  });

  // 관리자 권한 제거 뮤테이션
  const removeAdminMutation = useMutation({
    mutationFn: removeAdminRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academy-teachers'] });
      toast.success('관리자 권한이 제거되었습니다.');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || '권한 제거에 실패했습니다.');
    },
  });

  // 수강생 제거 뮤테이션
  const removeStudentMutation = useMutation({
    mutationFn: removeStudentFromAcademy,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academy-students'] });
      toast.success('수강생이 학원에서 제거되었습니다.');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || '수강생 제거에 실패했습니다.');
    },
  });

  useEffect(() => {
    // 컴포넌트가 마운트될 때 포커스를 subpage로 설정
    pushFocus('subpage');
    
    return () => {
      // 컴포넌트가 언마운트될 때 이전 포커스로 복원
      popFocus();
    };
  }, [pushFocus, popFocus]);

  const sections = [
    {
      id: 'teachers' as ManagementSection,
      label: '선생 관리',
      description: '선생님 추가/제거, 권한 관리',
    },
    {
      id: 'students' as ManagementSection,
      label: '수강생 관리',
      description: '수강생 관리, 수강 현황 조회',
    },
    {
      id: 'classes' as ManagementSection,
      label: '강의 관리',
      description: '강의 개설 요청 승인/거절',
    },
    {
      id: 'info' as ManagementSection,
      label: '학원 정보',
      description: '학원 기본 정보 수정',
    },
  ];

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'teachers':
        return (
          <TeacherManagementSection 
            teachers={teachers} 
            isLoading={isTeachersLoading}
            onRemoveTeacher={removeTeacherMutation.mutate}
            onAssignAdmin={assignAdminMutation.mutate}
            onRemoveAdmin={removeAdminMutation.mutate}
          />
        );
      case 'students':
        return (
          <StudentManagementSection 
            students={students} 
            isLoading={isStudentsLoading}
            onRemoveStudent={removeStudentMutation.mutate}
            onViewHistory={setSelectedStudent}
          />
        );
      case 'classes':
        return <ClassManagementSection />;
      case 'info':
        return <AcademyInfoSection academy={academy || undefined} />;
      default:
        return (
          <TeacherManagementSection 
            teachers={teachers} 
            isLoading={isTeachersLoading}
            onRemoveTeacher={removeTeacherMutation.mutate}
            onAssignAdmin={assignAdminMutation.mutate}
            onRemoveAdmin={removeAdminMutation.mutate}
          />
        );
    }
  };

  if (isAcademyLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!academy) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>소속된 학원이 없습니다.</p>
        <p className="text-sm">기본 관리 탭에서 학원에 가입하거나 새 학원을 생성해주세요.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* 고정된 섹션 네비게이션 */}
      <div className="flex-shrink-0 px-5 py-2">
        <div className="flex gap-1">
          {sections.map((section) => {
            return (
              <Button
                key={section.id}
                variant={activeSection === section.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveSection(section.id)}
                className="flex-1 py-1 px-2 text-xs min-h-0"
              >
                {section.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* 고정된 Separator */}
      <div className="flex-shrink-0">
        <Separator className="mx-5" />
      </div>

      {/* 스크롤 가능한 섹션 컨텐츠 */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {renderSectionContent()}
      </div>

      {/* 수강생 세션 현황 모달 */}
      {selectedStudent && (
        <StudentSessionHistoryModal 
          student={selectedStudent} 
          onClose={() => setSelectedStudent(null)} 
        />
      )}
    </div>
  );
} 