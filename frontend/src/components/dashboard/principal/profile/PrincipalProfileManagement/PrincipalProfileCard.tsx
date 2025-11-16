'use client';

import React, { useState, useRef } from 'react';
import { UpdatePrincipalProfileRequest, PrincipalProfile } from '@/types/api/principal';
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
  const [formData, setFormData] = useState<UpdatePrincipalProfileRequest>({});
  const [tempEducation, setTempEducation] = useState<string[]>([]);
  const [tempCertifications, setTempCertifications] = useState<string[]>([]);
  const [newEducation, setNewEducation] = useState('');
  const [newCertification, setNewCertification] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // React Query 기반 데이터 관리
  const { data: profile, isLoading: profileLoading, error } = usePrincipalProfile();
  const typedProfile = profile as PrincipalProfile | null | undefined;
  const updateProfileMutation = useUpdatePrincipalProfile();
  const updatePhotoMutation = useUpdatePrincipalProfilePhoto();

  // 편집 모드 시작
  const handleEdit = () => {
    if (typedProfile) {
      setFormData({
        introduction: typedProfile.introduction || '',
        education: typedProfile.education || [],
        certifications: typedProfile.certifications || [],
      });
      setTempEducation(typedProfile.education || []);
      setTempCertifications(typedProfile.certifications || []);
    }
    setIsEditing(true);
  };

  // 편집 모드 취소
  const handleCancel = () => {
    setIsEditing(false);
    setFormData({});
    setTempEducation([]);
    setTempCertifications([]);
    setSelectedPhoto(null);
    setPreviewUrl(null);
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
  const handleSave = () => {
    const updatedData = {
      ...formData,
      education: tempEducation,
      certifications: tempCertifications,
    };
    
    // 프로필 데이터 업데이트
    updateProfileMutation.mutate(updatedData, {
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
            <Textarea
              value={formData.introduction || ''}
              onChange={(e) => setFormData({ ...formData, introduction: e.target.value })}
              placeholder="자신에 대한 소개를 작성해주세요."
              rows={4}
            />
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
                  value={newEducation}
                  onChange={(e) => setNewEducation(e.target.value)}
                  placeholder="교육사항을 입력하세요"
                  onKeyPress={(e) => e.key === 'Enter' && addEducation()}
                />
                <Button onClick={addEducation} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2">
                {tempEducation.map((education, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Badge variant="secondary" className="flex-1">
                      {education}
                    </Badge>
                    <Button
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
                  value={newCertification}
                  onChange={(e) => setNewCertification(e.target.value)}
                  placeholder="자격증을 입력하세요"
                  onKeyPress={(e) => e.key === 'Enter' && addCertification()}
                />
                <Button onClick={addCertification} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2">
                {tempCertifications.map((certification, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Badge variant="default" className="flex-1">
                      {certification}
                    </Badge>
                    <Button
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
              onClick={handleSave}
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