'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Building, CreditCard, Edit, Save, X } from 'lucide-react';
import { usePrincipalProfile } from '@/hooks/queries/principal/usePrincipalProfile';
import { useUpdatePrincipalProfile } from '@/hooks/mutations/principal/useUpdatePrincipalProfile';
import { UpdatePrincipalProfileRequest, PrincipalProfile } from '@/types/api/principal';
import { validatePrincipalBankName, validatePrincipalAccountNumber, validatePrincipalAccountHolder } from '@/utils/validation';
import { BANKS } from '@/constants/banks';
import { processBankInfo, getBankNameToSave } from '@/utils/bankUtils';
import { InfoBubble } from '@/components/common/InfoBubble';

export function PrincipalBankInfoManagement() {
  const [isEditing, setIsEditing] = useState(false);
  const [editedInfo, setEditedInfo] = useState<UpdatePrincipalProfileRequest>({});
  const [customBankName, setCustomBankName] = useState(''); // 기타 은행명 입력
  
  // Validation 관련 상태
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isShaking, setIsShaking] = useState(false);
  
  // React Query 기반 데이터 관리
  const { data: profileData, isLoading: profileLoading, error, refetch } = usePrincipalProfile();
  const profile = profileData as PrincipalProfile | null | undefined;
  const updateProfileMutation = useUpdatePrincipalProfile();
  
  const isLoading = profileLoading || updateProfileMutation.isPending;

  // profile 데이터가 로드되면 editedInfo 업데이트 (편집 모드가 아닐 때만)
  useEffect(() => {
    if (profile && !isEditing) {
      setEditedInfo({
        bankName: profile.bankName || '',
        accountNumber: profile.accountNumber || '',
        accountHolder: profile.accountHolder || '',
      });
    }
  }, [profile, isEditing]);

  const handleEdit = () => {
    if (profile) {
      // processBankInfo를 사용하여 은행명 처리
      const { selectedBank, customBankName: customBank } = processBankInfo(
        profile.bankName
      );
      
      setEditedInfo({
        bankName: selectedBank,
        accountNumber: profile.accountNumber || '',
        accountHolder: profile.accountHolder || '',
      });
      
      setCustomBankName(customBank); // 기타 은행명 설정
    }
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedInfo({
      bankName: profile?.bankName || '',
      accountNumber: profile?.accountNumber || '',
      accountHolder: profile?.accountHolder || '',
    });
  };

  const handleSave = async () => {
    // 실제 은행명 결정 (getBankNameToSave 사용)
    const finalBankName = getBankNameToSave(editedInfo.bankName || '', customBankName);
    
    // 프론트엔드 validation 수행
    const bankNameValidation = validatePrincipalBankName(finalBankName || '');
    const accountNumberValidation = validatePrincipalAccountNumber(editedInfo.accountNumber || '');
    const accountHolderValidation = validatePrincipalAccountHolder(editedInfo.accountHolder || '');
    
    // 모든 validation 에러 수집
    const allErrors: Record<string, string> = {};
    
    if (!bankNameValidation.isValid) {
      bankNameValidation.errors.forEach(error => {
        allErrors[error.field] = error.message;
      });
    }
    
    if (!accountNumberValidation.isValid) {
      accountNumberValidation.errors.forEach(error => {
        allErrors[error.field] = error.message;
      });
    }
    
    if (!accountHolderValidation.isValid) {
      accountHolderValidation.errors.forEach(error => {
        allErrors[error.field] = error.message;
      });
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

    setValidationErrors({}); // validation 에러 초기화
    
    // 실제 저장 시 finalBankName 사용
    updateProfileMutation.mutate({
      ...editedInfo,
      bankName: finalBankName,
    }, {
      onSuccess: () => {
        setIsEditing(false);
      },
    });
  };

  const handleInputChange = (field: keyof UpdatePrincipalProfileRequest, value: string) => {
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

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-full">
        <p className="text-red-500">은행 정보를 불러오는데 실패했습니다.</p>
        <button
          onClick={() => refetch()}
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
          <h1 className="text-2xl font-bold text-stone-700">은행 정보 관리</h1>
          <p className="text-gray-600 mt-1">결제를 위한 은행 계좌 정보를 관리할 수 있습니다.</p>
        </div>
        <Building className="h-8 w-8 text-stone-700" />
      </div>

      <Separator className="mx-5 flex-shrink-0" />

      {/* 은행 정보 카드 - 스크롤 가능한 컨테이너 */}
      <div className="px-5 py-4 flex-1">
        <div className="max-h-[calc(100vh-260px)] overflow-y-auto">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CreditCard className="h-5 w-5" />
                  은행 계좌 정보
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
                      selectValue={editedInfo.bankName || ''}
                      onSelectChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleInputChange('bankName', e.target.value)}
                      options={[
                        { value: '', label: '은행명 선택' },
                        ...BANKS
                      ]}
                      className={isShaking && validationErrors.bankName ? 'animate-shake border-red-500' : ''}
                    />
                    {validationErrors.bankName && (
                      <p className="text-red-500 text-xs mt-1 ml-2 animate-in fade-in">
                        {validationErrors.bankName}
                      </p>
                    )}
                  </div>
                ) : (
                  <InfoBubble
                    label="은행명"
                    value={profile?.bankName || '미입력'}
                  />
                )}
              </div>

              {/* 기타 은행명 입력 (기타 선택 시에만 표시) */}
              {isEditing && editedInfo.bankName === '기타' && (
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

              <Separator />

              {/* 계좌번호 */}
              <div className="space-y-2">
                {isEditing ? (
                  <div className="relative">
                    <InfoBubble
                      label="계좌번호"
                      type="input"
                      inputValue={editedInfo.accountNumber || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('accountNumber', e.target.value)}
                      placeholder="계좌번호 입력"
                      className={isShaking && validationErrors.accountNumber ? 'animate-shake border-red-500' : ''}
                    />
                    {validationErrors.accountNumber && (
                      <p className="text-red-500 text-xs mt-1 ml-2 animate-in fade-in">
                        {validationErrors.accountNumber}
                      </p>
                    )}
                  </div>
                ) : (
                  <InfoBubble
                    label="계좌번호"
                    value={profile?.accountNumber || '미입력'}
                    valueClassName="font-mono"
                  />
                )}
              </div>

              <Separator />

              {/* 계좌주 */}
              <div className="space-y-2">
                {isEditing ? (
                  <div className="relative">
                    <InfoBubble
                      label="계좌주"
                      type="input"
                      inputValue={editedInfo.accountHolder || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('accountHolder', e.target.value)}
                      placeholder="계좌주 입력"
                      className={isShaking && validationErrors.accountHolder ? 'animate-shake border-red-500' : ''}
                    />
                    {validationErrors.accountHolder && (
                      <p className="text-red-500 text-xs mt-1 ml-2 animate-in fade-in">
                        {validationErrors.accountHolder}
                      </p>
                    )}
                  </div>
                ) : (
                  <InfoBubble
                    label="계좌주"
                    value={profile?.accountHolder || '미입력'}
                  />
                )}
              </div>

              <Separator />

              {/* 안내 메시지 */}
              <div className="bg-[#f5f3f2] border border-[#ac9592] rounded-lg p-4">
                <h4 className="text-sm font-medium text-[#8b6f6b] mb-2">안내사항</h4>
                <ul className="text-xs text-[#7a5f5b] space-y-1">
                  <li>• 이 정보는 학생들이 수강료를 입금할 때 사용됩니다.</li>
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