'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getMyAcademies, joinAcademy, leaveAcademy, Academy } from '@/api/academy';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, MapPin, Phone, Calendar, Users, Building2, AlertTriangle, X } from 'lucide-react';
import { toast } from 'sonner';
import { useDashboardNavigation } from '@/contexts/DashboardContext';
import { ExpandableText } from '@/components/common';

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
            <span className="font-semibold text-red-600">"{academyName}"</span> 학원에서 탈퇴하시겠습니까?
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
  const router = useRouter();
  const { pushFocus, popFocus } = useDashboardNavigation();
  const [myAcademies, setMyAcademies] = useState<Academy[]>([]);
  const [joinCode, setJoinCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [leaveModal, setLeaveModal] = useState<{
    isOpen: boolean;
    academyId: number | null;
    academyName: string;
  }>({
    isOpen: false,
    academyId: null,
    academyName: '',
  });

  useEffect(() => {
    loadMyAcademies();
    // 컴포넌트가 마운트될 때 포커스를 subpage로 설정
    pushFocus('subpage');
    
    return () => {
      // 컴포넌트가 언마운트될 때 이전 포커스로 복원
      popFocus();
    };
  }, [pushFocus, popFocus]);

  const loadMyAcademies = async () => {
    try {
      setIsLoading(true);
      const response = await getMyAcademies();
      setMyAcademies(response.data);
    } catch (error) {
      console.error('학원 목록 로드 실패:', error);
      toast.error('학원 목록을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinAcademy = async () => {
    if (!joinCode.trim()) {
      toast.error('학원 코드를 입력해주세요.');
      return;
    }

    try {
      setIsJoining(true);
      await joinAcademy({ code: joinCode.trim() });
      toast.success('학원 가입이 완료되었습니다.');
      setJoinCode('');
      loadMyAcademies(); // 목록 새로고침
    } catch (error: any) {
      console.error('학원 가입 실패:', error);
      const message = error.response?.data?.message || '학원 가입에 실패했습니다.';
      toast.error(message);
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeaveAcademyClick = (academyId: number, academyName: string) => {
    setLeaveModal({
      isOpen: true,
      academyId,
      academyName,
    });
  };

  const handleLeaveAcademyConfirm = async () => {
    if (!leaveModal.academyId) return;

    try {
      await leaveAcademy({ academyId: leaveModal.academyId });
      toast.success('학원 탈퇴가 완료되었습니다.');
      loadMyAcademies(); // 목록 새로고침
      setLeaveModal({ isOpen: false, academyId: null, academyName: '' });
    } catch (error: any) {
      console.error('학원 탈퇴 실패:', error);
      const message = error.response?.data?.message || '학원 탈퇴에 실패했습니다.';
      toast.error(message);
    }
  };

  const handleLeaveModalClose = () => {
    setLeaveModal({ isOpen: false, academyId: null, academyName: '' });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
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
            <div className="flex gap-3">
              <Input
                placeholder="학원 코드를 입력하세요"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                className="flex-1"
                onKeyPress={(e) => e.key === 'Enter' && handleJoinAcademy()}
              />
              <Button 
                onClick={handleJoinAcademy} 
                disabled={isJoining || !joinCode.trim()}
                className="min-w-[80px] transition-all duration-300 ease-in-out"
                size="sm"
              >
                {isJoining ? '가입 중...' : '가입'}
              </Button>
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
              내가 가입한 학원 ({myAcademies.length})
            </CardTitle>
            <CardDescription>
              현재 가입되어 있는 학원들의 목록입니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : myAcademies.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>가입한 학원이 없습니다.</p>
                <p className="text-sm">위에서 학원 코드를 입력하여 가입해보세요.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {myAcademies.map((academy) => (
                  <Card key={academy.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{academy.name}</CardTitle>
                          <Badge variant="secondary" className="mt-2">
                            {academy.code}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="h-4 w-4" />
                          <span className="truncate">{academy.address}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone className="h-4 w-4" />
                          <span>{academy.phoneNumber}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span>가입일: {formatDate(academy.createdAt)}</span>
                        </div>
                      </div>
                      
                      {academy.description && (
                        <ExpandableText 
                          text={academy.description} 
                          lineClamp={3}
                        />
                      )}

                      <Separator />

                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => handleLeaveAcademyClick(academy.id, academy.name)}
                        >
                          탈퇴하기
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 탈퇴 확인 모달 */}
      <LeaveAcademyModal
        isOpen={leaveModal.isOpen}
        onClose={handleLeaveModalClose}
        onConfirm={handleLeaveAcademyConfirm}
        academyName={leaveModal.academyName}
      />
    </div>
  );
} 