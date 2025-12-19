'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PhoneInput } from '@/components/ui/phone-input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { User, Phone, Building, Edit, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { UpdatePrincipalProfileRequest, PrincipalProfile } from '@/types/api/principal';
import { usePrincipalProfile } from '@/hooks/queries/principal/usePrincipalProfile';
import { useUpdatePrincipalProfile } from '@/hooks/mutations/principal/useUpdatePrincipalProfile';
import { updatePrincipalProfileSchema, UpdatePrincipalProfileFormData } from '@/lib/schemas/principal-profile';
import { useCheckDuplicatePhone } from '@/hooks/useCheckDuplicatePhone';

export function PrincipalPersonalInfoManagement() {
  const [isEditing, setIsEditing] = useState(false);
  
  // 전화번호 중복 확인 관련 상탄
  const [isPhoneVerificationRequired, setIsPhoneVerificationRequired] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const { check: checkDuplicatePhone } = useCheckDuplicatePhone();

  // React Query 기반 데이터 관리
  const { data: profileData, isLoading: profileLoading, error } = usePrincipalProfile();
  const profile = profileData as PrincipalProfile | null | undefined;
  const updateProfileMutation = useUpdatePrincipalProfile();
  
  // React Hook Form 설정
  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors, dirtyFields },
  } = useForm<UpdatePrincipalProfileFormData>({
    resolver: zodResolver(updatePrincipalProfileSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      phoneNumber: '',
    },
  });

  const isLoading = profileLoading || updateProfileMutation.isPending;
  const watchedPhoneNumber = watch('phoneNumber');

  // API에서 가져온 데이터로 폼 초기화
  useEffect(() => {
    if (profile) {
      reset({
        name: profile.name || '',
        phoneNumber: profile.phoneNumber || '',
      });
    }
  }, [profile, reset]);

  // 전화번호 변경 감지
  useEffect(() => {
    if (isEditing && profile) {
      const originalPhone = profile.phoneNumber || '';
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
  }, [watchedPhoneNumber, profile, isEditing]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (profile) {
      reset({
        name: profile.name || '',
        phoneNumber: profile.phoneNumber || '',
      });
    }
    setIsEditing(false);
    setIsPhoneVerificationRequired(false);
    setIsPhoneVerified(false);
  };

  const onSubmit = (data: UpdatePrincipalProfileFormData) => {
    if (isPhoneVerificationRequired && !isPhoneVerified) {
      toast.error('전화번호 인증을 완료해주세요.');
      return;
    }

    // 변경된 필드만 추출 (빈 문자열 제외)
    const changedFields: UpdatePrincipalProfileRequest = {};
    
    Object.keys(dirtyFields).forEach((key) => {
      const field = key as keyof UpdatePrincipalProfileFormData;
      const value = data[field];
      
      // 빈 문자열이 아닌 경우만 추가
      if (value && value !== '') {
        if (field === 'name' && typeof value === 'string') {
          changedFields.name = value;
        } else if (field === 'phoneNumber' && typeof value === 'string') {
          changedFields.phoneNumber = value;
        }
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

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-700" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-full">
        <p className="text-red-500">데이터를 불러오는데 실패했습니다.</p>
        {error && (
          <p className="text-sm text-red-500 mt-2">{error.message}</p>
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
                    onClick={handleSubmit(onSubmit)}
                    size="sm"
                    disabled={isLoading || (isPhoneVerificationRequired && !isPhoneVerified)}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isLoading ? '저장 중...' : '저장'}
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
                <div className="space-y-1">
                  <Input
                    {...register('name')}
                    placeholder="이름을 입력하세요"
                    disabled={isLoading}
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
                <p className="text-gray-700 py-2">{profile?.name || '이름이 없습니다.'}</p>
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
                      value={watchedPhoneNumber || ''}
                      onChange={(value) => setValue('phoneNumber', value, { shouldValidate: true, shouldDirty: true })}
                      placeholder="전화번호를 입력하세요"
                      disabled={isLoading}
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
                  
                  {/* 에러 메시지 */}
                  {errors.phoneNumber && (
                    <p className="text-sm text-red-500 animate-in fade-in duration-200">
                      {errors.phoneNumber.message}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-gray-700 py-2">
                  {profile?.phoneNumber 
                    ? profile.phoneNumber.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3')
                    : '미입력'
                  }
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
                {profile?.academy?.name || '소속된 학원이 없습니다.'}
              </p>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
} 