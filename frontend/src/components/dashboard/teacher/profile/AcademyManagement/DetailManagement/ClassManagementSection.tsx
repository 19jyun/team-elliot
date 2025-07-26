'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, CheckCircle, XCircle, Clock, Users, Calendar, Play } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDraftClasses, getActiveClasses, updateClassStatus } from '@/api/teacher';
import { toast } from 'sonner';
import { SlideUpModal } from '@/components/common/SlideUpModal';

interface DraftClass {
  id: number;
  className: string;
  classCode: string;
  description?: string;
  maxStudents: number;
  tuitionFee: number;
  dayOfWeek: string;
  level: string;
  startTime: string;
  endTime: string;
  startDate: string;
  endDate: string;
  status: string;
  teacher: {
    id: number;
    name: string;
  };
  createdAt: string;
}

interface ActiveClass {
  id: number;
  className: string;
  classCode: string;
  description?: string;
  maxStudents: number;
  tuitionFee: number;
  dayOfWeek: string;
  level: string;
  startTime: string;
  endTime: string;
  startDate: string;
  endDate: string;
  status: string;
  teacher: {
    id: number;
    name: string;
  };
  classSessions: Array<{
    id: number;
    date: string;
    startTime: string;
    endTime: string;
    currentStudents: number;
    maxStudents: number;
  }>;
}

type LevelType = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

const levelBgColor: Record<LevelType, string> = {
  BEGINNER: '#F4E7E7',
  INTERMEDIATE: '#FBF4D8',
  ADVANCED: '#CBDFE3',
};

