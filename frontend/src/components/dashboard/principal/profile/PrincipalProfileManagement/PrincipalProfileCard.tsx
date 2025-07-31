'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPrincipalProfile, updatePrincipalProfile } from '@/api/principal';
import { PrincipalProfile, UpdatePrincipalProfileRequest } from '@/types/api/principal';
import { toast } from 'sonner';
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

interface PrincipalProfileCardProps {
  principalId?: number; // 특정 원장 ID (없으면 현재 로그인한 원장)
  isEditable?: boolean; // 편집 가능 여부
  onSave?: () => void;
  onCancel?: () => void;
  showHeader?: boolean; // 헤더 표시 여부
  compact?: boolean; // 컴팩트 모드
}

export function PrincipalProfileCard({ 
  principalId,
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

  const queryClient = useQueryClient();

  // 원장 프로필 정보 조회
  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['principal-profile', principalId || 'me'],
    queryFn: () => getPrincipalProfile(principalId),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5분간 캐시
    gcTime: 10 * 60 * 1000, // 10분간 가비지 컬렉션 시간
  });

  // 에러 로깅을 useEffect로 처리
  useEffect(() => {
    if (error) {
      console.error('PrincipalProfileCard API 호출 실패:', error);
    }
  }, [error]);

  // 프로필 업데이트 뮤테이션 (편집 가능한 경우만)
  const updateProfileMutation = useMutation({
    mutationFn: updatePrincipalProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['principal-profile'] });
      toast.success('프로필이 성공적으로 업데이트되었습니다.');
      setIsEditing(false);
      onSave?.();
    },
    onError: (error) => {
      console.error('프로필 업데이트 실패:', error);
      toast.error('프로필 업데이트에 실패했습니다.');
    },
  });

  // 편집 모드 시작
  const handleEdit = () => {
    if (profile) {
      setFormData({
        introduction: profile.introduction || '',
        education: profile.education || [],
        certifications: profile.certifications || [],
      });
      setTempEducation(profile.education || []);
      setTempCertifications(profile.certifications || []);
    }
    setIsEditing(true);
  };

  // 편집 모드 취소
  const handleCancel = () => {
    setIsEditing(false);
    setFormData({});
    setTempEducation([]);
    setTempCertifications([]);
    onCancel?.();
  };

  // 저장
  const handleSave = () => {
    const updatedData = {
      ...formData,
      education: tempEducation,
      certifications: tempCertifications,
    };
    updateProfileMutation.mutate(updatedData);
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
            <Avatar className="h-12 w-12">
              <AvatarImage src={profile.photoUrl} alt={profile.name} />
              <AvatarFallback>
                {profile.name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-semibold">{profile.name}</h3>
              <p className="text-sm text-gray-600">{profile.introduction}</p>
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
          <Avatar className="h-20 w-20">
            <AvatarImage src={profile.photoUrl} alt={profile.name} />
            <AvatarFallback className="text-lg">
              {profile.name?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          
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
              placeholder="자신에 대한 소개를 작성해주세요."
              rows={4}
            />
          ) : (
            <p className="text-gray-700 whitespace-pre-wrap">
              {profile.introduction || '소개가 없습니다.'}
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
              {profile.education && profile.education.length > 0 ? (
                profile.education.map((education: string, index: number) => (
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
              {profile.certifications && profile.certifications.length > 0 ? (
                profile.certifications.map((certification: string, index: number) => (
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
            <Button onClick={handleCancel} variant="outline">
              <X className="h-4 w-4 mr-2" />
              취소
            </Button>
            <Button 
              onClick={handleSave}
              disabled={updateProfileMutation.isPending}
            >
              <Save className="h-4 w-4 mr-2" />
              저장
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 