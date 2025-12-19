'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UpdatePrincipalProfileRequest, PrincipalProfile } from '@/types/api/principal';
import { updatePrincipalProfileSchema, UpdatePrincipalProfileFormData } from '@/lib/schemas/principal-profile';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

import { 
  User, 
  GraduationCap, 
  Clock, 
  Edit, 
  Save, 
  X, 
  Plus,
  Trash2,
  Camera
} from 'lucide-react';
import { usePrincipalProfile } from '@/hooks/queries/principal/usePrincipalProfile';
import { useUpdatePrincipalProfile } from '@/hooks/mutations/principal/useUpdatePrincipalProfile';
import { useUpdatePrincipalProfilePhoto } from '@/hooks/mutations/principal/useUpdatePrincipalProfilePhoto';
import { getImageUrl } from '@/utils/imageUtils';
import Image from 'next/image';
import { useCamera } from '@/hooks/useCamera';

interface PrincipalProfileCardProps {
  principalId?: number; // 특정 원장 ID (없으면 현재 로그인한 원장)
  isEditable?: boolean; // 편집 가능 여부
  onSave?: () => void;
  onCancel?: () => void;
  showHeader?: boolean; // 헤더 표시 여부
  compact?: boolean; // 컴팩트 모드
}

export function PrincipalProfileCard({ 
  isEditable = true, 
  onSave, 
  onCancel,
  showHeader = true,
  compact = false
}: PrincipalProfileCardProps) {
  
  const [isEditing, setIsEditing] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // 카메라/갤러리 접근
  const { pickProfilePhotoWithPrompt, selectedImage, getImageAsFile } = useCamera();
  
  // React Hook Form 설정
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { dirtyFields, errors: formErrors },
  } = useForm<UpdatePrincipalProfileFormData>({
    resolver: zodResolver(updatePrincipalProfileSchema),
    defaultValues: {
      introduction: '',
      education: [],
      certifications: [],
    },
  });
  
  // 배열 필드 watch
  const educationFields = watch('education') || [];
  const certificationFields = watch('certifications') || [];
  
  // 배열 필드 관리 함수
  const appendEducation = (value: string) => setValue('education', [...educationFields, value], { shouldDirty: true });
  const removeEducation = (index: number) => setValue('education', educationFields.filter((_, i) => i !== index), { shouldDirty: true });
  
  const appendCertification = (value: string) => setValue('certifications', [...certificationFields, value], { shouldDirty: true });
  const removeCertification = (index: number) => setValue('certifications', certificationFields.filter((_, i) => i !== index), { shouldDirty: true });

  // React Query 기반 데이터 관리
  const { data: profile, isLoading: profileLoading, error } = usePrincipalProfile();
  const typedProfile = profile as PrincipalProfile | null | undefined;
  const updateProfileMutation = useUpdatePrincipalProfile();
  const updatePhotoMutation = useUpdatePrincipalProfilePhoto();
  
  // API에서 가져온 데이터로 폼 초기화
  useEffect(() => {
    if (typedProfile) {
      reset({
        introduction: typedProfile.introduction || '',
        education: typedProfile.education || [],
        certifications: typedProfile.certifications || [],
      });
    }
  }, [typedProfile, reset]);

  // 편집 모드 시작
  const handleEdit = () => {
    setIsEditing(true);
  };

  // 편집 모드 취소
  const handleCancel = () => {
    if (typedProfile) {
      reset({
        introduction: typedProfile.introduction || '',
        education: typedProfile.education || [],
        certifications: typedProfile.certifications || [],
      });
    }
    setSelectedPhoto(null);
    setPreviewUrl(null);
    setIsEditing(false);
    onCancel?.();
  };

  // 사진 클릭 핸들러 - 카메라/갤러리 선택
  const handlePhotoClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isEditing) {
      return;
    }
    
    try {
      // 권한 확인 및 카메라/갤러리 선택
      const result = await pickProfilePhotoWithPrompt();
      
      if (result) {
        // ProcessedImage를 File로 변환 (fresh result 사용)
        const file = await getImageAsFile(result);
        
        if (file) {
          setSelectedPhoto(file);
          
          // 미리보기 URL 생성
          const reader = new FileReader();
          reader.onload = (e) => {
            setPreviewUrl(e.target?.result as string);
          };
          reader.readAsDataURL(file);
        }
      }
    } catch (error) {
      console.error('사진 선택 실패:', error);
      // Fallback: 웹 파일 입력 사용
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    }
  };

  // 사진 선택 핸들러
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 파일 크기 체크 (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('파일 크기는 5MB 이하여야 합니다.');
        // 파일 입력 필드 초기화
        e.target.value = '';
        return;
      }

      // 파일 타입 체크
      if (!file.type.startsWith('image/')) {
        toast.error('이미지 파일만 업로드 가능합니다.');
        // 파일 입력 필드 초기화
        e.target.value = '';
        return;
      }

      setSelectedPhoto(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
        // 사진 선택 시 자동 업로드 제거 - 저장 버튼 클릭 시에만 업로드
      };
      reader.onerror = () => {
        toast.error('파일을 읽는 중 오류가 발생했습니다.');
        e.target.value = '';
      };
      reader.readAsDataURL(file);
    }
  };

  // 저장
  const onSubmit = handleSubmit((data) => {
    // 변경된 필드만 추출 (빈 문자열 제외)
    const changedFields: UpdatePrincipalProfileRequest = {};
    
    Object.keys(dirtyFields).forEach((key) => {
      const field = key as keyof UpdatePrincipalProfileFormData;
      const value = data[field];
      
      // 빈 문자열이 아닌 경우만 추가
      if (value && value !== '') {
        if (field === 'introduction' && typeof value === 'string') {
          changedFields.introduction = value;
        } else if (field === 'education' && Array.isArray(value)) {
          changedFields.education = value;
        } else if (field === 'certifications' && Array.isArray(value)) {
          changedFields.certifications = value;
        }
      }
    });

    // 변경된 필드가 없고 사진도 없으면 저장하지 않음
    if (Object.keys(changedFields).length === 0 && !selectedPhoto) {
      toast.info('변경된 내용이 없습니다.');
      setIsEditing(false);
      return;
    }
    
    // 프로필 데이터 업데이트 (변경된 필드가 있는 경우만)
    if (Object.keys(changedFields).length > 0) {
      updateProfileMutation.mutate(changedFields, {
        onSuccess: () => {
          setIsEditing(false);
          onSave?.();
          // 선택된 사진이 있으면 사진도 업로드
          if (selectedPhoto) {
            updatePhotoMutation.mutate(selectedPhoto, {
              onSuccess: () => {
                setSelectedPhoto(null);
                setPreviewUrl(null);
              },
            });
          }
        },
      });
    } else if (selectedPhoto) {
      // 프로필 데이터 변경 없이 사진만 변경된 경우
      updatePhotoMutation.mutate(selectedPhoto, {
        onSuccess: () => {
          setSelectedPhoto(null);
          setPreviewUrl(null);
          setIsEditing(false);
          onSave?.();
        },
      });
    }
  });

  // 로딩 상태
  if (profileLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !typedProfile) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <User className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>프로필 정보를 불러올 수 없습니다.</p>
            {error && (
              <p className="text-sm text-red-500 mt-2">{error.message || '알 수 없는 오류가 발생했습니다.'}</p>
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
        </CardContent>
      </Card>
    );
  }

  // 컴팩트 모드 (학생용)
  if (compact) {
    return (
      <Card className="w-full">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div
                className={`inline-block transition-all duration-200 ${
                  isEditing 
                    ? 'cursor-pointer ring-2 ring-blue-500 hover:opacity-80 hover:ring-blue-600 hover:scale-105 rounded-full' 
                    : 'cursor-default'
                }`}
                onClick={handlePhotoClick}
                style={{ touchAction: 'manipulation' }}
              >
                <div 
                  className="h-12 w-12 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center relative z-10"
                  onClick={handlePhotoClick}
                >
                  {previewUrl || getImageUrl(typedProfile.photoUrl) ? (
                    <Image 
                      src={previewUrl || getImageUrl(typedProfile.photoUrl) || ''} 
                      alt={typedProfile.name}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-sm font-semibold text-gray-600">
                      {typedProfile.name?.charAt(0)}
                    </div>
                  )}
                </div>
              </div>
              
              {isEditing && (
                <div 
                  className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none"
                  style={{ zIndex: 5 }}
                >
                  <Camera className="h-4 w-4 text-white" />
                  <span className="absolute bottom-0 text-xs text-white font-medium">클릭</span>
                </div>
              )}
              
              {isEditing && (
                <Input
                  ref={fileInputRef}
                  id="principal-photo-upload-compact"
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotoChange}
                  className="hidden"
                  aria-label="프로필 사진 업로드"
                />
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">{typedProfile.name}</h3>
              <p className="text-sm text-gray-600">{typedProfile.introduction}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // 전체 모드 (원장용)
  return (
    <Card className="w-full max-w-2xl mx-auto">
      {showHeader && (
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              원장 프로필
            </CardTitle>
            {isEditable && !isEditing && (
              <Button onClick={handleEdit} variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                수정
              </Button>
            )}
          </div>
        </CardHeader>
      )}
      
      <CardContent className="space-y-6">
        {/* 프로필 사진 및 기본 정보 */}
        <div className="flex items-start gap-4">
          <div className="relative">
            <div
              className={`inline-block transition-all duration-200 ${
                isEditing 
                  ? 'cursor-pointer ring-2 ring-blue-500 hover:opacity-80 hover:ring-blue-600 hover:scale-105 rounded-full' 
                  : 'cursor-default'
              }`}
              onClick={handlePhotoClick}
              style={{ touchAction: 'manipulation' }}
            >
              <div 
                className="h-20 w-20 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center relative z-10"
                onClick={handlePhotoClick}
              >
                {previewUrl || getImageUrl(typedProfile.photoUrl) ? (
                  <Image 
                    src={previewUrl || getImageUrl(typedProfile.photoUrl) || ''} 
                    alt={typedProfile.name}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-lg font-semibold text-gray-600">
                    {typedProfile.name?.charAt(0)}
                  </div>
                )}
              </div>
            </div>
            
            {isEditing && (
              <div 
                className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none"
                style={{ zIndex: 5 }}
              >
                <Camera className="h-6 w-6 text-white" />
                <span className="absolute bottom-1 text-xs text-white font-medium">클릭</span>
              </div>
            )}
            
            {isEditing && (
              <Input
                ref={fileInputRef}
                id="principal-photo-upload"
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoChange}
                className="hidden"
                aria-label="프로필 사진 업로드"
              />
            )}
          </div>
          
          <div className="flex-1 space-y-3">
            <h3 className="text-lg font-semibold">{typedProfile.name}</h3>
            <p className="text-gray-600">{typedProfile.phoneNumber}</p>
            {isEditing && (
              <div className="text-xs text-gray-500 space-y-1">
                <p>• 이름 및 전화번호는 개인정보 관리 페이지에서 수정하실 수 있습니다.</p>
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* 소개 */}
        <div className="space-y-2">
          <h4 className="font-medium flex items-center gap-2">
            <User className="h-4 w-4" />
            소개
          </h4>
          {isEditing ? (
            <>
              <Textarea
                {...register('introduction')}
                placeholder="자신에 대한 소개를 작성해주세요."
                rows={4}
              />
              {formErrors.introduction && (
                <p className="text-sm text-red-500">{formErrors.introduction.message}</p>
              )}
            </>
          ) : (
            <p className="text-gray-700 whitespace-pre-wrap">
              {typedProfile.introduction || '소개가 없습니다.'}
            </p>
          )}
        </div>

        <Separator />

        {/* 교육사항 */}
        <div className="space-y-3">
          <h4 className="font-medium flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            교육사항
          </h4>
          {isEditing ? (
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="교육사항을 입력하세요"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const input = e.currentTarget;
                      if (input.value.trim()) {
                        appendEducation(input.value.trim());
                        input.value = '';
                      }
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={(e) => {
                    const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                    if (input?.value.trim()) {
                      appendEducation(input.value.trim());
                      input.value = '';
                    }
                  }}
                  size="sm"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2">
                {educationFields.map((field, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Badge variant="secondary" className="flex-1">
                      {field}
                    </Badge>
                    <Button
                      type="button"
                      onClick={() => removeEducation(index)}
                      variant="ghost"
                      size="sm"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {typedProfile.education && typedProfile.education.length > 0 ? (
                typedProfile.education.map((education: string, index: number) => (
                  <Badge key={index} variant="secondary">
                    {education}
                  </Badge>
                ))
              ) : (
                <p className="text-gray-500">등록된 교육사항이 없습니다.</p>
              )}
            </div>
          )}
        </div>

        {/* 자격증 */}
        <div className="space-y-3">
          <h4 className="font-medium flex items-center gap-2">
            <Clock className="h-4 w-4" />
            자격증
          </h4>
          {isEditing ? (
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="자격증을 입력하세요"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const input = e.currentTarget;
                      if (input.value.trim()) {
                        appendCertification(input.value.trim());
                        input.value = '';
                      }
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={(e) => {
                    const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                    if (input?.value.trim()) {
                      appendCertification(input.value.trim());
                      input.value = '';
                    }
                  }}
                  size="sm"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2">
                {certificationFields.map((field, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Badge variant="default" className="flex-1">
                      {field}
                    </Badge>
                    <Button
                      type="button"
                      onClick={() => removeCertification(index)}
                      variant="ghost"
                      size="sm"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {typedProfile.certifications && typedProfile.certifications.length > 0 ? (
                typedProfile.certifications.map((certification: string, index: number) => (
                  <Badge key={index} variant="default">
                    {certification}
                  </Badge>
                ))
              ) : (
                <p className="text-gray-500">등록된 자격증이 없습니다.</p>
              )}
            </div>
          )}
        </div>

        {/* 편집 버튼들 */}
        {isEditing && (
          <div className="flex justify-end gap-2 pt-4">
            <Button 
              onClick={handleCancel} 
              variant="outline"
              disabled={updateProfileMutation.isPending}
            >
              <X className="h-4 w-4 mr-2" />
              취소
            </Button>
            <Button 
              onClick={onSubmit}
              disabled={updateProfileMutation.isPending}
            >
              <Save className="h-4 w-4 mr-2" />
              {updateProfileMutation.isPending ? '업로드 중...' : '저장'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 