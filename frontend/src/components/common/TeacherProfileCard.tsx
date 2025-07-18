'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTeacherProfile, getTeacherProfileById, updateTeacherProfile } from '@/api/teacher';
import { TeacherProfileResponse, UpdateProfileRequest } from '@/types/api/teacher';
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
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UpdateProfileRequest>({});
  const [tempEducation, setTempEducation] = useState<string[]>([]);
  const [tempSpecialties, setTempSpecialties] = useState<string[]>([]);
  const [tempCertifications, setTempCertifications] = useState<string[]>([]);
  const [newEducation, setNewEducation] = useState('');
  const [newSpecialty, setNewSpecialty] = useState('');
  const [newCertification, setNewCertification] = useState('');

  // 선생님 프로필 정보 조회
  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['teacher-profile', teacherId || 'me'],
    queryFn: () => getTeacherProfileById(teacherId),
    retry: false, // 재시도하지 않음
    staleTime: 5 * 60 * 1000, // 5분간 캐시
    gcTime: 10 * 60 * 1000, // 10분간 가비지 컬렉션 시간
  });

  // 에러 로깅을 useEffect로 처리
  useEffect(() => {
    if (error) {
      console.error('TeacherProfileCard API 호출 실패:', error);
    }
  }, [error]);

  // teacherId 디버깅
  useEffect(() => {
    console.log('TeacherProfileCard에서 teacherId:', teacherId);
  }, [teacherId]);

  // 프로필 업데이트 뮤테이션 (편집 가능한 경우만)
  const updateProfileMutation = useMutation({
    mutationFn: updateTeacherProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-profile'] });
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
    if (!profile) return;
    
    setFormData({
      name: profile.name,
      phoneNumber: profile.phoneNumber,
      introduction: profile.introduction,
      yearsOfExperience: profile.yearsOfExperience,
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
    onCancel?.();
  };

  // 프로필 저장
  const handleSave = () => {
    const updateData: UpdateProfileRequest = {
      ...formData,
      education: tempEducation,
      specialties: tempSpecialties,
      certifications: tempCertifications,
    };
    
    updateProfileMutation.mutate(updateData);
  };

  // 배열 항목 추가
  const addArrayItem = (array: string[], newItem: string, setArray: (items: string[]) => void, setNewItem: (item: string) => void) => {
    if (newItem.trim()) {
      setArray([...array, newItem.trim()]);
      setNewItem('');
    }
  };

  // 배열 항목 삭제
  const removeArrayItem = (array: string[], index: number, setArray: (items: string[]) => void) => {
    setArray(array.filter((_, i) => i !== index));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-700"></div>
      </div>
    );
  }

  if (error) {
    // 인증 실패 시에도 로그아웃하지 않고 에러 메시지만 표시
    return (
      <div className="text-center py-8 text-gray-500">
        선생님 정보를 불러올 수 없습니다.
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-8 text-gray-500">
        프로필 정보가 없습니다.
      </div>
    );
  }

  // 컴팩트 모드 (학생용)
  if (compact) {
    return (
      <Card className="w-full">
        <CardContent className="p-4 space-y-4">
          {/* 프로필 사진 및 기본 정보 */}
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={profile.photoUrl} alt={profile.name} />
              <AvatarFallback className="text-lg">
                {profile.name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            
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
                {profile.education.map((item, index) => (
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
                {profile.specialties.map((item, index) => (
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
                {profile.certifications.map((item, index) => (
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
          <Avatar className="h-20 w-20">
            <AvatarImage src={profile.photoUrl} alt={profile.name} />
            <AvatarFallback className="text-lg">
              {profile.name?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-3">
            {isEditing ? (
              <>
                <Input
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="이름"
                  className="text-lg font-semibold"
                />
                <Input
                  value={formData.phoneNumber || ''}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  placeholder="전화번호"
                />
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold">{profile.name}</h3>
                <p className="text-gray-600">{profile.phoneNumber}</p>
              </>
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
                      addArrayItem(tempEducation, newEducation, setTempEducation, setNewEducation);
                    }
                  }}
                />
                <Button
                  onClick={() => addArrayItem(tempEducation, newEducation, setTempEducation, setNewEducation)}
                  size="sm"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {tempEducation.map((item, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {item}
                    <button
                      onClick={() => removeArrayItem(tempEducation, index, setTempEducation)}
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
                profile.education.map((item, index) => (
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
                      addArrayItem(tempSpecialties, newSpecialty, setTempSpecialties, setNewSpecialty);
                    }
                  }}
                />
                <Button
                  onClick={() => addArrayItem(tempSpecialties, newSpecialty, setTempSpecialties, setNewSpecialty)}
                  size="sm"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {tempSpecialties.map((item, index) => (
                  <Badge key={index} variant="outline" className="flex items-center gap-1">
                    {item}
                    <button
                      onClick={() => removeArrayItem(tempSpecialties, index, setTempSpecialties)}
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
                profile.specialties.map((item, index) => (
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
                      addArrayItem(tempCertifications, newCertification, setTempCertifications, setNewCertification);
                    }
                  }}
                />
                <Button
                  onClick={() => addArrayItem(tempCertifications, newCertification, setTempCertifications, setNewCertification)}
                  size="sm"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {tempCertifications.map((item, index) => (
                  <Badge key={index} variant="default" className="flex items-center gap-1">
                    {item}
                    <button
                      onClick={() => removeArrayItem(tempCertifications, index, setTempCertifications)}
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
                profile.certifications.map((item, index) => (
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
              disabled={updateProfileMutation.isPending}
              className="flex-1"
            >
              {updateProfileMutation.isPending ? (
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