'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Building, CreditCard, Edit, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { usePrincipalApi } from '@/hooks/principal/usePrincipalApi';
import { UpdatePrincipalProfileRequest } from '@/types/api/principal';
import { validatePrincipalBankName, validatePrincipalAccountNumber, validatePrincipalAccountHolder } from '@/utils/validation';
import { useApiError } from '@/hooks/useApiError';

export function PrincipalBankInfoManagement() {
  const [isEditing, setIsEditing] = useState(false);
  const [editedInfo, setEditedInfo] = useState<UpdatePrincipalProfileRequest>({});
  const [isLoading, setIsLoading] = useState(false);
  
  // Validation 관련 상태
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isShaking, setIsShaking] = useState(false);
  
  // API 기반 데이터 관리
  const { profile, loadProfile, error, isPrincipal, updateProfile } = usePrincipalApi();
  const { handleApiError, fieldErrors, clearErrors } = useApiError();

  // 컴포넌트 마운트 시 프로필 로드
  useEffect(() => {
    if (isPrincipal) {
      loadProfile();
    }
  }, [isPrincipal, loadProfile]);

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
      setEditedInfo({
        bankName: profile.bankName || '',
        accountNumber: profile.accountNumber || '',
        accountHolder: profile.accountHolder || '',
      });
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
    // 프론트엔드 validation 수행
    const bankNameValidation = validatePrincipalBankName(editedInfo.bankName || '');
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

    try {
      setIsLoading(true);
      clearErrors(); // 요청 시작 시 에러 초기화
      setValidationErrors({}); // validation 에러도 초기화
      
      await updateProfile(editedInfo);
      
      setIsEditing(false);
      toast.success('은행 정보가 성공적으로 업데이트되었습니다.');
    } catch (error) {
      handleApiError(error, { disableToast: false, disableConsole: true });
    } finally {
      setIsLoading(false);
    }
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
          onClick={() => loadProfile()}
          className="mt-4 px-4 py-2 bg-stone-700 text-white rounded-lg hover:bg-stone-800"
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col pb-2 mx-auto w-full bg-white max-w-[480px] py-5 h-full">
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
                <label className="text-sm font-medium flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  은행명 *
                </label>
                {isEditing ? (
                  <Input
                    value={editedInfo.bankName || ''}
                    onChange={(e) => handleInputChange('bankName', e.target.value)}
                    placeholder="은행명을 입력하세요 (예: 신한은행)"
                    disabled={isLoading}
                    className={`transition-all duration-200 ${
                      (fieldErrors.bankName || validationErrors.bankName) ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    } ${
                      isShaking && (fieldErrors.bankName || validationErrors.bankName) ? 'animate-shake' : ''
                    }`}
                  />
                ) : (
                  <p className="text-gray-700 py-2">{profile?.bankName || '미입력'}</p>
                )}
                {(fieldErrors.bankName || validationErrors.bankName) && (
                  <p className="text-red-500 text-sm animate-in fade-in">
                    {fieldErrors.bankName || validationErrors.bankName}
                  </p>
                )}
              </div>

              <Separator />

              {/* 계좌번호 */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  계좌번호 *
                </label>
                {isEditing ? (
                  <Input
                    value={editedInfo.accountNumber || ''}
                    onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                    placeholder="계좌번호를 입력하세요 (예: 110-123-456789)"
                    disabled={isLoading}
                    className={`transition-all duration-200 ${
                      (fieldErrors.accountNumber || validationErrors.accountNumber) ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    } ${
                      isShaking && (fieldErrors.accountNumber || validationErrors.accountNumber) ? 'animate-shake' : ''
                    }`}
                  />
                ) : (
                  <p className="text-gray-700 py-2 font-mono">{profile?.accountNumber || '미입력'}</p>
                )}
                {(fieldErrors.accountNumber || validationErrors.accountNumber) && (
                  <p className="text-red-500 text-sm animate-in fade-in">
                    {fieldErrors.accountNumber || validationErrors.accountNumber}
                  </p>
                )}
              </div>

              <Separator />

              {/* 계좌주 */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  계좌주 *
                </label>
                {isEditing ? (
                  <Input
                    value={editedInfo.accountHolder || ''}
                    onChange={(e) => handleInputChange('accountHolder', e.target.value)}
                    placeholder="계좌주를 입력하세요"
                    disabled={isLoading}
                    className={`transition-all duration-200 ${
                      (fieldErrors.accountHolder || validationErrors.accountHolder) ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    } ${
                      isShaking && (fieldErrors.accountHolder || validationErrors.accountHolder) ? 'animate-shake' : ''
                    }`}
                  />
                ) : (
                  <p className="text-gray-700 py-2">{profile?.accountHolder || '미입력'}</p>
                )}
                {(fieldErrors.accountHolder || validationErrors.accountHolder) && (
                  <p className="text-red-500 text-sm animate-in fade-in">
                    {fieldErrors.accountHolder || validationErrors.accountHolder}
                  </p>
                )}
              </div>

              <Separator />

              {/* 안내 메시지 */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-800 mb-2">💡 안내사항</h4>
                <ul className="text-xs text-blue-700 space-y-1">
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