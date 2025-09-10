'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserPlus, Trash2, Eye } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { usePrincipalApi } from '@/hooks/principal/usePrincipalApi';
import { useState, useEffect } from 'react';
import { PrincipalStudentSessionHistoryModal } from './PrincipalStudentSessionHistoryModal';
import { toPrincipalStudentListVM } from '@/lib/adapters/principal';
import type { PrincipalStudentListVM } from '@/types/view/principal';

export default function PrincipalStudentManagementSection() {
  const [selectedStudent, setSelectedStudent] = useState<{ id: number; name: string } | null>(null);

  // API 기반 데이터 관리
  const { students, loadStudents, isLoading, error, removeStudent } = usePrincipalApi();

  // ViewModel 생성
  const studentListVM: PrincipalStudentListVM = toPrincipalStudentListVM(
    students || [],
    isLoading,
    error
  );

  // 컴포넌트 마운트 시 학생 데이터 로드
  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  // 수강생 제거 뮤테이션
  const removeStudentMutation = useMutation({
    mutationFn: removeStudent,
    onSuccess: () => {
      // API 데이터 재로드
      loadStudents();
      toast.success('수강생이 학원에서 제거되었습니다.');
    },
    onError: (error: unknown) => {
      const errorMessage = error && typeof error === 'object' && 'response' in error 
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message 
        : '수강생 제거에 실패했습니다.';
      toast.error(errorMessage || '수강생 제거에 실패했습니다.');
    },
  });

  // 로딩 상태 처리
  if (studentListVM.isLoading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              수강생 목록
            </CardTitle>
            <CardDescription>
              수강생 목록을 불러오는 중...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <p>수강생 목록을 불러오는 중...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 에러 처리
  if (studentListVM.error) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              수강생 목록
            </CardTitle>
            <CardDescription>
              수강생 목록을 불러오는데 실패했습니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-red-500 mb-4">수강생 목록을 불러오는데 실패했습니다.</p>
              <Button onClick={() => loadStudents()}>
                다시 시도
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            수강생 목록
          </CardTitle>
          <CardDescription>
            현재 {studentListVM.totalCount}명의 수강생이 소속되어 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {studentListVM.students && studentListVM.students.length > 0 ? (
              studentListVM.students.map((student) => (
                <div key={student.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-medium">{student.name}</p>
                      <p className="text-sm text-gray-600">{student.phoneNumber}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => setSelectedStudent({ id: student.id, name: student.name })}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      onClick={() => removeStudentMutation.mutate(student.id)}
                      disabled={removeStudentMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>소속된 수강생이 없습니다.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 수강생 세션 히스토리 모달 */}
      {selectedStudent && (
        <PrincipalStudentSessionHistoryModal
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
        />
      )}
    </div>
  );
} 