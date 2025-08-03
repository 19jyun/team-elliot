'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PhoneInput } from '@/components/ui/phone-input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { User, Phone, Building, Edit, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { updateTeacherProfile } from '@/api/teacher';
import { UpdateProfileRequest } from '@/types/api/teacher';
import { useTeacherData } from '@/hooks/redux/useTeacherData';
import { useAppDispatch } from '@/store/hooks';
import { updateTeacherProfile as updateTeacherProfileAction } from '@/store/slices/teacherSlice';

export function TeacherPersonalInfoManagement() {
  const dispatch = useAppDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [editedInfo, setEditedInfo] = useState<UpdateProfileRequest>({});
  const [isLoading, setIsLoading] = useState(false);
  
  // Redux store에서 Teacher 데이터 가져오기
  const { userProfile, academy, isLoading: isDataLoading, error } = useTeacherData();

  // 전화번호 인증 관련 상태
  const [isPhoneVerificationRequired, setIsPhoneVerificationRequired] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [timeLeft, setTimeLeft] = useState(180); // 3분 = 180초
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // userProfile 데이터가 로드되면 editedInfo 업데이트
  useEffect(() => {
    if (userProfile) {
      setEditedInfo({
        name: userProfile.name || '',
        phoneNumber: userProfile.phoneNumber || '',
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

  // Redux에서 데이터를 가져오므로 별도의 API 호출 불필요
  // loadPersonalInfo 함수 제거

  const handleEdit = () => {
    if (userProfile) {
      setEditedInfo({
        name: userProfile.name || '',
        phoneNumber: userProfile.phoneNumber || '',
      });
    }
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (userProfile) {
      setEditedInfo({
        name: userProfile.name || '',
        phoneNumber: userProfile.phoneNumber || '',
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

    try {
      setIsLoading(true);
      const response = await updateTeacherProfile(editedInfo);
      
      // Redux store 직접 업데이트
      dispatch(updateTeacherProfileAction(response));
      setIsEditing(false);
      setIsPhoneVerificationRequired(false);
      setIsPhoneVerified(false);
      setIsTimerRunning(false);
      setTimeLeft(180);
      toast.success('개인 정보가 성공적으로 수정되었습니다.');
    } catch (error) {
      console.error('개인 정보 수정 실패:', error);
      toast.error('개인 정보 수정에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyPhone = async () => {
    // 인증 버튼 클릭 시 인증번호 발송
    if (!isTimerRunning) {
      try {
        const response = await fetch('/api/auth/send-verification', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            phoneNumber: editedInfo.phoneNumber,
          }),
        });

        if (response.ok) {
          setIsTimerRunning(true);
          setTimeLeft(180);
          toast.success('인증번호가 발송되었습니다.');
        } else {
          const errorData = await response.json();
          toast.error(errorData.message || '인증번호 발송에 실패했습니다.');
        }
      } catch (error) {
        console.error('인증번호 발송 실패:', error);
        toast.error('인증번호 발송에 실패했습니다.');
      }
      return;
    }
    
    // 확인 버튼 클릭 시 인증번호 확인
    try {
      const response = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: editedInfo.phoneNumber,
          code: verificationCode,
        }),
      });

      if (response.ok) {
        setIsPhoneVerified(true);
        setIsTimerRunning(false);
        setVerificationCode('');
        toast.success('전화번호 인증이 완료되었습니다.');
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || '인증에 실패했습니다.');
      }
    } catch (error) {
      console.error('인증 실패:', error);
      toast.error('인증에 실패했습니다.');
    }
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

  if (isDataLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
                    disabled={isLoading || (isPhoneVerificationRequired && !isPhoneVerified)}
                  >
                    <Save className="h-4 w-4" />
                    {isLoading ? '저장 중...' : '저장'}
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
                <Input
                  value={editedInfo.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="이름을 입력하세요"
                />
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

            {/* 학원 */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">학원</label>
              <div className="p-3 bg-gray-50 rounded-md flex items-center gap-2">
                <Building className="h-4 w-4 text-gray-500" />
                <span className="text-gray-900">
                  {academy?.name || '소속된 학원이 없습니다.'}
                </span>
              </div>
              <p className="text-xs text-gray-500">학원 정보는 학원 관리 탭에서 수정할 수 있습니다.</p>
            </div>

            <Separator />

            {/* 계정 정보 */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700">계정 정보</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>선생님 ID</span>
                  <span>{userProfile.id}</span>
                </div>
                <div className="flex justify-between">
                  <span>가입일</span>
                  <span>{userProfile.createdAt ? formatDateTime(userProfile.createdAt) : '정보 없음'}</span>
                </div>
                <div className="flex justify-between">
                  <span>최종 수정일</span>
                  <span>{userProfile.updatedAt ? formatDateTime(userProfile.updatedAt) : '정보 없음'}</span>
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