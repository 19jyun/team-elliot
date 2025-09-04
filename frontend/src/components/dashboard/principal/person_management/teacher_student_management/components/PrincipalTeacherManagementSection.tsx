'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Trash2 } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { usePrincipalApi } from '@/hooks/principal/usePrincipalApi';
import { useEffect } from 'react';

export default function PrincipalTeacherManagementSection() {
  // API 기반 데이터 관리
  const { teachers, loadTeachers, isLoading, error, removeTeacher } = usePrincipalApi();

  // 컴포넌트 마운트 시 선생님 데이터 로드
  useEffect(() => {
    loadTeachers();
  }, [loadTeachers]);

  // 선생님 제거 뮤테이션
  const removeTeacherMutation = useMutation({
    mutationFn: removeTeacher,
    onSuccess: () => {
      // API 데이터 재로드
      loadTeachers();
      toast.success('선생님이 학원에서 제거되었습니다.');
    },
    onError: (error: unknown) => {
      const errorMessage = error && typeof error === 'object' && 'response' in error 
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message 
        : '선생님 제거에 실패했습니다.';
      toast.error(errorMessage || '선생님 제거에 실패했습니다.');
    },
  });

  // 로딩 상태 처리
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              선생님 목록
            </CardTitle>
            <CardDescription>
              선생님 목록을 불러오는 중...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <p>선생님 목록을 불러오는 중...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 에러 처리
  if (error) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              선생님 목록
            </CardTitle>
            <CardDescription>
              선생님 목록을 불러오는데 실패했습니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-red-500 mb-4">선생님 목록을 불러오는데 실패했습니다.</p>
              <Button onClick={() => loadTeachers()}>
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
            <Users className="h-5 w-5" />
            선생님 목록
          </CardTitle>
          <CardDescription>
            현재 {teachers?.length || 0}명의 선생님이 소속되어 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {teachers && teachers.length > 0 ? (
              teachers.map((teacher: any) => (
                <div key={teacher.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-medium">{teacher.name}</p>
                      <p className="text-sm text-gray-600">{teacher.phoneNumber}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      onClick={() => removeTeacherMutation.mutate(teacher.id)}
                      disabled={removeTeacherMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>소속된 선생님이 없습니다.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 