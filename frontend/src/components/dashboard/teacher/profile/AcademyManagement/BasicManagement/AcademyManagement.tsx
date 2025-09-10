'use client';

import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Users } from 'lucide-react';

import { useDashboardNavigation } from '@/contexts/DashboardContext';

// 커스텀 훅들
import { useTeacherAcademyManagement } from '@/hooks/teacher/academy_management/useTeacherAcademyManagement';
import { useAcademyForm } from '@/hooks/useAcademyForm';
import { usePhoneVerification } from '@/hooks/usePhoneVerification';

// 분리된 컴포넌트들
import { WithdrawalConfirmModal } from './WithdrawalConfirmModal';
import { AcademyCard } from '@/components/common/AcademyCard';
import { JoinAcademyCard } from './JoinAcademyCard';

export default function AcademyManagement() {
  const { pushFocus, popFocus } = useDashboardNavigation();
  
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
    loadCurrentAcademy,
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
    
    loadCurrentAcademy();
    
    return () => {
      popFocus();
    };
  }, [pushFocus, popFocus, loadCurrentAcademy]);

  return (
    <div className="flex overflow-hidden flex-col pb-2 mx-auto w-full bg-white max-w-[480px] py-2 relative">

      {/* 새 학원 가입 섹션 */}
      <div className="px-5 py-2">
        <JoinAcademyCard
          joinCode={joinCode}
          setJoinCode={setJoinCode}
          isJoining={isJoining}
          onJoin={handleJoinAcademy}
        />
      </div>

      {/* 내 학원 섹션 */}
      <div className="px-5 pb-6 py-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5" />
              내 학원
            </CardTitle>
            <CardDescription>
              현재 소속되어 있는 학원 정보입니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
                showTeamCode={true}
                showActionButton={true}
                actionText="탈퇴하기"
                actionVariant="outline"
                onAction={handleLeaveAcademy}
              />
            )}
          </CardContent>
        </Card>
      </div>

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