'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Building2, 
  Plus, 
  MapPin, 
  Phone, 
  Calendar, 
  Users, 
  AlertTriangle, 
  X
} from 'lucide-react';
import { 
  getMyAcademy, 
  changeAcademy, 
  createAcademy, 
  createAndJoinAcademy 
} from '@/api/teacher';
import { Academy, CreateAcademyRequest } from '@/types/api/teacher';
import { toast } from 'sonner';
import { useDashboardNavigation } from '@/contexts/DashboardContext';

interface CreateAcademyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: CreateAcademyRequest) => void;
}

function CreateAcademyModal({ isOpen, onClose, onConfirm }: CreateAcademyModalProps) {
  const { pushFocus, popFocus } = useDashboardNavigation();
  const [formData, setFormData] = useState<CreateAcademyRequest>({
    name: '',
    code: '',
    description: '',
    address: '',
    phoneNumber: '',
    email: '',
    website: '',
  });

  useEffect(() => {
    if (isOpen) {
      pushFocus('modal');
    } else {
      popFocus();
    }
  }, [isOpen, pushFocus, popFocus]);

  const handleClose = () => {
    popFocus();
    onClose();
  };

  const handleConfirm = () => {
    if (!formData.name.trim() || !formData.code.trim()) {
      toast.error('학원명과 학원 코드는 필수입니다.');
      return;
    }
    popFocus();
    onConfirm(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 transform transition-all max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">새 학원 생성</h3>
          </div>
          <button
            onClick={handleClose}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 내용 */}
        <div className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">학원명 *</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="학원명을 입력하세요"
              className="w-full"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">학원 코드 *</label>
            <Input
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              placeholder="학원 코드를 입력하세요"
              className="w-full"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">설명</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="학원에 대한 설명을 입력하세요"
              className="w-full"
              rows={3}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">주소</label>
            <Input
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="학원 주소를 입력하세요"
              className="w-full"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">연락처</label>
            <Input
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              placeholder="연락처를 입력하세요"
              className="w-full"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">이메일</label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="이메일을 입력하세요"
              className="w-full"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">웹사이트</label>
            <Input
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              placeholder="웹사이트 URL을 입력하세요"
              className="w-full"
            />
          </div>
        </div>

        {/* 버튼 */}
        <div className="flex gap-3 p-6 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={handleClose}
            className="flex-1"
          >
            취소
          </Button>
          <Button
            onClick={handleConfirm}
            className="flex-1"
            disabled={!formData.name.trim() || !formData.code.trim()}
          >
            생성하기
          </Button>
        </div>
      </div>
    </div>
  );
}

interface AcademyManagementProps {
  onBack?: () => void;
}

export default function AcademyManagement({ onBack }: AcademyManagementProps) {
  const router = useRouter();
  const { pushFocus, popFocus } = useDashboardNavigation();
  const [currentAcademy, setCurrentAcademy] = useState<Academy | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [joinCode, setJoinCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [createModal, setCreateModal] = useState(false);

  useEffect(() => {
    loadCurrentAcademy();
    // 컴포넌트가 마운트될 때 포커스를 subpage로 설정
    pushFocus('subpage');
    
    return () => {
      // 컴포넌트가 언마운트될 때 이전 포커스로 복원
      popFocus();
    };
  }, [pushFocus, popFocus]);

  const loadCurrentAcademy = async () => {
    try {
      setIsLoading(true);
      const academy = await getMyAcademy();
      setCurrentAcademy(academy);
    } catch (error) {
      console.error('학원 정보 로드 실패:', error);
      toast.error('학원 정보를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinAcademy = async () => {
    if (!joinCode.trim()) {
      toast.error('학원 코드를 입력해주세요.');
      return;
    }

    try {
      setIsJoining(true);
      const academy = await changeAcademy({ code: joinCode.trim() });
      setCurrentAcademy(academy);
      setJoinCode('');
      toast.success('학원에 성공적으로 가입했습니다.');
    } catch (error: any) {
      console.error('학원 가입 실패:', error);
      toast.error(error.response?.data?.message || '학원 가입에 실패했습니다.');
    } finally {
      setIsJoining(false);
    }
  };

  const handleCreateAcademy = async (formData: CreateAcademyRequest) => {
    try {
      setIsLoading(true);
      const result = await createAndJoinAcademy(formData);
      setCurrentAcademy(result.academy);
      setCreateModal(false);
      toast.success('새 학원이 생성되고 자동으로 소속되었습니다.');
    } catch (error: any) {
      console.error('학원 생성 실패:', error);
      toast.error(error.response?.data?.message || '학원 생성에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="flex overflow-hidden flex-col pb-2 mx-auto w-full bg-white max-w-[480px] py-5 relative">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-5 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-700">내 학원 관리</h1>
          <p className="text-gray-600 mt-1">소속된 학원을 관리하고 새로운 학원에 가입하거나 생성할 수 있습니다.</p>
        </div>
      </div>

      <Separator className="mx-5" />

      {/* 새 학원 가입 섹션 */}
      <div className="px-5 py-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Plus className="h-5 w-5" />
              새 학원 가입
            </CardTitle>
            <CardDescription>
              학원 코드를 입력하여 기존 학원에 가입하거나 새 학원을 생성하세요.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <Input
                placeholder="학원 코드를 입력하세요"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                className="flex-1"
                onKeyPress={(e) => e.key === 'Enter' && handleJoinAcademy()}
              />
              <Button 
                onClick={handleJoinAcademy} 
                disabled={isJoining || !joinCode.trim()}
                className="min-w-[80px] transition-all duration-300 ease-in-out"
                size="sm"
              >
                {isJoining ? '가입 중...' : '가입'}
              </Button>
            </div>
            
            <Separator />
            
            <Button 
              onClick={() => setCreateModal(true)}
              className="w-full"
              size="lg"
            >
              <Building2 className="h-5 w-5 mr-2" />
              새 학원 생성하기
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* 내 학원 섹션 */}
      <div className="px-5 pb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5" />
              내 학원
            </CardTitle>
            <CardDescription>
              현재 소속되어 있는 학원 정보입니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : !currentAcademy ? (
              <div className="text-center py-8 text-gray-500">
                <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>소속된 학원이 없습니다.</p>
                <p className="text-sm">위에서 학원에 가입하거나 새 학원을 생성해보세요.</p>
              </div>
            ) : (
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{currentAcademy.name}</CardTitle>
                      <Badge variant="secondary" className="mt-2">
                        {currentAcademy.code}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2 text-sm">
                    {currentAcademy.address && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span className="truncate">{currentAcademy.address}</span>
                      </div>
                    )}
                    {currentAcademy.phoneNumber && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="h-4 w-4" />
                        <span>{currentAcademy.phoneNumber}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>가입일: {formatDate(currentAcademy.createdAt)}</span>
                    </div>
                  </div>
                  
                  {currentAcademy.description && (
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {currentAcademy.description}
                    </p>
                  )}

                  <Separator />

                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => setJoinCode('')}
                    >
                      다른 학원으로 변경
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 학원 생성 모달 */}
      <CreateAcademyModal
        isOpen={createModal}
        onClose={() => setCreateModal(false)}
        onConfirm={handleCreateAcademy}
      />
    </div>
  );
} 