'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Trash2, Check, X } from 'lucide-react';
import { usePrincipalTeachers } from '@/hooks/queries/principal/usePrincipalTeachers';
import { useTeacherJoinRequests } from '@/hooks/queries/principal/useTeacherJoinRequests';
import { useRemoveTeacher } from '@/hooks/mutations/principal/useRemoveTeacher';
import { useApproveTeacherJoin } from '@/hooks/mutations/principal/useApproveTeacherJoin';
import { useRejectTeacherJoin } from '@/hooks/mutations/principal/useRejectTeacherJoin';
import { PrincipalTeacher, TeacherJoinRequest } from '@/types/api/principal';

export default function PrincipalTeacherManagementSection() {
  // React Query 기반 데이터 관리
  const { data: teachers = [], isLoading: teachersLoading, error: teachersError } = usePrincipalTeachers();
  const { data: joinRequests, isLoading: joinRequestsLoading, error: joinRequestsError } = useTeacherJoinRequests();
  
  // Mutations
  const removeTeacherMutation = useRemoveTeacher();
  const approveJoinRequestMutation = useApproveTeacherJoin();
  const rejectJoinRequestMutation = useRejectTeacherJoin();

  const isLoading = teachersLoading || joinRequestsLoading;
  const error = teachersError || joinRequestsError;

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
              <Button onClick={() => window.location.reload()}>
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
      {/* 가입 신청 대기 목록 */}
      {joinRequests?.pendingRequests && joinRequests.pendingRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              가입 신청 대기
            </CardTitle>
            <CardDescription>
              {joinRequests.pendingRequests.length}건의 가입 신청이 대기 중입니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 overflow-y-auto">
              {joinRequests.pendingRequests.map((request: TeacherJoinRequest) => (
                <div key={request.id} className="flex items-center justify-between p-3 bg-[#AC9592]/5 border border-[#AC9592]/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-medium text-[#AC9592]">{request.teacherName}</p>
                      <p className="text-sm text-gray-600">{request.teacherPhoneNumber}</p>
                      {request.message && (
                        <p className="text-xs text-gray-500 mt-1">&ldquo;{request.message}&rdquo;</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="text-green-600 border-green-600 hover:bg-green-50"
                      onClick={() => approveJoinRequestMutation.mutate(request.id)}
                      disabled={approveJoinRequestMutation.isPending}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="text-red-600 border-red-600 hover:bg-red-50"
                      onClick={() => rejectJoinRequestMutation.mutate({ 
                        requestId: request.id, 
                        data: { reason: '관리자에 의해 거절되었습니다.' } 
                      })}
                      disabled={rejectJoinRequestMutation.isPending}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 선생님 목록 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            선생님 목록
          </CardTitle>
          <CardDescription>
            현재 {teachers.length}명의 선생님이 소속되어 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {teachers.length > 0 ? (
              teachers.map((teacher: PrincipalTeacher) => (
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