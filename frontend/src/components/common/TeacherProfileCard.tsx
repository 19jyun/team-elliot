'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UpdateProfileRequest, TeacherProfileResponse } from '@/types/api/teacher';
import { updateTeacherProfileSchema, UpdateTeacherProfileFormData } from '@/lib/schemas/teacher-profile';
import { toast } from 'sonner';
import { getImageUrl } from '@/utils/imageUtils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User, 
  GraduationCap, 
  Award, 
  Clock, 
  Edit, 
  Save, 
  X, 
  Plus,
  Trash2,
  Camera
} from 'lucide-react';
import { useTeacherProfile } from '@/hooks/queries/teacher/useTeacherProfile';
import { useUpdateTeacherProfile } from '@/hooks/mutations/teacher/useUpdateTeacherProfile';
import { useUpdateTeacherProfilePhoto } from '@/hooks/mutations/teacher/useUpdateTeacherProfilePhoto';


interface TeacherProfileCardProps {
  teacherId?: number; // 특정 선생님 ID (없으면 현재 로그인한 선생님)
  isEditable?: boolean; // 편집 가능 여부
  onSave?: () => void;
  onCancel?: () => void;
  showHeader?: boolean; // 헤더 표시 여부
  compact?: boolean; // 컴팩트 모드 (학생용)
}

