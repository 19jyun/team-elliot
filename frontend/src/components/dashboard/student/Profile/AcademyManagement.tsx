'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Users, Building2, AlertTriangle, X } from 'lucide-react';
import { toast } from 'sonner';
import { useApp } from '@/contexts/AppContext';
import { AcademyCard } from '@/components/common/AcademyCard';
import { useStudentAcademies } from '@/hooks/queries/student/useStudentAcademies';
import { useJoinAcademy } from '@/hooks/mutations/student/useJoinAcademy';
import { useLeaveAcademy } from '@/hooks/mutations/student/useLeaveAcademy';
import type { LeaveAcademyModalVM } from '@/types/view/student';

function LeaveAcademyModal({ isOpen, onClose, onConfirm, academyName }: LeaveAcademyModalVM) {
  const { ui } = useApp();
  const { pushFocus, popFocus } = ui;

  useEffect(() => {
    if (isOpen) {
      pushFocus('modal'); // 모달이 열릴 때 포커스를 modal로 변경
    } else {
      popFocus(); // 모달이 닫힐 때 이전 포커스로 복원
    }
  }, [isOpen, pushFocus, popFocus]);

  const handleClose = () => {
    popFocus(); // 모달이 닫힐 때 이전 포커스로 복원
    onClose();
  };

  const handleConfirm = () => {
    popFocus(); // 확인 시 이전 포커스로 복원
    onConfirm();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="flex flex-col bg-white rounded-lg shadow-xl max-w-md w-full mx-4 transform transition-all">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-full">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">학원 탈퇴 확인</h3>
          </div>
          <button
            onClick={handleClose}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 콘텐츠 */}
        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-6">
          <p className="text-gray-700 mb-6">
            <span className="font-semibold text-red-600">{academyName}</span> 학원에서 탈퇴하시겠습니까?
          </p>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-red-700">
                <p className="font-semibold mb-3">탈퇴 시 주의사항:</p>
                <ul className="space-y-2 text-xs">
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">•</span>
                    <span>해당 학원의 모든 수강 정보가 삭제됩니다</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">•</span>
                    <span>진행 중인 수업에 대한 접근이 제한됩니다</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">•</span>
                    <span>탈퇴 후 재가입이 필요합니다</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* 버튼 영역 */}
        <div className="flex gap-3 px-6 py-6 border-t border-gray-200 flex-shrink-0">
          <Button
            variant="outline"
            onClick={handleClose}
            className="flex-1"
          >
            취소
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            className="flex-1"
          >
            탈퇴하기
          </Button>
        </div>
      </div>
    </div>
  );
}

