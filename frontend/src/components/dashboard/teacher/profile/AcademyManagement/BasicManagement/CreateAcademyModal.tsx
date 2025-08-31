'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PhoneInput } from '@/components/ui/phone-input';
import { Building2, X } from 'lucide-react';
import { CreateAcademyRequest } from '@/types/api/teacher';
import { toast } from 'sonner';
import { useDashboardNavigation } from '@/contexts/DashboardContext';
import { usePhoneVerification } from '@/hooks/usePhoneVerification';
import { CloseCircleIcon } from '@/components/icons';

interface CreateAcademyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: CreateAcademyRequest) => void;
}

export function CreateAcademyModal({ isOpen, onClose, onConfirm }: CreateAcademyModalProps) {
  const { pushFocus, popFocus } = useDashboardNavigation();
  const [formData, setFormData] = useState<CreateAcademyRequest>({
    name: '',
    code: '',
    description: '',
    address: '',
    phoneNumber: '',
  });

  const {
    isPhoneVerificationRequired,
    isPhoneVerified,
    verificationCode,
    setVerificationCode,
    timeLeft,
    isTimerRunning,
    handleVerifyPhone,
    handleClearVerificationCode,
    resetVerification,
    formatTime,
  } = usePhoneVerification({ phoneNumber: formData.phoneNumber || '' });

  useEffect(() => {
    if (isOpen) {
      pushFocus('modal');
    } else {
      popFocus();
    }
  }, [isOpen, pushFocus, popFocus]);

  const handleClose = () => {
    popFocus();
    onClose();
    // 모달 닫을 때 인증 상태 초기화
    resetVerification();
  };

  const handleConfirm = () => {
    if (!formData.name.trim() || !formData.code.trim()) {
      toast.error('학원명과 학원 코드는 필수입니다.');
      return;
    }
    
    // 전화번호 인증이 필요한데 아직 인증되지 않은 경우
    if (isPhoneVerificationRequired && !isPhoneVerified) {
      toast.error('전화번호 인증을 완료해주세요.');
      return;
    }
    
    popFocus();
    onConfirm(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 transform transition-all max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">새 학원 생성</h3>
          </div>
          <button
            onClick={handleClose}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 내용 */}
        <div className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">학원명 *</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="학원명을 입력하세요"
              className="w-full"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">학원 코드 *</label>
            <Input
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              placeholder="학원 코드를 입력하세요"
              className="w-full"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">설명</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="학원에 대한 설명을 입력하세요"
              className="w-full"
              rows={3}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">주소</label>
            <Input
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="학원 주소를 입력하세요"
              className="w-full"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">연락처</label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <PhoneInput
                  value={formData.phoneNumber || ''}
                  onChange={(value) => setFormData({ ...formData, phoneNumber: value })}
                  placeholder="연락처를 입력하세요"
                  className="flex-1"
                />
                {isPhoneVerificationRequired && !isPhoneVerified && (
                  <Button
                    onClick={handleVerifyPhone}
                    size="sm"
                    disabled={isTimerRunning}
                    className="whitespace-nowrap w-24"
                  >
                    인증
                  </Button>
                )}
                {isPhoneVerified && (
                  <div className="flex items-center px-3 py-2 text-sm text-green-600 bg-green-50 rounded-md w-24 justify-center">
                    <span>✓ 인증완료</span>
                  </div>
                )}
              </div>
              
              {/* 인증번호 입력 필드 */}
              {isPhoneVerificationRequired && !isPhoneVerified && isTimerRunning && (
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Input
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      placeholder="인증번호 6자리"
                      className="pr-20"
                      maxLength={6}
                    />
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                      <button
                        onClick={handleClearVerificationCode}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <CloseCircleIcon 
                          width={16} 
                          height={16}
                        />
                      </button>
                      <div className="text-sm font-mono" style={{ color: '#573B30', fontFamily: 'Pretendard Variable' }}>
                        {formatTime(timeLeft)}
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={handleVerifyPhone}
                    size="sm"
                    disabled={verificationCode.length < 6}
                    className="w-24"
                  >
                    확인
                  </Button>
                </div>
              )}
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
            onClick={handleConfirm}
            className="flex-1"
            disabled={!formData.name.trim() || !formData.code.trim() || (isPhoneVerificationRequired && !isPhoneVerified)}
          >
            생성하기
          </Button>
        </div>
      </div>
    </div>
  );
} 