export function TeacherProfileCard({ 
  teacherId,
  isEditable = true, 
  onSave, 
  onCancel,
  showHeader = true,
  compact = false
}: TeacherProfileCardProps) {
  

  const [isEditing, setIsEditing] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // React Hook Form 설정
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { dirtyFields, errors: formErrors },
  } = useForm<UpdateTeacherProfileFormData>({
    resolver: zodResolver(updateTeacherProfileSchema),
    defaultValues: {
      introduction: '',
      yearsOfExperience: 0,
      education: [],
      specialties: [],
      certifications: [],
      availableTimes: [],
    },
  });
  
  // 배열 필드 watch
  const educationFields = watch('education') || [];
  const specialtyFields = watch('specialties') || [];
  const certificationFields = watch('certifications') || [];
  
  // 배열 필드 관리 함수
  const appendEducation = (value: string) => setValue('education', [...educationFields, value], { shouldDirty: true });
  const removeEducation = (index: number) => setValue('education', educationFields.filter((_, i) => i !== index), { shouldDirty: true });
  
  const appendSpecialty = (value: string) => setValue('specialties', [...specialtyFields, value], { shouldDirty: true });
  const removeSpecialty = (index: number) => setValue('specialties', specialtyFields.filter((_, i) => i !== index), { shouldDirty: true });
  
  const appendCertification = (value: string) => setValue('certifications', [...certificationFields, value], { shouldDirty: true });
  const removeCertification = (index: number) => setValue('certifications', certificationFields.filter((_, i) => i !== index), { shouldDirty: true });

  // 특정 선생님 프로필을 조회하는 경우를 위한 상태
  // 특정 ID 조회 기능은 학생용 컴포넌트로 분리됨
  const [specificTeacherProfile] = useState<TeacherProfileResponse | null>(null);
  const [errorSpecific] = useState<string | null>(null);

  // React Query 기반 데이터 관리 (현재 로그인한 선생님용)
  const { data: profile, isLoading: profileLoading, error } = useTeacherProfile();
  const typedProfile = profile as TeacherProfileResponse | null | undefined;
  const updateProfileMutation = useUpdateTeacherProfile();
  const updatePhotoMutation = useUpdateTeacherProfilePhoto();

  // 현재 사용자가 선생님이고, 특정 선생님 ID가 없거나 현재 선생님의 프로필을 조회하는 경우
  const isCurrentTeacher = !teacherId || teacherId === typedProfile?.id;
  
  // 실제 사용할 프로필 데이터와 로딩/에러 상태
  const currentProfile = teacherId ? specificTeacherProfile : typedProfile;
  const currentError = teacherId ? errorSpecific : error;

  // 편집 가능 여부 결정
  // 1. isEditable이 false이거나
  // 2. 특정 선생님을 조회하는 경우 (다른 사람의 프로필)
  // 3. 현재 사용자가 선생님이 아닌 경우
  const canEdit = isEditable && isCurrentTeacher;
  
  // API에서 가져온 데이터로 폼 초기화
  useEffect(() => {
    if (currentProfile) {
      reset({
        introduction: currentProfile.introduction || '',
        yearsOfExperience: currentProfile.yearsOfExperience || 0,
        education: currentProfile.education || [],
        specialties: currentProfile.specialties || [],
        certifications: currentProfile.certifications || [],
        availableTimes: currentProfile.availableTimes || [],
      });
    }
  }, [currentProfile, reset]);

  // 편집 모드 시작
  const handleEdit = () => {
    setIsEditing(true);
  };

  // 편집 취소
  const handleCancel = () => {
    if (currentProfile) {
      reset({
        introduction: currentProfile.introduction || '',
        yearsOfExperience: currentProfile.yearsOfExperience || 0,
        education: currentProfile.education || [],
        specialties: currentProfile.specialties || [],
        certifications: currentProfile.certifications || [],
        availableTimes: currentProfile.availableTimes || [],
      });
    }
    setSelectedPhoto(null);
    setPreviewUrl(null);
    setIsEditing(false);
    onCancel?.();
  };

  // 사진 클릭 핸들러
  const handlePhotoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isEditing) {
      return;
    }
    
    if (!fileInputRef.current) {
      return;
    }
    
    try {
      fileInputRef.current.click();
    } catch (error) {
      console.error('파일 입력 필드 클릭 실패:', error);
    }
  };

  // 사진 변경 핸들러
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 파일 크기 검증 (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('파일 크기는 5MB 이하여야 합니다.');
        return;
      }

      // 파일 타입 검증
      if (!file.type.startsWith('image/')) {
        toast.error('이미지 파일만 업로드 가능합니다.');
        return;
      }

      setSelectedPhoto(file);
      
      // 미리보기 URL 생성
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // 저장
  const onSubmit = handleSubmit((data) => {
    // 변경된 필드만 추출 (빈 문자열 제외)
    const changedFields: UpdateProfileRequest = {};
    
    Object.keys(dirtyFields).forEach((key) => {
      const field = key as keyof UpdateTeacherProfileFormData;
      const value = data[field];
      
      // 빈 문자열이 아닌 경우만 추가
      if (value && value !== '') {
        (changedFields as any)[field] = value;
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-700"></div>
      </div>
    );
  }

  if (currentError || !currentProfile) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <User className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>프로필 정보를 불러올 수 없습니다.</p>
            {currentError && (
              <p className="text-sm text-red-500 mt-2">
                {typeof currentError === 'string' ? currentError : currentError?.message || '알 수 없는 오류가 발생했습니다.'}
              </p>
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
        <CardContent className="p-4 space-y-4">
          {/* 프로필 사진 및 기본 정보 */}
          <div className="flex items-start gap-4">
            <div className="relative">
              <Avatar className="h-16 w-16">
                <AvatarImage src={getImageUrl(currentProfile.photoUrl) || ''} alt={currentProfile.name} />
                <AvatarFallback className="text-lg">
                  {currentProfile.name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>
            
            <div className="flex-1 space-y-2">
              <h3 className="text-lg font-semibold">{currentProfile.name}</h3>
              {currentProfile.phoneNumber && (
                <p className="text-gray-600 text-sm">{currentProfile.phoneNumber}</p>
              )}
            </div>
          </div>

          {/* 소개 */}
          {currentProfile.introduction && (
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2 text-sm">
                <User className="h-4 w-4" />
                소개
              </h4>
              <p className="text-gray-700 text-sm whitespace-pre-line">
                {currentProfile.introduction}
              </p>
            </div>
          )}

          {/* 경력 */}
          {currentProfile.yearsOfExperience && (
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4" />
                교습 경력
              </h4>
              <p className="text-gray-700 text-sm">
                {currentProfile.yearsOfExperience}년
              </p>
            </div>
          )}

          {/* 학력 */}
          {currentProfile.education && currentProfile.education.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2 text-sm">
                <GraduationCap className="h-4 w-4" />
                학력/경력
              </h4>
              <div className="flex flex-wrap gap-2">
                {currentProfile.education.map((item: string, index: number) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* 전문 분야 */}
          {currentProfile.specialties && currentProfile.specialties.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2 text-sm">
                <Award className="h-4 w-4" />
                전문 분야
              </h4>
              <div className="flex flex-wrap gap-2">
                {currentProfile.specialties.map((item: string, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* 자격증 */}
          {currentProfile.certifications && currentProfile.certifications.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2 text-sm">
                <Award className="h-4 w-4" />
                자격증
              </h4>
              <div className="flex flex-wrap gap-2">
                {currentProfile.certifications.map((item: string, index: number) => (
                  <Badge key={index} variant="default" className="text-xs">
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // 전체 모드 (선생님용)
  return (
    <Card className="w-full max-w-2xl mx-auto">
      {showHeader && (
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              선생님 프로필
            </CardTitle>
            {canEdit && !isEditing && (
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
              className={`relative ${isEditing ? 'cursor-pointer' : ''}`}
              onClick={handlePhotoClick}
            >
              <Avatar className={`h-20 w-20 ${isEditing ? 'ring-2 ring-blue-500 ring-offset-2 hover:ring-blue-600' : ''}`}>
                <AvatarImage 
                  src={previewUrl || getImageUrl(currentProfile.photoUrl) || ''} 
                  alt={currentProfile.name} 
                />
                <AvatarFallback className="text-lg">
                  {currentProfile.name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 hover:opacity-100 transition-opacity">
                  <Camera className="h-6 w-6 text-white" />
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
              id="teacher-photo-upload"
              aria-label="프로필 사진 업로드"
              capture="environment"
            />
          </div>
          
          <div className="flex-1 space-y-3">
            <h3 className="text-lg font-semibold">{currentProfile.name}</h3>
            <p className="text-gray-600">{currentProfile.phoneNumber}</p>
            {canEdit && (
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
                placeholder="자신을 소개해주세요..."
                rows={3}
              />
              {formErrors.introduction && (
                <p className="text-sm text-red-500">{formErrors.introduction.message}</p>
              )}
            </>
          ) : (
            <p className="text-gray-700 whitespace-pre-line">
              {currentProfile.introduction || '소개가 없습니다.'}
            </p>
          )}
        </div>

        <Separator />

        {/* 경력 */}
        <div className="space-y-2">
          <h4 className="font-medium flex items-center gap-2">
            <Clock className="h-4 w-4" />
            교습 경력
          </h4>
          {isEditing ? (
            <>
              <Input
                type="number"
                {...register('yearsOfExperience', { valueAsNumber: true })}
                placeholder="경력 연수"
                className="w-32"
              />
              {formErrors.yearsOfExperience && (
                <p className="text-sm text-red-500">{formErrors.yearsOfExperience.message}</p>
              )}
            </>
          ) : (
            <p className="text-gray-700">
              {currentProfile.yearsOfExperience ? `${currentProfile.yearsOfExperience}년` : '경력 정보 없음'}
            </p>
          )}
        </div>

        <Separator />

        {/* 학력 */}
        <div className="space-y-3">
          <h4 className="font-medium flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            학력/경력
          </h4>
          {isEditing ? (
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  placeholder="학력/경력 추가"
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
              <div className="flex flex-wrap gap-2">
                {educationFields.map((field, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {field}
                    <button
                      type="button"
                      onClick={() => removeEducation(index)}
                      className="ml-1 hover:text-red-500"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {currentProfile.education && currentProfile.education.length > 0 ? (
                currentProfile.education.map((item: string, index: number) => (
                  <Badge key={index} variant="secondary">
                    {item}
                  </Badge>
                ))
              ) : (
                <p className="text-gray-500">학력/경력 정보 없음</p>
              )}
            </div>
          )}
        </div>

        <Separator />

        {/* 전문 분야 */}
        <div className="space-y-3">
          <h4 className="font-medium flex items-center gap-2">
            <Award className="h-4 w-4" />
            전문 분야
          </h4>
          {isEditing ? (
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  placeholder="전문 분야 추가"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const input = e.currentTarget;
                      if (input.value.trim()) {
                        appendSpecialty(input.value.trim());
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
                      appendSpecialty(input.value.trim());
                      input.value = '';
                    }
                  }}
                  size="sm"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {specialtyFields.map((field, index) => (
                  <Badge key={index} variant="outline" className="flex items-center gap-1">
                    {field}
                    <button
                      type="button"
                      onClick={() => removeSpecialty(index)}
                      className="ml-1 hover:text-red-500"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {currentProfile.specialties && currentProfile.specialties.length > 0 ? (
                currentProfile.specialties.map((item: string, index: number) => (
                  <Badge key={index} variant="outline">
                    {item}
                  </Badge>
                ))
              ) : (
                <p className="text-gray-500">전문 분야 정보 없음</p>
              )}
            </div>
          )}
        </div>

        <Separator />

        {/* 자격증 */}
        <div className="space-y-3">
          <h4 className="font-medium flex items-center gap-2">
            <Award className="h-4 w-4" />
            자격증
          </h4>
          {isEditing ? (
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  placeholder="자격증 추가"
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
              <div className="flex flex-wrap gap-2">
                {certificationFields.map((field, index) => (
                  <Badge key={index} variant="default" className="flex items-center gap-1">
                    {field}
                    <button
                      type="button"
                      onClick={() => removeCertification(index)}
                      className="ml-1 hover:text-red-500"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {currentProfile.certifications && currentProfile.certifications.length > 0 ? (
                currentProfile.certifications.map((item: string, index: number) => (
                  <Badge key={index} variant="default">
                    {item}
                  </Badge>
                ))
              ) : (
                <p className="text-gray-500">자격증 정보 없음</p>
              )}
            </div>
          )}
        </div>

        {/* 편집 모드 버튼 */}
        {isEditing && canEdit && (
          <div className="flex gap-2 pt-4">
            <Button 
              onClick={onSubmit} 
              disabled={updateProfileMutation.isPending || updatePhotoMutation.isPending}
              className="flex-1"
            >
              {updateProfileMutation.isPending || updatePhotoMutation.isPending ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              저장
            </Button>
            <Button onClick={handleCancel} variant="outline" className="flex-1">
              <X className="h-4 w-4 mr-2" />
              취소
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 