export function AcademyManagement() {
  const { ui } = useApp();
  const { pushFocus, popFocus } = ui;
  
  // React Query 기반 데이터 관리
  const { data: academies = [], isLoading, error } = useStudentAcademies();
  const joinAcademyMutation = useJoinAcademy();
  const leaveAcademyMutation = useLeaveAcademy();

  const [joinAcademyCode, setJoinAcademyCode] = useState('');
  const [leaveAcademyId, setLeaveAcademyId] = useState<number | null>(null);
  const [leaveAcademyName, setLeaveAcademyName] = useState<string>('');
  const [isShaking, setIsShaking] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    pushFocus('subpage');
    return () => popFocus();
  }, [pushFocus, popFocus]);

  // 에러 발생 시 흔들리는 애니메이션 트리거
  useEffect(() => {
    if (validationErrors.code) {
      setIsShaking(true);
      const timer = setTimeout(() => {
        setIsShaking(false);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [validationErrors.code]);

  // 에러 상태 - 컴포넌트가 깨지지 않도록 안전하게 처리
  if (error && academies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-full">
        <p className="text-red-500">학원 정보를 불러오는데 실패했습니다.</p>
        <Button
          onClick={() => window.location.reload()}
          className="mt-4"
        >
          다시 시도
        </Button>
      </div>
    );
  }

  // 로딩 상태 처리
  if (isLoading && academies.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-700" />
      </div>
    );
  }

  const handleJoinAcademy = () => {
    if (!joinAcademyCode.trim()) {
      toast.error('학원 코드를 입력해주세요.');
      return;
    }

    setValidationErrors({});
    
    joinAcademyMutation.mutate(
      { code: joinAcademyCode.trim() },
      {
        onSuccess: () => {
          setJoinAcademyCode('');
        },
      }
    );
  };

  const handleLeaveAcademyClick = (academyId: number, academyName: string) => {
    setLeaveAcademyId(academyId);
    setLeaveAcademyName(academyName);
  };

  const handleLeaveAcademyConfirm = () => {
    if (!leaveAcademyId) return;

    setValidationErrors({});
    
    leaveAcademyMutation.mutate(
      { academyId: leaveAcademyId },
      {
        onSuccess: () => {
          setLeaveAcademyId(null);
          setLeaveAcademyName('');
        },
      }
    );
  };

  const handleLeaveModalClose = () => {
    setLeaveAcademyId(null);
    setLeaveAcademyName('');
  };



  return (
    <div className="flex flex-col h-full bg-white max-w-[480px] mx-auto">
      {/* 헤더 - 고정 높이 */}
      <header className="flex-shrink-0 bg-white border-b border-gray-200 py-5 px-5">
        <div>
          <h1 className="text-2xl font-bold text-stone-700">내 학원 관리</h1>
          <p className="text-gray-600 mt-1">가입되어 있는 학원들을 관리하고 새로운 학원에 가입할 수 있습니다.</p>
        </div>
      </header>

      {/* 메인 콘텐츠 - 전체 스크롤 가능 */}
      <main className="flex-1 min-h-0 bg-white px-5 py-4">
        <div className="h-full overflow-y-auto">
          {/* 학원 가입 섹션 */}
          <div className="pb-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Plus className="h-5 w-5" />
                  새 학원 가입
                </CardTitle>
                <CardDescription>
                  학원 코드를 입력하여 새로운 학원에 가입하세요.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="flex-1 space-y-1">
                      <Input
                        placeholder="학원 코드를 입력하세요"
                        value={joinAcademyCode}
                        onChange={(e) => setJoinAcademyCode(e.target.value)}
                        className={`transition-all duration-200 ${
                          validationErrors.code ? 'border-red-500 bg-red-50' : 'border-gray-300'
                        } ${
                          isShaking ? 'animate-shake' : ''
                        }`}
                        onKeyPress={(e) => e.key === 'Enter' && handleJoinAcademy()}
                      />
                      {validationErrors.code && (
                        <p className="text-sm text-red-500 animate-in fade-in duration-200">
                          {validationErrors.code}
                        </p>
                      )}
                    </div>
                    <Button 
                      onClick={handleJoinAcademy} 
                      disabled={joinAcademyMutation.isPending || !joinAcademyCode.trim()}
                      className="min-w-[80px] transition-all duration-300 ease-in-out"
                      size="sm"
                    >
                      {joinAcademyMutation.isPending ? '가입 중...' : '가입'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 내 학원 목록 */}
          <div>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="h-5 w-5" />
                  내가 가입한 학원 ({academies.length})
                </CardTitle>
                <CardDescription>
                  현재 가입되어 있는 학원들의 목록입니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {academies.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>가입한 학원이 없습니다.</p>
                    <p className="text-sm">위에서 학원 코드를 입력하여 가입해보세요.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {academies.map((academy) => (
                      <AcademyCard
                        key={academy.id}
                        academy={{
                          ...academy,
                          code: '',
                          createdAt: academy.joinedAt || academy.createdAt,
                        }}
                        variant="student"
                        showActionButton={true}
                        actionText="탈퇴하기"
                        actionVariant="outline"
                        onAction={() => handleLeaveAcademyClick(academy.id, academy.name)}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* 탈퇴 확인 모달 */}
      <LeaveAcademyModal
        isOpen={!!leaveAcademyId}
        onClose={handleLeaveModalClose}
        onConfirm={handleLeaveAcademyConfirm}
        academyName={leaveAcademyName}
      />
    </div>
  );
} 