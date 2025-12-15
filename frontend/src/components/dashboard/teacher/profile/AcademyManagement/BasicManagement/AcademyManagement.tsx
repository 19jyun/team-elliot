'use client';

import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Users } from 'lucide-react';

import { useApp } from '@/contexts/AppContext';

// 커스텀 훅들
import { useTeacherAcademyManagement } from '@/hooks/teacher/academy_management/useTeacherAcademyManagement';
import { useAcademyForm } from '@/hooks/useAcademyForm';
import { usePhoneVerification } from '@/hooks/usePhoneVerification';

// 분리된 컴포넌트들
import { WithdrawalConfirmModal } from './WithdrawalConfirmModal';
import { AcademyCard } from '@/components/common/AcademyCard';
import { JoinAcademyCard } from './JoinAcademyCard';
import { PendingAcademyCard } from '../PendingAcademyCard';

export default function AcademyManagement() {
  const { ui } = useApp();
  const { pushFocus, popFocus } = ui;
  
  // 커스텀 훅들
  const {
    currentAcademy,
    isLoading,
    joinCode,
    setJoinCode,
    isJoining,
    withdrawalModal,
    setWithdrawalModal,
    withdrawalType,
    academyStatus,
    isLoadingStatus,
    handleJoinAcademy,
    handleWithdrawalConfirm,
    handleLeaveAcademy,
  } = useTeacherAcademyManagement();

  const {
    isEditMode,
    editingAcademy,
    formData,
  } = useAcademyForm();

  const {
  } = usePhoneVerification({ 
    phoneNumber: formData.phoneNumber || '',
    isEditMode,
    originalPhoneNumber: editingAcademy?.phoneNumber || ''
  });


  useEffect(() => {
    pushFocus('subpage');
    
    // React Query가 자동으로 데이터를 로드하므로 수동 호출 불필요
    // 필요시 loadAcademyStatus()를 호출하여 refetch 가능
    
    return () => {
      popFocus();
    };
  }, [pushFocus, popFocus]);

  return (
    <div className="flex flex-col h-full bg-white max-w-[480px] mx-auto">
      {/* 헤더 - 고정 높이 */}
      <header className="flex-shrink-0 bg-white border-b border-gray-200 py-5 px-5">
        <div>
          <h1 className="text-2xl font-bold text-stone-700">내 학원 관리</h1>
          <p className="text-gray-600 mt-1">소속된 학원을 관리하고 새로운 학원에 가입할 수 있습니다.</p>
        </div>
      </header>

      {/* 메인 콘텐츠 - 전체 스크롤 가능 */}
      <main className="flex-1 min-h-0 bg-white px-5 py-4">
        <div className="h-full overflow-y-auto">
          {/* 가입 신청 대기 중인 학원 카드 */}
          {academyStatus?.status === 'PENDING' && academyStatus.joinRequest && (
            <div className="pb-6">
              <PendingAcademyCard
                academyName={academyStatus.joinRequest.academyName}
                message={academyStatus.joinRequest.message}
                createdAt={academyStatus.joinRequest.createdAt}
              />
            </div>
          )}

          {/* 새 학원 가입 섹션 - 가입 신청이 없을 때만 표시 */}
          {academyStatus?.status !== 'PENDING' && (
            <div className="pb-6">
              <JoinAcademyCard
                joinCode={joinCode}
                setJoinCode={setJoinCode}
                isJoining={isJoining}
                onJoin={handleJoinAcademy}
              />
            </div>
          )}

          {/* 내 학원 섹션 */}
          <div>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="h-5 w-5" />
                  내 학원
                </CardTitle>
                <CardDescription>
                  {academyStatus?.status === 'PENDING' 
                    ? '가입 신청이 진행 중입니다.' 
                    : '현재 소속되어 있는 학원 정보입니다.'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading || isLoadingStatus ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : academyStatus?.status === 'PENDING' ? (
                  <div className="text-center py-8 text-[#AC9592]">
                    <Building2 className="h-12 w-12 mx-auto mb-4 text-[#AC9592]/60" />
                    <p>가입 신청이 진행 중입니다.</p>
                    <p className="text-sm">위에서 신청 상태를 확인할 수 있습니다.</p>
                  </div>
                ) : !currentAcademy ? (
                  <div className="text-center py-8 text-gray-500">
                    <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>소속된 학원이 없습니다.</p>
                    <p className="text-sm">위에서 학원에 가입하거나 새 학원을 생성해보세요.</p>
                  </div>
                ) : (
                  <AcademyCard
                    academy={currentAcademy}
                    variant="teacher"
                    showTeamCode={false}
                    showActionButton={true}
                    actionText="탈퇴하기"
                    actionVariant="outline"
                    onAction={handleLeaveAcademy}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* 탈퇴 확인 모달 */}
      <WithdrawalConfirmModal
        isOpen={withdrawalModal}
        onClose={() => setWithdrawalModal(false)}
        onConfirm={handleWithdrawalConfirm}
        withdrawalType={withdrawalType}
      />
    </div>
  );
} 