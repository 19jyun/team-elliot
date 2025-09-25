'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Settings, Edit, Save, X } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useSession } from '@/lib/auth/AuthProvider';
import { UpdatePrincipalAcademyRequest } from '@/types/api/principal';
import { usePrincipalApi } from '@/hooks/principal/usePrincipalApi';

export default function PrincipalAcademyManagementPage() {
  const { status } = useSession()
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UpdatePrincipalAcademyRequest>({
    name: '',
    address: '',
    phoneNumber: '',
    description: '',
  });


  // API 기반 데이터 관리
  const { academy, loadAcademy, updateAcademy, isLoading, error } = usePrincipalApi();

  // academy 데이터가 로드되면 formData 업데이트
  useEffect(() => {
    if (academy) {
      setFormData({
        name: academy.name || '',
        address: academy.address || '',
        phoneNumber: academy.phoneNumber || '',
        description: academy.description || '',
      });
    }
  }, [academy]);

  // 초기 데이터 로드
  useEffect(() => {
    loadAcademy();
  }, [loadAcademy]);

  // 학원 정보 수정 뮤테이션
  const updateAcademyMutation = useMutation({
    mutationFn: updateAcademy,
    onSuccess: () => {
      toast.success('학원 정보가 수정되었습니다.');
      setIsEditing(false);
    },
    onError: (error: unknown) => {
      const errorMessage = error && typeof error === 'object' && 'response' in error 
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message 
        : '학원 정보 수정에 실패했습니다.';
      toast.error(errorMessage || '학원 정보 수정에 실패했습니다.');
    },
  });

  const handleEdit = () => {
    if (academy) {
      setFormData({
        name: academy.name || '',
        address: academy.address || '',
        phoneNumber: academy.phoneNumber || '',
        description: academy.description || '',
      });
    }
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSave = () => {
    if (!formData.name?.trim()) {
      toast.error('학원명은 필수입니다.');
      return;
    }
    updateAcademyMutation.mutate(formData);
  };

  // 로딩 상태 처리
  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // 에러 처리
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-full">
        <p className="text-red-500">데이터를 불러오는데 실패했습니다.</p>
        <button
          onClick={() => loadAcademy()}
          className="mt-4 px-4 py-2 bg-stone-700 text-white rounded-lg hover:bg-stone-800"
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white max-w-[480px] mx-auto">
      <div className="flex-1 overflow-y-auto px-5 py-6">
        <div className="space-y-6">
          {/* 학원 정보 카드 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                학원 정보
              </CardTitle>
              <CardDescription>
                학원명, 주소, 전화번호, 설명 등을 수정할 수 있습니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">학원명 *</label>
                  {isEditing ? (
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="학원명을 입력하세요"
                      className="mt-1"
                    />
                  ) : (
                    <p className="text-sm text-gray-600 mt-1">{academy?.name}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium">학원 코드</label>
                  <p className="text-sm text-gray-600 mt-1">{academy?.code}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">주소</label>
                  {isEditing ? (
                    <Input
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="학원 주소를 입력하세요"
                      className="mt-1"
                    />
                  ) : (
                    <p className="text-sm text-gray-600 mt-1">{academy?.address || '등록되지 않음'}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium">전화번호</label>
                  {isEditing ? (
                    <Input
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      placeholder="학원 전화번호를 입력하세요"
                      className="mt-1"
                    />
                  ) : (
                    <p className="text-sm text-gray-600 mt-1">{academy?.phoneNumber || '등록되지 않음'}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium">설명</label>
                  {isEditing ? (
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="학원에 대한 설명을 입력하세요"
                      className="mt-1"
                      rows={3}
                    />
                  ) : (
                    <p className="text-sm text-gray-600 mt-1">{academy?.description || '등록되지 않음'}</p>
                  )}
                </div>
              </div>
              
              <div className="mt-6 flex gap-2">
                {isEditing ? (
                  <>
                    <Button 
                      variant="outline" 
                      onClick={handleCancel}
                      className="flex-1"
                      disabled={updateAcademyMutation.isPending}
                    >
                      <X className="h-4 w-4 mr-2" />
                      취소
                    </Button>
                    <Button 
                      onClick={handleSave}
                      className="flex-1"
                      disabled={updateAcademyMutation.isPending}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      저장
                    </Button>
                  </>
                ) : (
                  <Button 
                    variant="outline" 
                    onClick={handleEdit}
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    학원 정보 수정
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 