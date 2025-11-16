'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Building, CreditCard, Edit, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { useStudentRefundAccount } from '@/hooks/queries/student/useStudentRefundAccount';
import { useUpdateStudentRefundAccount } from '@/hooks/mutations/student/useUpdateStudentRefundAccount';
import { UpdateStudentRefundAccountRequest } from '@/types/api/student';
import { useSession } from '@/lib/auth/AuthProvider';
import { BANKS } from '@/constants/banks';
import { processBankInfo, getBankNameToSave } from '@/utils/bankUtils';
import { InfoBubble } from '@/components/common/InfoBubble';
import { StudentRefundAccount } from '@/types/api/student';

export function RefundAccountManagement() {
  const [isEditing, setIsEditing] = useState(false);
  const [editedInfo, setEditedInfo] = useState<UpdateStudentRefundAccountRequest>({});
  const [customBankName, setCustomBankName] = useState(''); // 기타 은행명 입력
  
  // Validation 관련 상태
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isShaking, setIsShaking] = useState(false);
  
  // React Query 기반 데이터 관리
  const { data: refundAccountData, isLoading: accountLoading, error: accountError } = useStudentRefundAccount();
  const refundAccount = refundAccountData as StudentRefundAccount | null | undefined;
  const updateRefundAccountMutation = useUpdateStudentRefundAccount();
  
  const isLoading = accountLoading || updateRefundAccountMutation.isPending;

  // refundAccount 데이터가 로드되면 editedInfo 업데이트 (편집 모드가 아닐 때만)
  useEffect(() => {
    if (refundAccount && !isEditing) {
      setEditedInfo({
        refundAccountHolder: refundAccount.refundAccountHolder || '',
        refundAccountNumber: refundAccount.refundAccountNumber || '',
        refundBankName: refundAccount.refundBankName || '',
      });
    }
  }, [refundAccount, isEditing]);

  const handleEdit = () => {
    if (refundAccount) {
      // processBankInfo를 사용하여 은행명 처리
      const { selectedBank, customBankName: customBank } = processBankInfo(
        refundAccount.refundBankName
      );
      
      setEditedInfo({
        refundAccountHolder: refundAccount.refundAccountHolder || '',
        refundAccountNumber: refundAccount.refundAccountNumber || '',
        refundBankName: selectedBank,
      });
      
      setCustomBankName(customBank); // 기타 은행명 설정
    }
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedInfo({
      refundAccountHolder: refundAccount?.refundAccountHolder || '',
      refundAccountNumber: refundAccount?.refundAccountNumber || '',
      refundBankName: refundAccount?.refundBankName || '',
    });
  };

  const handleSave = async () => {
    // 실제 은행명 결정 (getBankNameToSave 사용)
    const finalBankName = getBankNameToSave(editedInfo.refundBankName || '', customBankName);
    
    // 프론트엔드 validation 수행
    const bankNameValidation = validateBankName(finalBankName || '');
    const accountNumberValidation = validateAccountNumber(editedInfo.refundAccountNumber || '');
    const accountHolderValidation = validateAccountHolder(editedInfo.refundAccountHolder || '');
    
    // 모든 validation 에러 수집
    const allErrors: Record<string, string> = {};
    
    if (!bankNameValidation.isValid) {
      allErrors.refundBankName = bankNameValidation.message;
    }
    
    if (!accountNumberValidation.isValid) {
      allErrors.refundAccountNumber = accountNumberValidation.message;
    }
    
    if (!accountHolderValidation.isValid) {
      allErrors.refundAccountHolder = accountHolderValidation.message;
    }
    
    // validation 에러가 있으면 처리
    if (Object.keys(allErrors).length > 0) {
      setValidationErrors(allErrors);
      setIsShaking(true);
      setTimeout(() => {
        setIsShaking(false);
        // 1초 후 validation 에러도 자동으로 제거
        setTimeout(() => {
          setValidationErrors({});
        }, 1000);
      }, 1000);
      return;
    }

    setValidationErrors({});
    
    // 실제 저장 시 finalBankName 사용
    updateRefundAccountMutation.mutate(
      {
        ...editedInfo,
        refundBankName: finalBankName,
      },
      {
        onSuccess: () => {
          setIsEditing(false);
        },
      }
    );
  };

  const handleInputChange = (field: keyof UpdateStudentRefundAccountRequest, value: string) => {
    setEditedInfo(prev => ({
      ...prev,
      [field]: value,
    }));

    // 입력 필드 변경 시 해당 필드의 validation 에러 초기화
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // Validation 함수들
  const validateBankName = (value: string) => {
    if (!value.trim()) {
      return { isValid: false, message: '은행명을 입력해주세요.' };
    }
    if (value.length > 50) {
      return { isValid: false, message: '은행명은 50자 이하여야 합니다.' };
    }
    if (!/^[가-힣a-zA-Z\s]+$/.test(value)) {
      return { isValid: false, message: '은행명은 한글, 영문, 공백만 사용 가능합니다.' };
    }
    return { isValid: true, message: '' };
  };

  const validateAccountNumber = (value: string) => {
    if (!value.trim()) {
      return { isValid: false, message: '계좌번호를 입력해주세요.' };
    }
    if (value.length > 20) {
      return { isValid: false, message: '계좌번호는 20자 이하여야 합니다.' };
    }
    if (!/^[0-9-]+$/.test(value)) {
      return { isValid: false, message: '계좌번호는 숫자와 하이픈(-)만 사용 가능합니다.' };
    }
    return { isValid: true, message: '' };
  };

  const validateAccountHolder = (value: string) => {
    if (!value.trim()) {
      return { isValid: false, message: '예금주를 입력해주세요.' };
    }
    if (value.length > 50) {
      return { isValid: false, message: '예금주는 50자 이하여야 합니다.' };
    }
    if (!/^[가-힣a-zA-Z\s]+$/.test(value)) {
      return { isValid: false, message: '예금주는 한글, 영문, 공백만 사용 가능합니다.' };
    }
    return { isValid: true, message: '' };
  };

  if (accountError && !refundAccount) {
    return (
      <div className="flex flex-col items-center justify-center min-h-full">
        <p className="text-red-500">환불 계좌 정보를 불러오는데 실패했습니다.</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-stone-700 text-white rounded-lg hover:bg-stone-800"
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col pb-2 mx-auto w-full bg-white max-w-[480px] py-5 h-full overflow-y-auto">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-5 pb-4 flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-stone-700">환불 계좌 정보 관리</h1>
          <p className="text-gray-600 mt-1">환불을 위한 은행 계좌 정보를 관리할 수 있습니다.</p>
        </div>
        <Building className="h-8 w-8 text-stone-700" />
      </div>

      <Separator className="mx-5 flex-shrink-0" />

      {/* 환불 계좌 정보 카드 - 스크롤 가능한 컨테이너 */}
      <div className="px-5 py-4 flex-1">
        <div className="max-h-[calc(100vh-260px)] overflow-y-auto">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CreditCard className="h-5 w-5" />
                  환불 계좌 정보
                </CardTitle>
                {!isEditing ? (
                  <Button
                    onClick={handleEdit}
                    variant="outline"
                    size="sm"
                    disabled={isLoading}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    수정
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      onClick={handleCancel}
                      variant="outline"
                      size="sm"
                      disabled={isLoading}
                    >
                      <X className="h-4 w-4 mr-2" />
                      취소
                    </Button>
                    <Button
                      onClick={handleSave}
                      size="sm"
                      disabled={isLoading}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      저장
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* 은행명 */}
              <div className="space-y-2">
                {isEditing ? (
                  <div className="relative">
                    <InfoBubble
                      label="은행명"
                      type="select"
                      selectValue={editedInfo.refundBankName || ''}
                      onSelectChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleInputChange('refundBankName', e.target.value)}
                      options={[
                        { value: '', label: '은행명 선택' },
                        ...BANKS
                      ]}
                      className={isShaking && (validationErrors.refundBankName || validationErrors.refundBankName) ? 'animate-shake border-red-500' : ''}
                    />
                    {(validationErrors.refundBankName || validationErrors.refundBankName) && (
                      <p className="text-red-500 text-xs mt-1 ml-2 animate-in fade-in">
                        {validationErrors.refundBankName || validationErrors.refundBankName}
                      </p>
                    )}
                  </div>
                ) : (
                  <InfoBubble
                    label="은행명"
                    value={refundAccount?.refundBankName || '미입력'}
                  />
                )}
              </div>

              {/* 기타 은행명 입력 (기타 선택 시에만 표시) */}
              {isEditing && editedInfo.refundBankName === '기타' && (
                <div className="space-y-2">
                  <div className="relative">
                    <InfoBubble
                      label="은행명 입력"
                      type="input"
                      inputValue={customBankName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomBankName(e.target.value)}
                      placeholder="은행명을 입력하세요"
                      className={isShaking && !customBankName.trim() ? 'animate-shake border-red-500' : ''}
                    />
                    {isShaking && !customBankName.trim() && (
                      <p className="text-red-500 text-xs mt-1 ml-2 animate-in fade-in">
                        은행명을 입력해주세요
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* 계좌번호 */}
              <div className="space-y-2">
                {isEditing ? (
                  <div className="relative">
                    <InfoBubble
                      label="계좌번호"
                      type="input"
                      inputValue={editedInfo.refundAccountNumber || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('refundAccountNumber', e.target.value)}
                      placeholder="계좌번호 입력"
                      className={isShaking && (validationErrors.refundAccountNumber || validationErrors.refundAccountNumber) ? 'animate-shake border-red-500' : ''}
                    />
                    {(validationErrors.refundAccountNumber || validationErrors.refundAccountNumber) && (
                      <p className="text-red-500 text-xs mt-1 ml-2 animate-in fade-in">
                        {validationErrors.refundAccountNumber || validationErrors.refundAccountNumber}
                      </p>
                    )}
                  </div>
                ) : (
                  <InfoBubble
                    label="계좌번호"
                    value={refundAccount?.refundAccountNumber || '미입력'}
                    valueClassName="font-mono"
                  />
                )}
              </div>

              {/* 예금주 */}
              <div className="space-y-2">
                {isEditing ? (
                  <div className="relative">
                    <InfoBubble
                      label="예금주"
                      type="input"
                      inputValue={editedInfo.refundAccountHolder || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('refundAccountHolder', e.target.value)}
                      placeholder="예금주 입력"
                      className={isShaking && (validationErrors.refundAccountHolder || validationErrors.refundAccountHolder) ? 'animate-shake border-red-500' : ''}
                    />
                    {(validationErrors.refundAccountHolder || validationErrors.refundAccountHolder) && (
                      <p className="text-red-500 text-xs mt-1 ml-2 animate-in fade-in">
                        {validationErrors.refundAccountHolder || validationErrors.refundAccountHolder}
                      </p>
                    )}
                  </div>
                ) : (
                  <InfoBubble
                    label="예금주"
                    value={refundAccount?.refundAccountHolder || '미입력'}
                  />
                )}
              </div>

              <Separator />

              {/* 안내 메시지 */}
              <div className="bg-[#f5f3f2] border border-[#ac9592] rounded-lg p-4">
                <h4 className="text-sm font-medium text-[#8b6f6b] mb-2">안내사항</h4>
                <ul className="text-xs text-[#7a5f5b] space-y-1">
                  <li>• 이 정보는 환불 요청 시 환불금을 받을 계좌입니다.</li>
                  <li>• 정확한 은행 정보를 입력해주세요.</li>
                  <li>• 계좌번호는 하이픈(-) 없이 입력해도 됩니다.</li>
                  <li>• 정보 변경 시 즉시 반영됩니다.</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
