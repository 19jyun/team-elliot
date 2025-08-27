'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PhoneInput } from '@/components/ui/phone-input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { User, Phone, Mail, Calendar, Edit, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { UpdateProfileRequest } from '@/types/api/student';
import { useStudentApi } from '@/hooks/student/useStudentApi';
import { useApiError } from '@/hooks/useApiError';
import { validateProfileData, ValidationError } from '@/utils/validation';

export function PersonalInfoManagement() {
  const { userProfile, isLoading, error, loadUserProfile, updateUserProfile } = useStudentApi();
  const { handleApiError, fieldErrors, clearErrors } = useApiError();
  const [isEditing, setIsEditing] = useState(false);
  const [editedInfo, setEditedInfo] = useState<UpdateProfileRequest>({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  // 전화번호 인증 관련 상태
  const [isPhoneVerificationRequired, setIsPhoneVerificationRequired] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [timeLeft, setTimeLeft] = useState(180); // 3분 = 180초
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // 컴포넌트 마운트 시 프로필 로드
  useEffect(() => {
    loadUserProfile();
  }, [loadUserProfile]);

  // API에서 가져온 데이터로 초기화
  useEffect(() => {
    if (userProfile) {
      setEditedInfo({
        name: userProfile.name,
        phoneNumber: userProfile.phoneNumber || '',
        emergencyContact: userProfile.emergencyContact || '',
        birthDate: userProfile.birthDate ? userProfile.birthDate.split('T')[0] : '',
        notes: userProfile.notes || '',
        level: userProfile.level || '',
      });
    }
  }, [userProfile]);

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
    if (isEditing && userProfile) {
      const originalPhone = userProfile.phoneNumber || '';
      const currentPhone = editedInfo.phoneNumber || '';
      
      if (currentPhone !== originalPhone && currentPhone.length === 11) {
        setIsPhoneVerificationRequired(true);
        setIsPhoneVerified(false);
        setTimeLeft(180);
        setIsTimerRunning(false); // 타이머는 인증 버튼 클릭 시 시작
      } else if (currentPhone === originalPhone) {
        setIsPhoneVerificationRequired(false);
        setIsPhoneVerified(false);
        setIsTimerRunning(false);
        setTimeLeft(180);
        setVerificationCode('');
      } else if (currentPhone.length !== 11) {
        setIsPhoneVerificationRequired(false);
        setIsPhoneVerified(false);
        setIsTimerRunning(false);
        setTimeLeft(180);
        setVerificationCode('');
      }
    }
  }, [editedInfo.phoneNumber, userProfile, isEditing]);

  // 입력 필드 변경 시 에러 초기화 (새로 타이핑할 때만)
  const [previousInputs, setPreviousInputs] = useState<UpdateProfileRequest>({});
  
  useEffect(() => {
    // 각 필드별로 이전 값과 현재 값을 비교하여 새로 타이핑된 경우에만 에러 제거
    const fieldsToCheck = ['name', 'phoneNumber', 'emergencyContact', 'birthDate', 'level', 'notes'] as const;
    
    fieldsToCheck.forEach(field => {
      const previousValue = previousInputs[field] || '';
      const currentValue = editedInfo[field] || '';
      
      if (fieldErrors[field] && currentValue.length > previousValue.length) {
        clearErrors();
      }
    });
    
    setPreviousInputs(editedInfo);
  }, [editedInfo, fieldErrors, clearErrors, previousInputs]);

  // 에러 발생 시 흔들리는 애니메이션 트리거
  useEffect(() => {
    if (Object.keys(fieldErrors).length > 0) {
      setIsShaking(true);
      const timer = setTimeout(() => {
        setIsShaking(false);
      }, 1000); // 1초 후 애니메이션 종료
      
      return () => clearTimeout(timer);
    }
  }, [fieldErrors]);

  const handleEdit = () => {
    if (userProfile) {
      setEditedInfo({
        name: userProfile.name,
        phoneNumber: userProfile.phoneNumber || '',
        emergencyContact: userProfile.emergencyContact || '',
        birthDate: userProfile.birthDate ? userProfile.birthDate.split('T')[0] : '',
        notes: userProfile.notes || '',
        level: userProfile.level || '',
      });
    }
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (userProfile) {
      setEditedInfo({
        name: userProfile.name,
        phoneNumber: userProfile.phoneNumber || '',
        emergencyContact: userProfile.emergencyContact || '',
        birthDate: userProfile.birthDate ? userProfile.birthDate.split('T')[0] : '',
        notes: userProfile.notes || '',
        level: userProfile.level || '',
      });
    }
    setIsEditing(false);
    setIsPhoneVerificationRequired(false);
    setIsPhoneVerified(false);
    setIsTimerRunning(false);
    setTimeLeft(180);
    setVerificationCode('');
  };

  const handleSave = async () => {
    // 전화번호 인증이 필요한데 아직 인증되지 않은 경우
    if (isPhoneVerificationRequired && !isPhoneVerified) {
      toast.error('전화번호 인증을 완료해주세요.');
      return;
    }

    // 프론트엔드 validation 수행
    const validation = validateProfileData(editedInfo);
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

    try {
      setIsUpdating(true);
      clearErrors(); // 요청 시작 시 에러 초기화
      setValidationErrors({}); // validation 에러도 초기화
      
      await updateUserProfile(editedInfo);
      setIsEditing(false);
      setIsPhoneVerificationRequired(false);
      setIsPhoneVerified(false);
      setIsTimerRunning(false);
      setTimeLeft(180);
      toast.success('개인 정보가 성공적으로 수정되었습니다.');
    } catch (error) {
      //toast와 콘솔 출력
      handleApiError(error, { disableToast: false, disableConsole: true });
      // 컴포넌트 상태는 유지 (사용자가 다시 시도할 수 있도록)
    } finally {
      setIsUpdating(false);
    }
  };

  const handleVerifyPhone = () => {
    // 인증 버튼 클릭 시 타이머 시작
    if (!isTimerRunning) {
      setIsTimerRunning(true);
      setTimeLeft(180);
      toast.success('인증번호가 발송되었습니다.');
      return;
    }
    
    // 확인 버튼 클릭 시 인증 완료 처리
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
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleInputChange = (field: keyof UpdateProfileRequest, value: string) => {
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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '미입력';
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading && !userProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-500">개인 정보를 불러올 수 없습니다.</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            다시 시도
          </Button>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-500">개인 정보를 불러올 수 없습니다.</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            다시 시도
          </Button>
        </div>
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
              {!isEditing ? (
                <Button
                  onClick={handleEdit}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  수정
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    취소
                  </Button>
                  <Button
                    onClick={handleSave}
                    size="sm"
                    className="flex items-center gap-2"
                    disabled={isUpdating || (isPhoneVerificationRequired && !isPhoneVerified)}
                  >
                    <Save className="h-4 w-4" />
                    {isUpdating ? '저장 중...' : '저장'}
                  </Button>
                </div>
              )}
            </div>
            <CardDescription>
              {isEditing ? '수정할 정보를 입력하세요.' : '현재 등록된 개인 정보입니다.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 이름 */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">이름</label>
              {isEditing ? (
                <div className="space-y-1">
                                     <Input
                     value={editedInfo.name || ''}
                     onChange={(e) => handleInputChange('name', e.target.value)}
                     placeholder="이름을 입력하세요"
                     className={`transition-all duration-200 ${
                       (fieldErrors.name || validationErrors.name) ? 'border-red-500 bg-red-50' : 'border-gray-300'
                     } ${
                       isShaking && (fieldErrors.name || validationErrors.name) ? 'animate-shake' : ''
                     }`}
                   />
                   {(fieldErrors.name || validationErrors.name) && (
                     <p className="text-sm text-red-500 animate-in fade-in duration-200">
                       {fieldErrors.name || validationErrors.name}
                     </p>
                   )}
                </div>
              ) : (
                <div className="p-3 bg-gray-50 rounded-md">
                  <span className="text-gray-900">{userProfile.name}</span>
                </div>
              )}
            </div>

            {/* 전화번호 */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">전화번호</label>
              {isEditing ? (
                <div className="space-y-2">
                  <div className="flex gap-2">
                                         <PhoneInput
                       value={editedInfo.phoneNumber || ''}
                       onChange={(value) => handleInputChange('phoneNumber', value)}
                       placeholder="전화번호를 입력하세요"
                       className={`flex-1 transition-all duration-200 ${
                         (fieldErrors.phoneNumber || validationErrors.phoneNumber) ? 'border-red-500 bg-red-50' : 'border-gray-300'
                       } ${
                         isShaking && (fieldErrors.phoneNumber || validationErrors.phoneNumber) ? 'animate-shake' : ''
                       }`}
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
                  
                                     {/* 전화번호 에러 메시지 */}
                   {(fieldErrors.phoneNumber || validationErrors.phoneNumber) && (
                     <p className="text-sm text-red-500 animate-in fade-in duration-200">
                       {fieldErrors.phoneNumber || validationErrors.phoneNumber}
                     </p>
                   )}
                </div>
              ) : (
                <div className="p-3 bg-gray-50 rounded-md flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-900">
                    {userProfile.phoneNumber 
                      ? userProfile.phoneNumber.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3')
                      : '미입력'
                    }
                  </span>
                </div>
              )}
            </div>

            {/* 비상연락처 */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">비상연락처</label>
              {isEditing ? (
                <div className="space-y-1">
                                     <PhoneInput
                     value={editedInfo.emergencyContact || ''}
                     onChange={(value) => handleInputChange('emergencyContact', value)}
                     placeholder="비상연락처를 입력하세요"
                     className={`transition-all duration-200 ${
                       (fieldErrors.emergencyContact || validationErrors.emergencyContact) ? 'border-red-500 bg-red-50' : 'border-gray-300'
                     } ${
                       isShaking && (fieldErrors.emergencyContact || validationErrors.emergencyContact) ? 'animate-shake' : ''
                     }`}
                   />
                   {(fieldErrors.emergencyContact || validationErrors.emergencyContact) && (
                     <p className="text-sm text-red-500 animate-in fade-in duration-200">
                       {fieldErrors.emergencyContact || validationErrors.emergencyContact}
                     </p>
                   )}
                </div>
              ) : (
                <div className="p-3 bg-gray-50 rounded-md flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-900">
                    {userProfile.emergencyContact 
                      ? userProfile.emergencyContact.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3')
                      : '미입력'
                    }
                  </span>
                </div>
              )}
            </div>

            {/* 생년월일 */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">생년월일</label>
              {isEditing ? (
                <div className="space-y-1">
                                     <Input
                     value={editedInfo.birthDate || ''}
                     onChange={(e) => handleInputChange('birthDate', e.target.value)}
                     placeholder="생년월일을 입력하세요"
                     type="date"
                     className={`transition-all duration-200 ${
                       (fieldErrors.birthDate || validationErrors.birthDate) ? 'border-red-500 bg-red-50' : 'border-gray-300'
                     } ${
                       isShaking && (fieldErrors.birthDate || validationErrors.birthDate) ? 'animate-shake' : ''
                     }`}
                   />
                   {(fieldErrors.birthDate || validationErrors.birthDate) && (
                     <p className="text-sm text-red-500 animate-in fade-in duration-200">
                       {fieldErrors.birthDate || validationErrors.birthDate}
                     </p>
                   )}
                </div>
              ) : (
                <div className="p-3 bg-gray-50 rounded-md flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-900">{formatDate(userProfile.birthDate)}</span>
                </div>
              )}
            </div>

            {/* 레벨 */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">레벨</label>
              {isEditing ? (
                <div className="space-y-1">
                                     <select
                     value={editedInfo.level || ''}
                     onChange={(e) => handleInputChange('level', e.target.value)}
                     className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                       (fieldErrors.level || validationErrors.level) ? 'border-red-500 bg-red-50' : 'border-gray-300'
                     } ${
                       isShaking && (fieldErrors.level || validationErrors.level) ? 'animate-shake' : ''
                     }`}
                   >
                     <option value="">레벨 선택</option>
                     <option value="초급">초급</option>
                     <option value="중급">중급</option>
                     <option value="고급">고급</option>
                   </select>
                   {(fieldErrors.level || validationErrors.level) && (
                     <p className="text-sm text-red-500 animate-in fade-in duration-200">
                       {fieldErrors.level || validationErrors.level}
                     </p>
                   )}
                </div>
              ) : (
                <div className="p-3 bg-gray-50 rounded-md">
                  <span className="text-gray-900">{userProfile.level || '미입력'}</span>
                </div>
              )}
            </div>

            {/* 특이사항 */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">특이사항</label>
              {isEditing ? (
                <div className="space-y-1">
                                     <Input
                     value={editedInfo.notes || ''}
                     onChange={(e) => handleInputChange('notes', e.target.value)}
                     placeholder="특이사항을 입력하세요 (알러지, 부상 이력 등)"
                     className={`transition-all duration-200 ${
                       (fieldErrors.notes || validationErrors.notes) ? 'border-red-500 bg-red-50' : 'border-gray-300'
                     } ${
                       isShaking && (fieldErrors.notes || validationErrors.notes) ? 'animate-shake' : ''
                     }`}
                   />
                   {(fieldErrors.notes || validationErrors.notes) && (
                     <p className="text-sm text-red-500 animate-in fade-in duration-200">
                       {fieldErrors.notes || validationErrors.notes}
                     </p>
                   )}
                </div>
              ) : (
                <div className="p-3 bg-gray-50 rounded-md">
                  <span className="text-gray-900">{userProfile.notes || '미입력'}</span>
                </div>
              )}
            </div>

            <Separator />

            {/* 계정 정보 */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700">계정 정보</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>사용자 ID</span>
                  <span>{userProfile.userId}</span>
                </div>
                <div className="flex justify-between">
                  <span>가입일</span>
                  <span>{formatDateTime(userProfile.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span>최종 수정일</span>
                  <span>{formatDateTime(userProfile.updatedAt)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
} 