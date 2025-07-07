'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PhoneInput } from '@/components/ui/phone-input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { User, Phone, Mail, Calendar, Edit, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { getMyProfile, updateMyProfile } from '@/api/student';
import { StudentProfile, UpdateProfileRequest } from '@/types/api/student';

export function PersonalInfoManagement() {
  const [personalInfo, setPersonalInfo] = useState<StudentProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedInfo, setEditedInfo] = useState<UpdateProfileRequest>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadPersonalInfo();
  }, []);

  const loadPersonalInfo = async () => {
    try {
      setIsLoading(true);
      const response = await getMyProfile();
      setPersonalInfo(response);
      setEditedInfo({
        name: response.name,
        phoneNumber: response.phoneNumber || '',
        emergencyContact: response.emergencyContact || '',
        birthDate: response.birthDate ? response.birthDate.split('T')[0] : '',
        notes: response.notes || '',
        level: response.level || '',
      });
    } catch (error) {
      console.error('개인 정보 로드 실패:', error);
      toast.error('개인 정보를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    if (personalInfo) {
      setEditedInfo({
        name: personalInfo.name,
        phoneNumber: personalInfo.phoneNumber || '',
        emergencyContact: personalInfo.emergencyContact || '',
        birthDate: personalInfo.birthDate ? personalInfo.birthDate.split('T')[0] : '',
        notes: personalInfo.notes || '',
        level: personalInfo.level || '',
      });
    }
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (personalInfo) {
      setEditedInfo({
        name: personalInfo.name,
        phoneNumber: personalInfo.phoneNumber || '',
        emergencyContact: personalInfo.emergencyContact || '',
        birthDate: personalInfo.birthDate ? personalInfo.birthDate.split('T')[0] : '',
        notes: personalInfo.notes || '',
        level: personalInfo.level || '',
      });
    }
    setIsEditing(false);
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      const response = await updateMyProfile(editedInfo);
      setPersonalInfo(response);
      setIsEditing(false);
      toast.success('개인 정보가 성공적으로 수정되었습니다.');
    } catch (error) {
      console.error('개인 정보 수정 실패:', error);
      toast.error('개인 정보 수정에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof UpdateProfileRequest, value: string) => {
    setEditedInfo(prev => ({
      ...prev,
      [field]: value,
    }));
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

  if (isLoading && !personalInfo) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!personalInfo) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-500">개인 정보를 불러올 수 없습니다.</p>
          <Button onClick={loadPersonalInfo} className="mt-4">
            다시 시도
          </Button>
        </div>
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
        <User className="h-8 w-8 text-blue-600" />
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
                    onClick={handleSave}
                    size="sm"
                    className="flex items-center gap-2"
                    disabled={isLoading}
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
                <Input
                  value={editedInfo.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="이름을 입력하세요"
                />
              ) : (
                <div className="p-3 bg-gray-50 rounded-md">
                  <span className="text-gray-900">{personalInfo.name}</span>
                </div>
              )}
            </div>

            {/* 전화번호 */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">전화번호</label>
              {isEditing ? (
                <PhoneInput
                  value={editedInfo.phoneNumber || ''}
                  onChange={(value) => handleInputChange('phoneNumber', value)}
                  placeholder="전화번호를 입력하세요"
                />
              ) : (
                <div className="p-3 bg-gray-50 rounded-md flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-900">
                    {personalInfo.phoneNumber 
                      ? personalInfo.phoneNumber.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3')
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
                <PhoneInput
                  value={editedInfo.emergencyContact || ''}
                  onChange={(value) => handleInputChange('emergencyContact', value)}
                  placeholder="비상연락처를 입력하세요"
                />
              ) : (
                <div className="p-3 bg-gray-50 rounded-md flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-900">
                    {personalInfo.emergencyContact 
                      ? personalInfo.emergencyContact.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3')
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
                <Input
                  value={editedInfo.birthDate || ''}
                  onChange={(e) => handleInputChange('birthDate', e.target.value)}
                  placeholder="생년월일을 입력하세요"
                  type="date"
                />
              ) : (
                <div className="p-3 bg-gray-50 rounded-md flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-900">{formatDate(personalInfo.birthDate)}</span>
                </div>
              )}
            </div>

            {/* 레벨 */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">레벨</label>
              {isEditing ? (
                <select
                  value={editedInfo.level || ''}
                  onChange={(e) => handleInputChange('level', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">레벨 선택</option>
                  <option value="초급">초급</option>
                  <option value="중급">중급</option>
                  <option value="고급">고급</option>
                </select>
              ) : (
                <div className="p-3 bg-gray-50 rounded-md">
                  <span className="text-gray-900">{personalInfo.level || '미입력'}</span>
                </div>
              )}
            </div>

            {/* 특이사항 */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">특이사항</label>
              {isEditing ? (
                <Input
                  value={editedInfo.notes || ''}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="특이사항을 입력하세요 (알러지, 부상 이력 등)"
                />
              ) : (
                <div className="p-3 bg-gray-50 rounded-md">
                  <span className="text-gray-900">{personalInfo.notes || '미입력'}</span>
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
                  <span>{personalInfo.userId}</span>
                </div>
                <div className="flex justify-between">
                  <span>가입일</span>
                  <span>{formatDateTime(personalInfo.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span>최종 수정일</span>
                  <span>{formatDateTime(personalInfo.updatedAt)}</span>
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