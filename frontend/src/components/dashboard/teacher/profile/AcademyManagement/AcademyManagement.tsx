'use client';

import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Building2, Users } from 'lucide-react';
import { toast } from 'sonner';
import { useDashboardNavigation } from '@/contexts/DashboardContext';
import { AnimatedCard } from '@/components/common/AnimatedCard';

// 커스텀 훅들
import { useAcademyManagement } from '@/hooks/useAcademyManagement';
import { useAcademyForm } from '@/hooks/useAcademyForm';
import { usePhoneVerification } from '@/hooks/usePhoneVerification';

// 분리된 컴포넌트들
import { CreateAcademyModal } from './CreateAcademyModal';
import { WithdrawalConfirmModal } from './WithdrawalConfirmModal';
import { AcademyForm } from './AcademyForm';
import { AcademyCard } from './AcademyCard';
import { JoinAcademyCard } from './JoinAcademyCard';

interface AcademyManagementProps {
  onBack?: () => void;
}

export default function AcademyManagement({ onBack }: AcademyManagementProps) {
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
    handleJoinAcademy,
    handleWithdrawalConfirm,
    handleCreateAcademy,
    handleUpdateAcademy,
    isAcademyAdmin,
  } = useAcademyManagement();

  const {
    isExpanded,
    setIsExpanded,
    isEditMode,
    editingAcademy,
    formData,
    setFormData,
    resetForm,
    handleEditAcademy,
    handleCancel,
    isFormValid,
    getButtonText,
  } = useAcademyForm();

  const {
    isPhoneVerificationRequired,
    isPhoneVerified,
    resetVerification,
  } = usePhoneVerification({ 
    phoneNumber: formData.phoneNumber || '',
    isEditMode,
    originalPhoneNumber: editingAcademy?.phoneNumber || ''
  });

  useEffect(() => {
    // 컴포넌트가 마운트될 때 포커스를 subpage로 설정
    pushFocus('subpage');
    
    return () => {
      // 컴포넌트가 언마운트될 때 이전 포커스로 복원
      popFocus();
    };
  }, [pushFocus, popFocus]);

  const handleToggleExpand = () => {
    if (isExpanded) {
      // 확장된 상태에서는 폼 제출
      handleFormSubmit();
    } else {
      // 축소된 상태에서는 확장
      setIsExpanded(true);
      pushFocus('subpage');
    }
  };

  const handleFormSubmit = () => {
    if (!isFormValid()) {
      toast.error('학원명과 학원 코드는 필수입니다.');
      return;
    }
    
    // 전화번호 인증이 필요한데 아직 인증되지 않은 경우
    if (isPhoneVerificationRequired && !isPhoneVerified) {
      toast.error('전화번호 인증을 완료해주세요.');
      return;
    }
    
    if (isEditMode) {
      handleUpdateAcademy(formData);
    } else {
      handleCreateAcademy(formData);
    }
    
    // 성공 시 폼 초기화
    setIsExpanded(false);
    resetForm();
    resetVerification();
  };

  const handleEditClick = () => {
    if (!currentAcademy) return;
    handleEditAcademy(currentAcademy);
  };

  return (
    <div className="flex overflow-hidden flex-col pb-2 mx-auto w-full bg-white max-w-[480px] py-5 relative">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-5 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-700">내 학원 관리</h1>
          <p className="text-gray-600 mt-1">소속된 학원을 관리하고 새로운 학원에 가입하거나 생성할 수 있습니다.</p>
        </div>
      </div>

      <Separator className="mx-5" />

      {/* 학원 생성/수정 섹션 */}
      <div className="px-5 py-4">
        <AnimatedCard
          isExpanded={isExpanded}
          onToggle={handleToggleExpand}
          onCancel={handleCancel}
          buttonText={getButtonText()}
          cancelButtonText="취소"
          isButtonDisabled={isExpanded && (!isFormValid() || (isPhoneVerificationRequired && !isPhoneVerified))}
        >
          <AcademyForm
            formData={formData}
            setFormData={setFormData}
            isEditMode={isEditMode}
            editingAcademy={editingAcademy}
          />
        </AnimatedCard>
      </div>

      {/* 새 학원 가입 섹션 */}
      <div className="px-5 py-4">
        <JoinAcademyCard
          joinCode={joinCode}
          setJoinCode={setJoinCode}
          isJoining={isJoining}
          onJoin={handleJoinAcademy}
        />
      </div>

      {/* 내 학원 섹션 */}
      <div className="px-5 pb-6">
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
                isAdmin={isAcademyAdmin()}
                onEdit={handleEditClick}
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
      />
    </div>
  );
} 