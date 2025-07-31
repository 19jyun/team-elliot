'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserPlus, Trash2, Eye } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getPrincipalAcademyStudents, removePrincipalStudent } from '@/api/principal';
import { useState } from 'react';
import { PrincipalStudentSessionHistoryModal } from './PrincipalStudentSessionHistoryModal';

export default function PrincipalStudentManagementSection() {
  const queryClient = useQueryClient();
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  // Principal의 학원 소속 수강생 목록 조회
  const { data: students, isLoading } = useQuery({
    queryKey: ['principal-academy-students'],
    queryFn: getPrincipalAcademyStudents,
  });

  // 수강생 제거 뮤테이션
  const removeStudentMutation = useMutation({
    mutationFn: removePrincipalStudent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['principal-academy-students'] });
      toast.success('수강생이 학원에서 제거되었습니다.');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || '수강생 제거에 실패했습니다.');
    },
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            수강생 목록
          </CardTitle>
          <CardDescription>
            현재 {students?.length || 0}명의 수강생이 소속되어 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">
              <p>수강생 목록을 불러오는 중...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {students?.map((student: any) => (
                <div key={student.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-medium">{student.name}</p>
                      <p className="text-sm text-gray-600">{student.phoneNumber}</p>
                      <p className="text-xs text-gray-500">
                        총 {student.totalSessions}회 수강, {student.confirmedSessions}회 확정
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => setSelectedStudent(student)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      현황 보기
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
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 수강생 세션 현황 모달 */}
      {selectedStudent && (
        <PrincipalStudentSessionHistoryModal 
          student={selectedStudent} 
          onClose={() => setSelectedStudent(null)} 
        />
      )}
    </div>
  );
} 