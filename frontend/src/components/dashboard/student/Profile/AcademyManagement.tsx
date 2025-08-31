'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Plus, Users, Building2, AlertTriangle, X } from 'lucide-react';
import { toast } from 'sonner';
import { useDashboardNavigation } from '@/contexts/DashboardContext';
import { AcademyCard } from '@/components/common/AcademyCard';
import { useStudentApi } from '@/hooks/student/useStudentApi';
import { useApiError } from '@/hooks/useApiError';

interface LeaveAcademyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  academyName: string;
}

function LeaveAcademyModal({ isOpen, onClose, onConfirm, academyName }: LeaveAcademyModalProps) {
  const { pushFocus, popFocus } = useDashboardNavigation();

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
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 transform transition-all">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-full">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">학원 탈퇴 확인</h3>
          </div>
          <button
            onClick={handleClose}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 내용 */}
        <div className="p-6">
          <p className="text-gray-700 mb-4">
            <span className="font-semibold text-red-600">{academyName}</span> 학원에서 탈퇴하시겠습니까?
          </p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-red-700">
                <p className="font-medium mb-1">탈퇴 시 주의사항:</p>
                <ul className="space-y-1 text-xs">
                  <li>• 해당 학원의 모든 수강 정보가 삭제됩니다</li>
                  <li>• 진행 중인 수업에 대한 접근이 제한됩니다</li>
                  <li>• 탈퇴 후 재가입이 필요합니다</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* 버튼 */}
        <div className="flex gap-3 p-6 border-t border-gray-200">
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
  const { pushFocus, popFocus } = useDashboardNavigation();
  const { academies, isLoading, error, loadAcademies, joinAcademyApi, leaveAcademyApi } = useStudentApi();
  
  // 기존 useApiError 훅 사용 (이미 완성도가 높음)
  const { handleApiError, fieldErrors, clearErrors } = useApiError();


  const [joinAcademyCode, setJoinAcademyCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [leaveAcademyId, setLeaveAcademyId] = useState<number | null>(null);
  const [leaveAcademyName, setLeaveAcademyName] = useState<string>('');
  const [_isLeaving, setIsLeaving] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  useEffect(() => {
    pushFocus('subpage');
    return () => popFocus();
  }, [pushFocus, popFocus]);

  // 컴포넌트 마운트 시 학원 목록 로드
  useEffect(() => {
    loadAcademies();
  }, [loadAcademies]);

  // 학원 코드 입력 시 에러 초기화 (새로 타이핑할 때만)
  const [previousCode, setPreviousCode] = useState('');
  
  useEffect(() => {
    // 이전 코드와 현재 코드가 다르고, 현재 코드가 더 길 때만 에러 제거
    if (fieldErrors.code && joinAcademyCode.length > previousCode.length) {
      clearErrors();
    }
    setPreviousCode(joinAcademyCode);
  }, [joinAcademyCode, fieldErrors.code, clearErrors, previousCode]);

  // 에러 발생 시 흔들리는 애니메이션 트리거
  useEffect(() => {
    if (fieldErrors.code) {
      setIsShaking(true);
      const timer = setTimeout(() => {
        setIsShaking(false);
      }, 1000); // 1초 후 애니메이션 종료
      
      return () => clearTimeout(timer);
    }
  }, [fieldErrors.code]);

  // 에러 상태 - 컴포넌트가 깨지지 않도록 안전하게 처리
  if (error && academies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-full">
        <p className="text-red-500">학원 정보를 불러오는데 실패했습니다.</p>
        <Button
          onClick={() => {
            clearErrors();
            loadAcademies();
          }}
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

  const handleJoinAcademy = async () => {
    if (!joinAcademyCode.trim()) {
      toast.error('학원 코드를 입력해주세요.');
      return;
    }

    try {
      setIsJoining(true);
      
      await joinAcademyApi({ code: joinAcademyCode.trim() });
      
      toast.success('학원 가입이 완료되었습니다.');
      setJoinAcademyCode('');
      
         } catch (error) {
       // 컴포넌트에서 시각적 피드백을 제공하므로 toast 비활성화
       handleApiError(error, { disableToast: true });

     } finally {
      setIsJoining(false);
    }
  };

  const handleLeaveAcademyClick = (academyId: number, academyName: string) => {
    setLeaveAcademyId(academyId);
    setLeaveAcademyName(academyName);
  };

  const handleLeaveAcademyConfirm = async () => {
    if (!leaveAcademyId) return;

    try {
      setIsLeaving(true);
      
      await leaveAcademyApi({ academyId: leaveAcademyId });
      
      // 성공 시 처리
      toast.success('학원 탈퇴가 완료되었습니다.');
      setLeaveAcademyId(null);
      setLeaveAcademyName('');
      
    } catch (error) {
      // 에러 처리
      console.error('학원 탈퇴 실패:', error);
      handleApiError(error);
      
    } finally {
      setIsLeaving(false);
    }
  };

  const handleLeaveModalClose = () => {
    setLeaveAcademyId(null);
    setLeaveAcademyName('');
  };



  return (
    <div className="flex overflow-hidden flex-col pb-2 mx-auto w-full bg-white max-w-[480px] py-5 relative">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-5 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-700">내 학원 관리</h1>
          <p className="text-gray-600 mt-1">가입되어 있는 학원들을 관리하고 새로운 학원에 가입할 수 있습니다.</p>
        </div>
      </div>

      <Separator className="mx-5" />

      {/* 학원 가입 섹션 */}
      <div className="px-5 py-4">
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
                       fieldErrors.code ? 'border-red-500 bg-red-50' : 'border-gray-300'
                     } ${
                       isShaking ? 'animate-shake' : ''
                     }`}
                     onKeyPress={(e) => e.key === 'Enter' && handleJoinAcademy()}
                   />
                                     {fieldErrors.code && (
                     <p className="text-sm text-red-500 animate-in fade-in duration-200">
                       {fieldErrors.code}
                     </p>
                   )}
                </div>
                <Button 
                  onClick={handleJoinAcademy} 
                  disabled={isJoining || !joinAcademyCode.trim()}
                  className="min-w-[80px] transition-all duration-300 ease-in-out"
                  size="sm"
                >
                  {isJoining ? '가입 중...' : '가입'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 내 학원 목록 */}
      <div className="px-5 pb-6">
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
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {academies.map((academy: any) => (
                  <AcademyCard
                    key={academy.id}
                    academy={academy}
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