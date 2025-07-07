'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getMyAcademies, joinAcademy, leaveAcademy, Academy } from '@/api/academy';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, MapPin, Phone, Calendar, Users, Building2 } from 'lucide-react';
import { toast } from 'sonner';

export function AcademyManagement() {
  const router = useRouter();
  const [myAcademies, setMyAcademies] = useState<Academy[]>([]);
  const [joinCode, setJoinCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    loadMyAcademies();
  }, []);

  const loadMyAcademies = async () => {
    try {
      setIsLoading(true);
      const response = await getMyAcademies();
      setMyAcademies(response.data);
    } catch (error) {
      console.error('학원 목록 로드 실패:', error);
      toast.error('학원 목록을 불러오는데 실패했습니다.');
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
      await joinAcademy({ code: joinCode.trim() });
      toast.success('학원 가입이 완료되었습니다.');
      setJoinCode('');
      loadMyAcademies(); // 목록 새로고침
    } catch (error: any) {
      console.error('학원 가입 실패:', error);
      const message = error.response?.data?.message || '학원 가입에 실패했습니다.';
      toast.error(message);
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeaveAcademy = async (academyId: number, academyName: string) => {
    if (!confirm(`정말로 "${academyName}" 학원에서 탈퇴하시겠습니까?`)) {
      return;
    }

    try {
      await leaveAcademy({ academyId });
      toast.success('학원 탈퇴가 완료되었습니다.');
      loadMyAcademies(); // 목록 새로고침
    } catch (error: any) {
      console.error('학원 탈퇴 실패:', error);
      const message = error.response?.data?.message || '학원 탈퇴에 실패했습니다.';
      toast.error(message);
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
    <div className="flex overflow-hidden flex-col pb-2 mx-auto w-full bg-white max-w-[480px] py-5">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-5 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-700">내 학원 관리</h1>
          <p className="text-gray-600 mt-1">가입되어 있는 학원들을 관리하고 새로운 학원에 가입할 수 있습니다.</p>
        </div>
      </div>

      <Separator className="mx-5" />

      {/* 학원 가입 섹션 */}
      <div className="px-5 py-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Plus className="h-5 w-5" />
              새 학원 가입
            </CardTitle>
            <CardDescription>
              학원 코드를 입력하여 새로운 학원에 가입하세요.
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                className="min-w-[80px]"
                size="sm"
              >
                {isJoining ? '가입 중...' : '가입'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 내 학원 목록 */}
      <div className="px-5 pb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5" />
              내가 가입한 학원 ({myAcademies.length})
            </CardTitle>
            <CardDescription>
              현재 가입되어 있는 학원들의 목록입니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : myAcademies.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>가입한 학원이 없습니다.</p>
                <p className="text-sm">위에서 학원 코드를 입력하여 가입해보세요.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {myAcademies.map((academy) => (
                  <Card key={academy.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{academy.name}</CardTitle>
                          <Badge variant="secondary" className="mt-2">
                            {academy.code}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="h-4 w-4" />
                          <span className="truncate">{academy.address}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone className="h-4 w-4" />
                          <span>{academy.phoneNumber}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span>가입일: {formatDate(academy.createdAt)}</span>
                        </div>
                      </div>
                      
                      {academy.description && (
                        <p className="text-sm text-gray-600 line-clamp-3">
                          {academy.description}
                        </p>
                      )}

                      <Separator />

                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleLeaveAcademy(academy.id, academy.name)}
                        >
                          탈퇴하기
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 