'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PhoneInput } from '@/components/ui/phone-input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { User, Phone, Building, Edit, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { getPrincipalProfile, updatePrincipalProfile } from '@/api/principal';
import { PrincipalProfile, UpdatePrincipalProfileRequest } from '@/types/api/principal';
import { usePrincipalData } from '@/hooks/usePrincipalData';
import { useAppDispatch } from '@/store/hooks';
import { updateUserProfile } from '@/store/slices/appDataSlice';

export function PrincipalPersonalInfoManagement() {
  const [personalInfo, setPersonalInfo] = useState<PrincipalProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedInfo, setEditedInfo] = useState<UpdatePrincipalProfileRequest>({});
  const [isLoading, setIsLoading] = useState(false);
  
  // 전화번호 인증 관련 상태
  const [isPhoneVerificationRequired, setIsPhoneVerificationRequired] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [timeLeft, setTimeLeft] = useState(180); // 3분 = 180초
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const dispatch = useAppDispatch();

  // Redux store에서 데이터 가져오기
  const { userProfile, isLoading: isDataLoading, error } = usePrincipalData();

  // userProfile 데이터가 로드되면 personalInfo 업데이트
  useEffect(() => {
    if (userProfile) {
      setPersonalInfo(userProfile);
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
    if (isEditing && personalInfo) {
      const originalPhone = personalInfo.phoneNumber || '';
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
  }, [editedInfo.phoneNumber, personalInfo, isEditing]);

  const loadPersonalInfo = async () => {
    try {
      setIsLoading(true);
      const response = await getPrincipalProfile();
      setPersonalInfo(response);
      setEditedInfo({
        name: response.name || '',
        phoneNumber: response.phoneNumber || '',
      });
    } catch (error) {
      console.error('개인정보 로드 실패:', error);
      toast.error('개인정보를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedInfo({
      name: personalInfo?.name || '',
      phoneNumber: personalInfo?.phoneNumber || '',
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedInfo({
      name: personalInfo?.name || '',
      phoneNumber: personalInfo?.phoneNumber || '',
    });
    handleCancelVerification();
  };

  const handleSave = async () => {
    if (!editedInfo.name?.trim()) {
      toast.error('이름을 입력해주세요.');
      return;
    }

    if (isPhoneVerificationRequired && !isPhoneVerified) {
      toast.error('전화번호 인증을 완료해주세요.');
      return;
    }

    try {
      setIsLoading(true);
      const response = await updatePrincipalProfile(editedInfo);
      
      // Redux store 직접 업데이트
      dispatch(updateUserProfile(response));
      
      await loadPersonalInfo(); // 업데이트된 정보 다시 로드
      setIsEditing(false);
      handleCancelVerification();
      toast.success('개인정보가 성공적으로 업데이트되었습니다.');
    } catch (error) {
      console.error('개인정보 업데이트 실패:', error);
      toast.error('개인정보 업데이트에 실패했습니다.');
    } finally {
      setIsLoading(false);
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
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading && !personalInfo) {
    return (
      <div className="flex items-center justify-center min-h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-700" />
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
                    disabled={isLoading || (isPhoneVerificationRequired && !isPhoneVerified)}
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
              {isEditing ? (
                <Input
                  value={editedInfo.name || ''}
                  onChange={(e) => setEditedInfo({ ...editedInfo, name: e.target.value })}
                  placeholder="이름을 입력하세요"
                  disabled={isLoading}
                />
              ) : (
                <p className="text-gray-700 py-2">{personalInfo?.name || '이름이 없습니다.'}</p>
              )}
            </div>

            <Separator />

            {/* 전화번호 */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Phone className="h-4 w-4" />
                전화번호 *
              </label>
              {isEditing ? (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <PhoneInput
                      value={editedInfo.phoneNumber || ''}
                      onChange={(value) => setEditedInfo({ ...editedInfo, phoneNumber: value })}
                      placeholder="전화번호를 입력하세요"
                      disabled={isLoading}
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
                <p className="text-gray-700 py-2">{personalInfo?.phoneNumber || '전화번호가 없습니다.'}</p>
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
                {personalInfo?.academy?.name || '소속 학원이 없습니다.'}
              </p>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
} 