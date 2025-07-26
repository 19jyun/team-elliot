'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Trash2, Crown, Shield } from 'lucide-react';
import { AcademyTeacher } from '@/types/api/teacher';

interface TeacherManagementSectionProps {
  teachers: AcademyTeacher[] | undefined;
  isLoading: boolean;
  onRemoveTeacher: (teacherId: number) => void;
  onAssignAdmin: (teacherId: number) => void;
  onRemoveAdmin: (teacherId: number) => void;
}

export default function TeacherManagementSection({
  teachers,
  isLoading,
  onRemoveTeacher,
  onAssignAdmin,
  onRemoveAdmin,
}: TeacherManagementSectionProps) {
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
              {teachers?.map((teacher) => (
                <div key={teacher.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-medium">{teacher.name}</p>
                      <p className="text-sm text-gray-600">{teacher.phoneNumber}</p>
                    </div>
                    <Badge variant={teacher.adminRole === 'OWNER' ? 'default' : 'secondary'}>
                      {teacher.adminRole === 'OWNER' ? (
                        <>
                          <Crown className="h-3 w-3 mr-1" />
                          소유자
                        </>
                      ) : teacher.adminRole === 'ADMIN' ? (
                        <>
                          <Shield className="h-3 w-3 mr-1" />
                          관리자
                        </>
                      ) : (
                        '일반'
                      )}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    {!teacher.adminRole && (
                      <Button size="sm" variant="outline" onClick={() => onAssignAdmin(teacher.id)}>
                        관리자 부여
                      </Button>
                    )}
                    {teacher.adminRole === 'ADMIN' && (
                      <Button size="sm" variant="outline" onClick={() => onRemoveAdmin(teacher.id)}>
                        관리자 제거
                      </Button>
                    )}
                    {teacher.adminRole !== 'OWNER' && (
                      <Button size="sm" variant="destructive" onClick={() => onRemoveTeacher(teacher.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
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