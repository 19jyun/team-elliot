'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Trash2, Crown, Shield } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { 
  getPrincipalAcademyTeachers, 
  removePrincipalTeacher
} from '@/api/principal';

export default function PrincipalTeacherManagementSection() {
  const queryClient = useQueryClient();

  // Principal의 학원 소속 선생님 목록 조회
  const { data: teachers, isLoading } = useQuery({
    queryKey: ['principal-academy-teachers'],
    queryFn: getPrincipalAcademyTeachers,
  });

  // 선생님 제거 뮤테이션
  const removeTeacherMutation = useMutation({
    mutationFn: removePrincipalTeacher,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['principal-academy-teachers'] });
      toast.success('선생님이 학원에서 제거되었습니다.');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || '선생님 제거에 실패했습니다.');
    },
  });



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
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">
              <p>선생님 목록을 불러오는 중...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {teachers?.map((teacher: any) => (
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
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 