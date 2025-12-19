'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PhoneInput } from '@/components/ui/phone-input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { User, Phone, Calendar, Edit, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { UpdateStudentProfileRequest, StudentProfile } from '@/types/api/student';
import { useStudentProfile } from '@/hooks/queries/student/useStudentProfile';
import { useUpdateStudentProfile } from '@/hooks/mutations/student/useUpdateStudentProfile';
import { updateStudentProfileSchema, UpdateStudentProfileFormData } from '@/lib/schemas/student-profile';
import { useCheckDuplicatePhone } from '@/hooks/useCheckDuplicatePhone';
 
export function PersonalInfoManagement() {
  const { data: userProfileData, isLoading: profileLoading, error: profileError } = useStudentProfile();
  const userProfile = userProfileData as StudentProfile | null | undefined;
  const updateProfileMutation = useUpdateStudentProfile();
  
  const [isEditing, setIsEditing] = useState(false);
  
  // 전화번호 중복 확인 관련 상태
  const [isPhoneVerificationRequired, setIsPhoneVerificationRequired] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const { check: checkDuplicatePhone } = useCheckDuplicatePhone();

  // React Hook Form 설정
  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors, dirtyFields },
  } = useForm<UpdateStudentProfileFormData>({
    resolver: zodResolver(updateStudentProfileSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      phoneNumber: '',
      emergencyContact: '',
      birthDate: '',
      notes: '',
      level: '',
    },
  });

  const isLoading = profileLoading || updateProfileMutation.isPending;
  const watchedPhoneNumber = watch('phoneNumber');

  // API에서 가져온 데이터로 폼 초기화
  useEffect(() => {
    if (userProfile) {
      reset({
        name: userProfile.name || '',
        phoneNumber: userProfile.phoneNumber || '',
        emergencyContact: userProfile.emergencyContact || '',
        birthDate: userProfile.birthDate ? userProfile.birthDate.split('T')[0] : '',
        notes: userProfile.notes || '',
        level: userProfile.level || '',
      });
    }
  }, [userProfile, reset]);

  // 전화번호 변경 감지
  useEffect(() => {
    if (isEditing && userProfile) {
      const originalPhone = userProfile.phoneNumber || '';
      const currentPhone = watchedPhoneNumber || '';
      
      // 전화번호 형식 체크 (01X-XXXX-XXXX 형식이면 13자)
      const isPhoneComplete = /^01[0-9]-[0-9]{4}-[0-9]{4}$/.test(currentPhone);
      
      if (currentPhone !== originalPhone && isPhoneComplete) {
        setIsPhoneVerificationRequired(true);
        setIsPhoneVerified(false);
      } else if (currentPhone === originalPhone) {
        setIsPhoneVerificationRequired(false);
        setIsPhoneVerified(false);
      } else if (!isPhoneComplete) {
        setIsPhoneVerificationRequired(false);
        setIsPhoneVerified(false);
      }
    }
  }, [watchedPhoneNumber, userProfile, isEditing]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    // 폼을 원래 값으로 리셋
    if (userProfile) {
      reset({
        name: userProfile.name || '',
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
  };

  const onSubmit = (data: UpdateStudentProfileFormData) => {
    // 전화번호 인증이 필요한데 아직 인증되지 않은 경우
    if (isPhoneVerificationRequired && !isPhoneVerified) {
      toast.error('전화번호 인증을 완료해주세요.');
      return;
    }

    // 변경된 필드만 추출 (빈 문자열 제외)
    const changedFields: UpdateStudentProfileRequest = {};
    
    Object.keys(dirtyFields).forEach((key) => {
      const field = key as keyof UpdateStudentProfileFormData;
      const value = data[field];
      
      // 빈 문자열이 아닌 경우만 추가
      if (value && value !== '') {
        changedFields[field] = value;
      }
      // 특이사항(notes)은 빈 문자열로의 변경도 허용
      else if (field === 'notes' && dirtyFields[field]) {
        changedFields.notes = undefined;
      }
    });

    // 변경된 필드가 없으면 저장하지 않음
    if (Object.keys(changedFields).length === 0) {
      toast.info('변경된 내용이 없습니다.');
      setIsEditing(false);
      return;
    }
    
    updateProfileMutation.mutate(changedFields, {
      onSuccess: () => {
        setIsEditing(false);
        setIsPhoneVerificationRequired(false);
        setIsPhoneVerified(false);
      },
    });
  };

  const handleVerifyPhone = async () => {
    const phoneNumber = watchedPhoneNumber || '';
    
    // 전화번호 형식 검증
    if (!/^01[0-9]-[0-9]{4}-[0-9]{4}$/.test(phoneNumber)) {
      toast.error('올바른 전화번호 형식이 아닙니다');
      return;
    }

    // 중복 확인
    const isAvailable = await checkDuplicatePhone(phoneNumber);
    if (!isAvailable) {
      toast.error('이미 사용중인 전화번호입니다');
      setIsPhoneVerified(false);
      return;
    }

    // 중복 확인 완료
    setIsPhoneVerified(true);
    toast.success('사용 가능한 전화번호입니다.');
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

  // 에러 상태 - 컴포넌트가 깨지지 않도록 안전하게 처리
  if (profileError && !userProfile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-full">
        <p className="text-red-500">개인 정보를 불러오는데 실패했습니다.</p>
        <Button
          onClick={() => window.location.reload()}
          className="mt-4"
        >
          다시 시도
        </Button>
      </div>
    );
  }

  // 로딩 상태 처리
  if (isLoading && !userProfile) {
    return (
      <div className="flex items-center justify-center min-h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-700" />
      </div>
    );
  }

  // userProfile이 없는 경우 (데이터 로딩 실패)
  if (!userProfile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-full">
        <p className="text-red-500">개인 정보를 불러올 수 없습니다.</p>
        <Button
          onClick={() => window.location.reload()}
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
                    onClick={handleSubmit(onSubmit)}
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
                <div className="space-y-1">
                  <Input
                    {...register('name')}
                    placeholder="이름을 입력하세요"
                    className={`transition-all duration-200 ${
                      errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    } ${
                      errors.name ? 'animate-shake' : ''
                    }`}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500 animate-in fade-in duration-200">
                      {errors.name.message}
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
                      value={watchedPhoneNumber || ''}
                      onChange={(value) => setValue('phoneNumber', value, { shouldValidate: true, shouldDirty: true })}
                      placeholder="전화번호를 입력하세요"
                      className={`flex-1 transition-all duration-200 ${
                        errors.phoneNumber ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      } ${
                        errors.phoneNumber ? 'animate-shake' : ''
                      }`}
                    />
                    {isPhoneVerificationRequired && !isPhoneVerified && (
                      <Button
                        onClick={handleVerifyPhone}
                        size="sm"
                        className="whitespace-nowrap w-24"
                      >
                        확인
                      </Button>
                    )}
                    {isPhoneVerified && (
                      <div className="flex items-center px-3 py-2 text-sm text-green-600 bg-green-50 rounded-md w-24 justify-center">
                        <span>✓ 확인완료</span>
                      </div>
                    )}
                  </div>
                  
                  {/* 전화번호 에러 메시지 */}
                  {errors.phoneNumber && (
                    <p className="text-sm text-red-500 animate-in fade-in duration-200">
                      {errors.phoneNumber.message}
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
                    value={watch('emergencyContact') || ''}
                    onChange={(value) => setValue('emergencyContact', value, { shouldValidate: true, shouldDirty: true })}
                    placeholder="비상연락처를 입력하세요"
                    className={`transition-all duration-200 ${
                      errors.emergencyContact ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    } ${
                      errors.emergencyContact ? 'animate-shake' : ''
                    }`}
                  />
                  {errors.emergencyContact && (
                    <p className="text-sm text-red-500 animate-in fade-in duration-200">
                      {errors.emergencyContact.message}
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
                    {...register('birthDate')}
                    placeholder="생년월일을 입력하세요"
                    type="date"
                    className={`transition-all duration-200 ${
                      errors.birthDate ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    } ${
                      errors.birthDate ? 'animate-shake' : ''
                    }`}
                  />
                  {errors.birthDate && (
                    <p className="text-sm text-red-500 animate-in fade-in duration-200">
                      {errors.birthDate.message}
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
                    {...register('level')}
                    className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                      errors.level ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    } ${
                      errors.level ? 'animate-shake' : ''
                    }`}
                  >
                    <option value="">레벨 선택</option>
                    <option value="초급">초급</option>
                    <option value="중급">중급</option>
                    <option value="고급">고급</option>
                  </select>
                  {errors.level && (
                    <p className="text-sm text-red-500 animate-in fade-in duration-200">
                      {errors.level.message}
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
                    {...register('notes')}
                    placeholder="특이사항을 입력하세요 (알러지, 부상 이력 등)"
                    className={`transition-all duration-200 ${
                      errors.notes ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    } ${
                      errors.notes ? 'animate-shake' : ''
                    }`}
                  />
                  {errors.notes && (
                    <p className="text-sm text-red-500 animate-in fade-in duration-200">
                      {errors.notes.message}
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