export default function ClassManagementSection() {
  const queryClient = useQueryClient();
  const [selectedClass, setSelectedClass] = useState<ActiveClass | null>(null);
  const [isClassDetailModalOpen, setIsClassDetailModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'draft'>('active');

  // DRAFT 상태 강의 목록 조회
  const { data: draftClasses, isLoading: isDraftLoading } = useQuery({
    queryKey: ['draft-classes'],
    queryFn: getDraftClasses,
  });

  // 활성 강의 목록 조회
  const { data: activeClasses, isLoading: isActiveLoading } = useQuery({
    queryKey: ['active-classes'],
    queryFn: getActiveClasses,
  });

  // 강의 상태 변경 뮤테이션
  const updateStatusMutation = useMutation({
    mutationFn: ({ classId, status, reason }: { classId: number; status: string; reason?: string }) =>
      updateClassStatus(classId, { status: status as 'DRAFT' | 'OPEN' | 'CLOSED', reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['draft-classes'] });
      queryClient.invalidateQueries({ queryKey: ['active-classes'] });
      toast.success('강의 상태가 변경되었습니다.');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || '강의 상태 변경에 실패했습니다.');
    },
  });

  const handleApprove = (classId: number) => {
    updateStatusMutation.mutate({
      classId,
      status: 'OPEN',
      reason: '강의 승인 완료',
    });
  };

  const handleReject = (classId: number) => {
    updateStatusMutation.mutate({
      classId,
      status: 'CLOSED',
      reason: '강의 거절',
    });
  };

  const handleClassClick = (classItem: ActiveClass) => {
    setSelectedClass(classItem);
    setIsClassDetailModalOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    try {
      // ISO 문자열인 경우 (예: "1970-01-01T14:30:00.000Z")
      if (timeString.includes('T')) {
        const date = new Date(timeString);
        return date.toTimeString().slice(0, 5); // "HH:MM" 형식
      }
      // 이미 "HH:MM" 형식인 경우
      if (timeString.includes(':')) {
        return timeString.slice(0, 5);
      }
      // 기타 경우
      return timeString;
    } catch {
      return timeString;
    }
  };

  const getLevelLabel = (level: string) => {
    const levelMap: Record<string, string> = {
      'BEGINNER': '초급',
      'INTERMEDIATE': '중급',
      'ADVANCED': '고급',
    };
    return levelMap[level] || level;
  };

  const getDayLabel = (day: string) => {
    const dayMap: Record<string, string> = {
      'MONDAY': '월',
      'TUESDAY': '화',
      'WEDNESDAY': '수',
      'THURSDAY': '목',
      'FRIDAY': '금',
      'SATURDAY': '토',
      'SUNDAY': '일',
    };
    return dayMap[day] || day;
  };

  const getSafeLevel = (level: string): LevelType => {
    return level === 'INTERMEDIATE' || level === 'ADVANCED' ? level : 'BEGINNER';
  };

  return (
    <div className="flex flex-col h-full">
      {/* 탭 네비게이션 */}
      <div className="flex-shrink-0 flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('active')}
          className={`flex-1 focus:outline-none transition-colors ${
            activeTab === 'active'
              ? 'text-stone-700 border-b-2 border-stone-700 bg-stone-50'
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
          }`}
        >
          <div className="flex justify-center items-center py-1.5 px-2 text-xs font-medium">
            클래스 관리
          </div>
        </button>
        <button
          onClick={() => setActiveTab('draft')}
          className={`flex-1 focus:outline-none transition-colors ${
            activeTab === 'draft'
              ? 'text-stone-700 border-b-2 border-stone-700 bg-stone-50'
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
          }`}
        >
          <div className="flex justify-center items-center py-1.5 px-2 text-xs font-medium">
            승인 대기
          </div>
        </button>
      </div>

      {/* 컨텐츠 영역 */}
      <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4">
        {/* 클래스 관리 탭 */}
        {activeTab === 'active' && (
          <div className="space-y-4">
            {isActiveLoading ? (
              <div className="text-center py-8 text-gray-500">
                <p>클래스 목록을 불러오는 중...</p>
              </div>
            ) : activeClasses?.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Play className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>진행 중인 클래스가 없습니다.</p>
                <p className="text-sm">승인 대기 탭에서 강의를 승인하면 여기에 표시됩니다.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {activeClasses?.map((classItem: ActiveClass) => {
                  const safeLevel = getSafeLevel(classItem.level);
                  
                  return (
                    <div
                      key={classItem.id}
                      className="relative flex flex-col p-4 rounded-lg border border-gray-200 cursor-pointer hover:shadow-md transition-colors"
                      style={{ background: levelBgColor[safeLevel] || '#F8F5E9' }}
                      onClick={() => handleClassClick(classItem)}
                    >
                      {/* 클래스 정보 */}
                      <div style={{
                        color: 'var(--Primary-Dark, #573B30)',
                        fontFamily: 'Pretendard Variable',
                        fontSize: 16,
                        fontStyle: 'normal',
                        fontWeight: 600,
                        lineHeight: '140%',
                        letterSpacing: '-0.16px',
                        marginBottom: '8px',
                      }}>
                        {classItem.className}
                      </div>
                      
                      {/* 수업 시간 */}
                      <div style={{
                        color: 'var(--Primary-Dark, #573B30)',
                        fontFamily: 'Pretendard Variable',
                        fontSize: 14,
                        fontStyle: 'normal',
                        fontWeight: 500,
                        lineHeight: '140%',
                        letterSpacing: '-0.14px',
                        marginBottom: '4px',
                      }}>
                        {getDayLabel(classItem.dayOfWeek)} {formatTime(classItem.startTime)} ~ {formatTime(classItem.endTime)}
                      </div>
                      
                      {/* 수업 진행 기간 */}
                      <div style={{
                        color: 'var(--Primary-Dark, #573B30)',
                        fontFamily: 'Pretendard Variable',
                        fontSize: 12,
                        fontStyle: 'normal',
                        fontWeight: 400,
                        lineHeight: '140%',
                        letterSpacing: '-0.12px',
                        marginBottom: '8px',
                      }}>
                        {formatDate(classItem.startDate)} ~ {formatDate(classItem.endDate)}
                      </div>

                      {/* 추가 정보 */}
                      <div className="flex items-center justify-between text-xs text-gray-600">
                        <span>담당: {classItem.teacher.name}</span>
                        <span>세션: {classItem.classSessions.length}개</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 승인 대기 탭 */}
        {activeTab === 'draft' && (
          <div className="space-y-4">
            {isDraftLoading ? (
              <div className="text-center py-8 text-gray-500">
                <p>강의 목록을 불러오는 중...</p>
              </div>
            ) : draftClasses?.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>승인 대기 중인 강의가 없습니다.</p>
                <p className="text-sm">선생님들이 강의 개설을 요청하면 여기에 표시됩니다.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {draftClasses?.map((classItem: DraftClass) => (
                  <Card key={classItem.id} className="border-l-4 border-l-yellow-500">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{classItem.className}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary">{classItem.classCode}</Badge>
                            <Badge variant="outline">{getLevelLabel(classItem.level)}</Badge>
                          </div>
                        </div>
                        <div className="text-right text-sm text-gray-500">
                          <p>신청일: {formatDate(classItem.createdAt)}</p>
                          <p>담당: {classItem.teacher.name}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                        <div>
                          <span className="text-gray-600">수업 시간:</span>
                          <p className="font-medium">
                            {getDayLabel(classItem.dayOfWeek)} {formatTime(classItem.startTime)} - {formatTime(classItem.endTime)}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-600">수업 기간:</span>
                          <p className="font-medium">
                            {formatDate(classItem.startDate)} ~ {formatDate(classItem.endDate)}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-600">최대 인원:</span>
                          <p className="font-medium">{classItem.maxStudents}명</p>
                        </div>
                        <div>
                          <span className="text-gray-600">수강료:</span>
                          <p className="font-medium">{classItem.tuitionFee.toLocaleString()}원</p>
                        </div>
                      </div>

                      {classItem.description && (
                        <div className="mb-3">
                          <span className="text-gray-600 text-sm">강의 설명:</span>
                          <p className="text-sm mt-1">{classItem.description}</p>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleApprove(classItem.id)}
                          disabled={updateStatusMutation.isPending}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          승인
                        </Button>
                        <Button
                          onClick={() => handleReject(classItem.id)}
                          disabled={updateStatusMutation.isPending}
                          variant="destructive"
                          className="flex-1"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          거절
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 클래스 상세 모달 */}
      {selectedClass && (
        <SlideUpModal
          isOpen={isClassDetailModalOpen}
          onClose={() => {
            setIsClassDetailModalOpen(false);
            setSelectedClass(null);
          }}
          title={`${selectedClass.className} - 세션 목록`}
          contentClassName="pb-6"
        >
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600">클래스 정보</span>
                <Badge variant="outline">{selectedClass.classCode}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">담당:</span>
                  <p className="font-medium">{selectedClass.teacher.name}</p>
                </div>
                <div>
                  <span className="text-gray-600">레벨:</span>
                  <p className="font-medium">{getLevelLabel(selectedClass.level)}</p>
                </div>
                <div>
                  <span className="text-gray-600">수업 시간:</span>
                  <p className="font-medium">
                    {getDayLabel(selectedClass.dayOfWeek)} {formatTime(selectedClass.startTime)} - {formatTime(selectedClass.endTime)}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">수강료:</span>
                  <p className="font-medium">{selectedClass.tuitionFee.toLocaleString()}원</p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-base font-semibold text-gray-700 mb-3">
                세션 목록 ({selectedClass.classSessions.length}개)
              </h4>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {selectedClass.classSessions.map((session) => {
                  const safeLevel = getSafeLevel(selectedClass.level);
                  
                  return (
                    <div
                      key={session.id}
                      className="relative flex flex-col p-4 rounded-lg border border-gray-200"
                      style={{ background: levelBgColor[safeLevel] || '#F8F5E9' }}
                    >
                      {/* 날짜 정보 */}
                      <div style={{
                        color: 'var(--Primary-Dark, #573B30)',
                        fontFamily: 'Pretendard Variable',
                        fontSize: 16,
                        fontStyle: 'normal',
                        fontWeight: 600,
                        lineHeight: '140%',
                        letterSpacing: '-0.16px',
                        marginBottom: '8px',
                      }}>
                        {new Date(session.date).toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          weekday: 'long'
                        })}
                      </div>
                      
                      {/* 시간 정보 */}
                      <div style={{
                        color: 'var(--Primary-Dark, #573B30)',
                        fontFamily: 'Pretendard Variable',
                        fontSize: 14,
                        fontStyle: 'normal',
                        fontWeight: 500,
                        lineHeight: '140%',
                        letterSpacing: '-0.14px',
                        marginBottom: '4px',
                      }}>
                        {formatTime(session.startTime)} ~ {formatTime(session.endTime)}
                      </div>
                      
                      {/* 수강 인원 정보 */}
                      <div style={{
                        color: 'var(--Primary-Dark, #573B30)',
                        fontFamily: 'Pretendard Variable',
                        fontSize: 12,
                        fontStyle: 'normal',
                        fontWeight: 400,
                        lineHeight: '140%',
                        letterSpacing: '-0.12px',
                      }}>
                        <Users className="h-4 w-4 inline mr-1" />
                        {session.currentStudents}/{session.maxStudents}명
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </SlideUpModal>
      )}
    </div>
  );
} 