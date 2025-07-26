'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserPlus, Trash2, Eye } from 'lucide-react';
import { AcademyStudent } from '@/types/api/teacher';

interface StudentManagementSectionProps {
  students: AcademyStudent[] | undefined;
  isLoading: boolean;
  onRemoveStudent: (studentId: number) => void;
  onViewHistory: (student: AcademyStudent) => void;
}

export default function StudentManagementSection({
  students,
  isLoading,
  onRemoveStudent,
  onViewHistory,
}: StudentManagementSectionProps) {
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
              {students?.map((student) => (
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
                    <Button size="sm" variant="outline" onClick={() => onViewHistory(student)}>
                      <Eye className="h-4 w-4 mr-1" />
                      현황 보기
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => onRemoveStudent(student.id)}>
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