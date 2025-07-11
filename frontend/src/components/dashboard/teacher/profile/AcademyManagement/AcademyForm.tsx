'use client';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { PhoneInput } from '@/components/ui/phone-input';
import { CreateAcademyRequest } from '@/types/api/teacher';
import { usePhoneVerification } from '@/hooks/usePhoneVerification';

interface AcademyFormProps {
  formData: CreateAcademyRequest;
  setFormData: (data: CreateAcademyRequest) => void;
  isEditMode: boolean;
  editingAcademy: any;
}

export function AcademyForm({ formData, setFormData, isEditMode, editingAcademy }: AcademyFormProps) {
  const {
    isPhoneVerificationRequired,
    isPhoneVerified,
    verificationCode,
    setVerificationCode,
    timeLeft,
    isTimerRunning,
    handleVerifyPhone,
    handleClearVerificationCode,
    formatTime,
  } = usePhoneVerification({ 
    phoneNumber: formData.phoneNumber || '',
    isEditMode,
    originalPhoneNumber: editingAcademy?.phoneNumber || ''
  });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
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
            disabled={isEditMode} // 수정 모드에서는 코드 변경 불가
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
          <label className="text-sm font-medium text-gray-700 mb-2 block">전화번호</label>
          <div className="space-y-2">
            <div className="flex gap-2">
              <PhoneInput
                value={formData.phoneNumber || ''}
                onChange={(value) => setFormData({ ...formData, phoneNumber: value })}
                placeholder="전화번호를 입력하세요"
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
                      <img 
                        src="/icons/close-circle.svg" 
                        alt="인증번호 지우기" 
                        width="16" 
                        height="16"
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
      </div>
    </div>
  );
} 