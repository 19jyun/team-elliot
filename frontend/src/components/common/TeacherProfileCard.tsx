'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { updateTeacherProfile, updateTeacherProfilePhoto } from '@/api/teacher';
import { UpdateProfileRequest } from '@/types/api/teacher';
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
import { useTeacherApi } from '@/hooks/teacher/useTeacherApi';

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
  const [formData, setFormData] = useState<UpdateProfileRequest>({});
  const [tempEducation, setTempEducation] = useState<string[]>([]);
  const [tempSpecialties, setTempSpecialties] = useState<string[]>([]);
  const [tempCertifications, setTempCertifications] = useState<string[]>([]);
  const [newEducation, setNewEducation] = useState('');
  const [newSpecialty, setNewSpecialty] = useState('');
  const [newCertification, setNewCertification] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // API 기반 데이터 관리
  const { profile, loadProfile, isLoading, error, isTeacher } = useTeacherApi();

  // 컴포넌트 마운트 시 프로필 로드
  useEffect(() => {
    if (isTeacher && !profile) {
      loadProfile();
    }
  }, [isTeacher]);

  // 프로필 업데이트 뮤테이션
  const updateProfileMutation = useMutation({
    mutationFn: updateTeacherProfile,
    onSuccess: () => {
      // API 데이터 다시 로드
      loadProfile();
      toast.success('프로필이 성공적으로 업데이트되었습니다.');
      setIsEditing(false);
      onSave?.();
    },
    onError: (error) => {
      console.error('프로필 업데이트 실패:', error);
      toast.error('프로필 업데이트에 실패했습니다.');
    },
  });

  // 사진 업로드 뮤테이션
  const updatePhotoMutation = useMutation({
    mutationFn: updateTeacherProfilePhoto,
    onSuccess: () => {
      // API 데이터 다시 로드
      loadProfile();
      toast.success('프로필 사진이 성공적으로 업로드되었습니다.');
      setSelectedPhoto(null);
      setPreviewUrl(null);
    },
    onError: (error) => {
      console.error('사진 업로드 실패:', error);
      toast.error('사진 업로드에 실패했습니다.');
    },
  });

  // 편집 모드 시작
  const handleEdit = () => {
    if (!profile) return;
    
    setFormData({
      introduction: profile.introduction || '',
      yearsOfExperience: profile.yearsOfExperience || 0,
    });
    setTempEducation(profile.education || []);
    setTempSpecialties(profile.specialties || []);
    setTempCertifications(profile.certifications || []);
    setIsEditing(true);
  };

  // 편집 취소
  const handleCancel = () => {
    setIsEditing(false);
    setFormData({});
    setTempEducation([]);
    setTempSpecialties([]);
    setTempCertifications([]);
    setNewEducation('');
    setNewSpecialty('');
    setNewCertification('');
    setSelectedPhoto(null);
    setPreviewUrl(null);
    onCancel?.();
  };

  // 사진 클릭 핸들러
  const handlePhotoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isEditing && fileInputRef.current) {
      fileInputRef.current.click();
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
  const handleSave = () => {
    const updatedData = {
      ...formData,
      education: tempEducation,
      specialties: tempSpecialties,
      certifications: tempCertifications,
    };
    
    // 프로필 데이터 업데이트
    updateProfileMutation.mutate(updatedData);
    
    // 선택된 사진이 있으면 사진도 업로드
    if (selectedPhoto) {
      updatePhotoMutation.mutate(selectedPhoto);
    }
  };

  // 교육사항 추가
  const addEducation = () => {
    if (newEducation.trim()) {
      setTempEducation([...tempEducation, newEducation.trim()]);
      setNewEducation('');
    }
  };

  // 교육사항 삭제
  const removeEducation = (index: number) => {
    setTempEducation(tempEducation.filter((_, i) => i !== index));
  };

  // 전문 분야 추가
  const addSpecialty = () => {
    if (newSpecialty.trim()) {
      setTempSpecialties([...tempSpecialties, newSpecialty.trim()]);
      setNewSpecialty('');
    }
  };

  // 전문 분야 삭제
  const removeSpecialty = (index: number) => {
    setTempSpecialties(tempSpecialties.filter((_, i) => i !== index));
  };

  // 자격증 추가
  const addCertification = () => {
    if (newCertification.trim()) {
      setTempCertifications([...tempCertifications, newCertification.trim()]);
      setNewCertification('');
    }
  };

  // 자격증 삭제
  const removeCertification = (index: number) => {
    setTempCertifications(tempCertifications.filter((_, i) => i !== index));
  };

  // 초기 로딩 상태 (프로필이 없고 Teacher 권한이 있는 경우)
  const isInitialLoading = !profile && isTeacher && !error;

  if (isInitialLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-700"></div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <User className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>프로필 정보를 불러올 수 없습니다.</p>
            {error && (
              <p className="text-sm text-red-500 mt-2">{error}</p>
            )}
            <Button 
              onClick={() => loadProfile()} 
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
                <AvatarImage src={getImageUrl(profile.photoUrl) || ''} alt={profile.name} />
                <AvatarFallback className="text-lg">
                  {profile.name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>
            
            <div className="flex-1 space-y-2">
              <h3 className="text-lg font-semibold">{profile.name}</h3>
              {profile.phoneNumber && (
                <p className="text-gray-600 text-sm">{profile.phoneNumber}</p>
              )}
            </div>
          </div>

          {/* 소개 */}
          {profile.introduction && (
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2 text-sm">
                <User className="h-4 w-4" />
                소개
              </h4>
              <p className="text-gray-700 text-sm whitespace-pre-line">
                {profile.introduction}
              </p>
            </div>
          )}

          {/* 경력 */}
          {profile.yearsOfExperience && (
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4" />
                교습 경력
              </h4>
              <p className="text-gray-700 text-sm">
                {profile.yearsOfExperience}년
              </p>
            </div>
          )}

          {/* 학력 */}
          {profile.education && profile.education.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2 text-sm">
                <GraduationCap className="h-4 w-4" />
                학력/경력
              </h4>
              <div className="flex flex-wrap gap-2">
                {profile.education.map((item: string, index: number) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* 전문 분야 */}
          {profile.specialties && profile.specialties.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2 text-sm">
                <Award className="h-4 w-4" />
                전문 분야
              </h4>
              <div className="flex flex-wrap gap-2">
                {profile.specialties.map((item: string, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* 자격증 */}
          {profile.certifications && profile.certifications.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2 text-sm">
                <Award className="h-4 w-4" />
                자격증
              </h4>
              <div className="flex flex-wrap gap-2">
                {profile.certifications.map((item: string, index: number) => (
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
              className={`relative ${isEditing ? 'cursor-pointer' : ''}`}
              onClick={handlePhotoClick}
            >
              <Avatar className={`h-20 w-20 ${isEditing ? 'ring-2 ring-blue-500 ring-offset-2 hover:ring-blue-600' : ''}`}>
                <AvatarImage 
                  src={previewUrl || getImageUrl(profile.photoUrl) || ''} 
                  alt={profile.name} 
                />
                <AvatarFallback className="text-lg">
                  {profile.name?.charAt(0)}
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
            <h3 className="text-lg font-semibold">{profile.name}</h3>
            <p className="text-gray-600">{profile.phoneNumber}</p>
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
            <Textarea
              value={formData.introduction || ''}
              onChange={(e) => setFormData({ ...formData, introduction: e.target.value })}
              placeholder="자신을 소개해주세요..."
              rows={3}
            />
          ) : (
            <p className="text-gray-700 whitespace-pre-line">
              {profile.introduction || '소개가 없습니다.'}
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
            <Input
              type="number"
              value={formData.yearsOfExperience || ''}
              onChange={(e) => setFormData({ ...formData, yearsOfExperience: parseInt(e.target.value) || 0 })}
              placeholder="경력 연수"
              className="w-32"
            />
          ) : (
            <p className="text-gray-700">
              {profile.yearsOfExperience ? `${profile.yearsOfExperience}년` : '경력 정보 없음'}
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
                  value={newEducation}
                  onChange={(e) => setNewEducation(e.target.value)}
                  placeholder="학력/경력 추가"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addEducation();
                    }
                  }}
                />
                <Button onClick={addEducation} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {tempEducation.map((item, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {item}
                    <button
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
              {profile.education && profile.education.length > 0 ? (
                profile.education.map((item: string, index: number) => (
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
                  value={newSpecialty}
                  onChange={(e) => setNewSpecialty(e.target.value)}
                  placeholder="전문 분야 추가"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addSpecialty();
                    }
                  }}
                />
                <Button onClick={addSpecialty} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {tempSpecialties.map((item, index) => (
                  <Badge key={index} variant="outline" className="flex items-center gap-1">
                    {item}
                    <button
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
              {profile.specialties && profile.specialties.length > 0 ? (
                profile.specialties.map((item: string, index: number) => (
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
                  value={newCertification}
                  onChange={(e) => setNewCertification(e.target.value)}
                  placeholder="자격증 추가"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCertification();
                    }
                  }}
                />
                <Button onClick={addCertification} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {tempCertifications.map((item, index) => (
                  <Badge key={index} variant="default" className="flex items-center gap-1">
                    {item}
                    <button
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
              {profile.certifications && profile.certifications.length > 0 ? (
                profile.certifications.map((item: string, index: number) => (
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
        {isEditing && (
          <div className="flex gap-2 pt-4">
            <Button 
              onClick={handleSave} 
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