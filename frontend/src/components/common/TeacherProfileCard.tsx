'use client';

import React, { useState, useEffect } from 'react';
import { updateTeacherProfile } from '@/api/teacher';
import { useTeacherData } from '@/hooks/redux/useTeacherData';
import { useAppDispatch } from '@/store/hooks';
import { updateTeacherProfile as updateTeacherProfileAction } from '@/store/slices/teacherSlice';
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
  const dispatch = useAppDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UpdateProfileRequest>({});
  const [tempEducation, setTempEducation] = useState<string[]>([]);
  const [tempSpecialties, setTempSpecialties] = useState<string[]>([]);
  const [tempCertifications, setTempCertifications] = useState<string[]>([]);
  const [newEducation, setNewEducation] = useState('');
  const [newSpecialty, setNewSpecialty] = useState('');
  const [newCertification, setNewCertification] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Redux store에서 Teacher 데이터 가져오기
  const { userProfile, isLoading, error } = useTeacherData();

  // 프로필 업데이트 함수
  const updateProfile = async (data: UpdateProfileRequest) => {
    try {
      setIsUpdating(true);
      const updatedProfile = await updateTeacherProfile(data);
      
      // Redux store 직접 업데이트
      dispatch(updateTeacherProfileAction(updatedProfile));
      toast.success('프로필이 성공적으로 업데이트되었습니다.');
      setIsEditing(false);
      onSave?.();
    } catch (error: any) {
      console.error('프로필 업데이트 실패:', error);
      toast.error('프로필 업데이트에 실패했습니다.');
    } finally {
      setIsUpdating(false);
    }
  };

  // 편집 모드 시작
  const handleEdit = () => {
    if (!userProfile) return;
    
    setFormData({
      introduction: userProfile.introduction || '',
      yearsOfExperience: userProfile.yearsOfExperience || 0,
    });
    setTempEducation(userProfile.education || []);
    setTempSpecialties(userProfile.specialties || []);
    setTempCertifications(userProfile.certifications || []);
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
    
    updateProfile(updateData);
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

  if (!userProfile) {
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
              <AvatarImage src={userProfile.photoUrl} alt={userProfile.name} />
              <AvatarFallback className="text-lg">
                {userProfile.name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-2">
              <h3 className="text-lg font-semibold">{userProfile.name}</h3>
              {userProfile.phoneNumber && (
                <p className="text-gray-600 text-sm">{userProfile.phoneNumber}</p>
              )}
            </div>
          </div>

          {/* 소개 */}
          {userProfile.introduction && (
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2 text-sm">
                <User className="h-4 w-4" />
                소개
              </h4>
              <p className="text-gray-700 text-sm whitespace-pre-line">
                {userProfile.introduction}
              </p>
            </div>
          )}

          {/* 경력 */}
          {userProfile.yearsOfExperience && (
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4" />
                교습 경력
              </h4>
              <p className="text-gray-700 text-sm">
                {userProfile.yearsOfExperience}년
              </p>
            </div>
          )}

          {/* 학력 */}
          {userProfile.education && userProfile.education.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2 text-sm">
                <GraduationCap className="h-4 w-4" />
                학력/경력
              </h4>
              <div className="flex flex-wrap gap-2">
                {userProfile.education.map((item: string, index: number) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* 전문 분야 */}
          {userProfile.specialties && userProfile.specialties.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2 text-sm">
                <Award className="h-4 w-4" />
                전문 분야
              </h4>
              <div className="flex flex-wrap gap-2">
                {userProfile.specialties.map((item: string, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* 자격증 */}
          {userProfile.certifications && userProfile.certifications.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2 text-sm">
                <Award className="h-4 w-4" />
                자격증
              </h4>
              <div className="flex flex-wrap gap-2">
                {userProfile.certifications.map((item: string, index: number) => (
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
            <AvatarImage src={userProfile.photoUrl} alt={userProfile.name} />
            <AvatarFallback className="text-lg">
              {userProfile.name?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-3">
            <h3 className="text-lg font-semibold">{userProfile.name}</h3>
            <p className="text-gray-600">{userProfile.phoneNumber}</p>
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
              {userProfile.introduction || '소개가 없습니다.'}
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
              {userProfile.yearsOfExperience ? `${userProfile.yearsOfExperience}년` : '경력 정보 없음'}
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
              {userProfile.education && userProfile.education.length > 0 ? (
                userProfile.education.map((item: string, index: number) => (
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
              {userProfile.specialties && userProfile.specialties.length > 0 ? (
                userProfile.specialties.map((item: string, index: number) => (
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
              {userProfile.certifications && userProfile.certifications.length > 0 ? (
                userProfile.certifications.map((item: string, index: number) => (
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
              disabled={isUpdating}
              className="flex-1"
            >
              {isUpdating ? (
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