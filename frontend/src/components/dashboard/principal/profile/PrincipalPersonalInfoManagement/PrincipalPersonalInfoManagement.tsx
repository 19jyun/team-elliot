'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PhoneInput } from '@/components/ui/phone-input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { User, Phone, Building, Edit, Save, X } from 'lucide-react';
import { CloseCircleIcon } from '@/components/icons';
import { toast } from 'sonner';
import { UpdatePrincipalProfileRequest } from '@/types/api/principal';
import { usePrincipalProfile } from '@/hooks/queries/principal/usePrincipalProfile';
import { useUpdatePrincipalProfile } from '@/hooks/mutations/principal/useUpdatePrincipalProfile';
import { validatePrincipalProfileData } from '@/utils/validation';
import { toPrincipalPersonalInfoManagementVM } from '@/lib/adapters/principal';
import type { PrincipalPersonalInfoManagementVM } from '@/types/view/principal';

export function PrincipalPersonalInfoManagement() {
  const [isEditing, setIsEditing] = useState(false);
  const [editedInfo, setEditedInfo] = useState<UpdatePrincipalProfileRequest>({});
  
  // 전화번호 인증 관련 상태
  const [isPhoneVerificationRequired, setIsPhoneVerificationRequired] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [timeLeft, setTimeLeft] = useState(180); // 3분 = 180초
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Validation 관련 상태
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isShaking, setIsShaking] = useState(false);

  // React Query 기반 데이터 관리
  const { data: profile, isLoading: profileLoading, error } = usePrincipalProfile();
  const updateProfileMutation = useUpdatePrincipalProfile();
  
  const isLoading = profileLoading || updateProfileMutation.isPending;

  // ViewModel 생성
  const personalInfoVM: PrincipalPersonalInfoManagementVM = toPrincipalPersonalInfoManagementVM({
    profile: profile || null,
    isEditing,
    editedInfo,
    isLoading,
    error: error?.message || null,
    isPrincipal: true, // React Query는 Principal일 때만 호출되므로 항상 true
    isPhoneVerificationRequired,
    isPhoneVerified,
    verificationCode,
    timeLeft,
    isTimerRunning,
    validationErrors,
    isShaking,
  });

  // profile 데이터가 로드되면 editedInfo 업데이트 (편집 모드가 아닐 때만)
  useEffect(() => {
    if (profile && !isEditing) {
      setEditedInfo({
        name: profile.name || '',
        phoneNumber: profile.phoneNumber || '',
      });
    }
  }, [profile, isEditing]);

  // 타이머 효과
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            setIsPhoneVerificationRequired(false);
            setIsPhoneVerified(false);
            return 180;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isTimerRunning, timeLeft]);

  // 전화번호 변경 감지
  useEffect(() => {
    if (isEditing && profile) {
      const originalPhone = profile.phoneNumber || '';
      const currentPhone = editedInfo.phoneNumber || '';
      
      // 전화번호 형식 체크 (01X-XXXX-XXXX 형식이면 13자)
      const isPhoneComplete = /^01[0-9]-[0-9]{4}-[0-9]{4}$/.test(currentPhone);
      
      // 전화번호가 실제로 변경되었을 때만 인증 상태 리셋
      if (currentPhone !== originalPhone && isPhoneComplete) {
        // 이미 인증이 필요한 상태가 아니라면 새로 설정
        if (!isPhoneVerificationRequired) {
          setIsPhoneVerificationRequired(true);
          setIsPhoneVerified(false);
          setTimeLeft(180);
          setIsTimerRunning(false);
        }
      } else if (currentPhone === originalPhone) {
        setIsPhoneVerificationRequired(false);
        setIsPhoneVerified(false);
        setIsTimerRunning(false);
        setTimeLeft(180);
        setVerificationCode('');
      } else if (!isPhoneComplete) {
        setIsPhoneVerificationRequired(false);
        setIsPhoneVerified(false);
        setIsTimerRunning(false);
        setTimeLeft(180);
        setVerificationCode('');
      }
    }
  }, [editedInfo.phoneNumber, profile, isEditing, isPhoneVerificationRequired]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditedInfo({
      name: profile?.name || '',
      phoneNumber: profile?.phoneNumber || '',
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedInfo({
      name: profile?.name || '',
      phoneNumber: profile?.phoneNumber || '',
    });
    handleCancelVerification();
  };

  const handleSave = async () => {
    if (isPhoneVerificationRequired && !isPhoneVerified) {
      toast.error('전화번호 인증을 완료해주세요.');
      return;
    }

    // 프론트엔드 validation 수행
    const validation = validatePrincipalProfileData(editedInfo);
    if (!validation.isValid) {
      // validation 에러를 fieldErrors로 변환
      const fieldErrorMap: Record<string, string> = {};
      validation.errors.forEach(error => {
        fieldErrorMap[error.field] = error.message;
      });
      
      // 에러 상태 설정 및 흔들림 애니메이션 트리거
      setValidationErrors(fieldErrorMap);
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
    
    updateProfileMutation.mutate(editedInfo, {
      onSuccess: () => {
        setIsEditing(false);
        handleCancelVerification();
      },
    });
  };

  const handleVerifyPhone = () => {
    // 인증 버튼 클릭 시 타이머 시작
    if (!isTimerRunning) {
      console.log('인증 버튼 클릭 - 타이머 시작');
      setIsTimerRunning(true);
      setTimeLeft(180);
      toast.success('인증번호가 발송되었습니다.');
      return;
    }
    
    // 확인 버튼 클릭 시 인증 완료 처리
    console.log('인증 확인 버튼 클릭 - 인증 완료');
    setIsPhoneVerified(true);
    setIsTimerRunning(false);
    setVerificationCode(''); // 인증번호 입력 필드 초기화
    toast.success('전화번호 인증이 완료되었습니다.');
  };

  const handleCancelVerification = () => {
    setIsPhoneVerificationRequired(false);
    setIsPhoneVerified(false);
    setIsTimerRunning(false);
    setTimeLeft(180);
    setVerificationCode('');
  };

  const handleClearVerificationCode = () => {
    setVerificationCode('');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (personalInfoVM.isInitialLoading) {
    return (
      <div className="flex items-center justify-center min-h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-700" />
      </div>
    );
  }

  if (personalInfoVM.error || !personalInfoVM.profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-full">
        <p className="text-red-500">데이터를 불러오는데 실패했습니다.</p>
        {personalInfoVM.error && (
          <p className="text-sm text-red-500 mt-2">{personalInfoVM.error}</p>
        )}
        <Button
          onClick={() => window.location.reload()}
          variant="outline"
          size="sm"
          className="mt-4"
        >
          다시 시도
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col pb-2 mx-auto w-full bg-white max-w-[480px] py-5 h-full">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-5 pb-4 flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-stone-700">개인 정보 관리</h1>
          <p className="text-gray-600 mt-1">내 개인 정보를 확인하고 수정할 수 있습니다.</p>
        </div>
        <User className="h-8 w-8 text-stone-700" />
      </div>

      <Separator className="mx-5 flex-shrink-0" />

      {/* 개인 정보 카드 - 스크롤 가능한 컨테이너 */}
      <div className="px-5 py-4 flex-1">
        <div className="max-h-[calc(100vh-260px)] overflow-y-auto">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5" />
                기본 정보
              </CardTitle>
              {!personalInfoVM.isEditing ? (
                <Button
                  onClick={handleEdit}
                  variant="outline"
                  size="sm"
                  disabled={personalInfoVM.isLoading}
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
                    disabled={personalInfoVM.isLoading}
                  >
                    <X className="h-4 w-4 mr-2" />
                    취소
                  </Button>
                  <Button
                    onClick={handleSave}
                    size="sm"
                    disabled={!personalInfoVM.canSave}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    저장
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 이름 */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <User className="h-4 w-4" />
                이름 *
              </label>
              {personalInfoVM.isEditing ? (
                <Input
                  value={personalInfoVM.editedInfo.name || ''}
                  onChange={(e) => {
                    setEditedInfo({ ...personalInfoVM.editedInfo, name: e.target.value });
                    // 입력 필드 변경 시 해당 필드의 validation 에러 초기화
                    if (personalInfoVM.validationErrors.name) {
                      setValidationErrors(prev => ({
                        ...prev,
                        name: ''
                      }));
                    }
                  }}
                  placeholder="이름을 입력하세요"
                  disabled={personalInfoVM.isLoading}
                  className={`transition-all duration-200 ${
                    personalInfoVM.validationErrors.name ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  } ${
                    personalInfoVM.isShaking && personalInfoVM.validationErrors.name ? 'animate-shake' : ''
                  }`}
                />
              ) : (
                <p className="text-gray-700 py-2">{personalInfoVM.profile?.name || '이름이 없습니다.'}</p>
              )}
              {personalInfoVM.validationErrors.name && (
                <p className="text-red-500 text-sm animate-in fade-in">
                  {personalInfoVM.validationErrors.name}
                </p>
              )}
            </div>

            <Separator />

            {/* 전화번호 */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Phone className="h-4 w-4" />
                전화번호 *
              </label>
              {personalInfoVM.isEditing ? (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <PhoneInput
                      value={personalInfoVM.editedInfo.phoneNumber || ''}
                      onChange={(value) => {
                        setEditedInfo({ ...personalInfoVM.editedInfo, phoneNumber: value });
                        // 입력 필드 변경 시 해당 필드의 validation 에러 초기화
                        if (personalInfoVM.validationErrors.phoneNumber) {
                          setValidationErrors(prev => ({
                            ...prev,
                            phoneNumber: ''
                          }));
                        }
                      }}
                      placeholder="전화번호를 입력하세요"
                      disabled={personalInfoVM.isLoading}
                      className={`flex-1 transition-all duration-200 ${
                        personalInfoVM.validationErrors.phoneNumber ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      } ${
                        personalInfoVM.isShaking && personalInfoVM.validationErrors.phoneNumber ? 'animate-shake' : ''
                      }`}
                    />
                    {personalInfoVM.isPhoneVerificationRequired && !personalInfoVM.isPhoneVerified && (
                      <Button
                        onClick={handleVerifyPhone}
                        size="sm"
                        disabled={personalInfoVM.isTimerRunning}
                        className="whitespace-nowrap w-24"
                      >
                        인증
                      </Button>
                    )}
                    {personalInfoVM.isPhoneVerified && (
                      <div className="flex items-center px-3 py-2 text-sm text-green-600 bg-green-50 rounded-md w-24 justify-center">
                        <span>✓ 인증완료</span>
                      </div>
                    )}
                  </div>
                  
                  {/* 인증번호 입력 필드 */}
                  {personalInfoVM.isPhoneVerificationRequired && !personalInfoVM.isPhoneVerified && personalInfoVM.isTimerRunning && (
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <Input
                          value={personalInfoVM.verificationCode}
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
                            {formatTime(personalInfoVM.timeLeft)}
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={handleVerifyPhone}
                        size="sm"
                        disabled={personalInfoVM.verificationCode.length < 6}
                        className="w-24"
                      >
                        확인
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-700 py-2">{personalInfoVM.phoneDisplayValue}</p>
              )}
              {personalInfoVM.validationErrors.phoneNumber && (
                <p className="text-red-500 text-sm animate-in fade-in">
                  {personalInfoVM.validationErrors.phoneNumber}
                </p>
              )}
            </div>

            <Separator />

            {/* 소속 학원 */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Building className="h-4 w-4" />
                소속 학원
              </label>
              <p className="text-gray-700 py-2">
                {personalInfoVM.academyDisplayValue}
              </p>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
} 