'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Calendar, Clock, MapPin, User, BookOpen } from 'lucide-react';
import { SlideUpModal } from '@/components/common/SlideUpModal';
import { getClassDetails } from '@/api/class';
import { ClassDetailsResponse } from '@/types/api/class';
import { toast } from 'sonner';
import cn from 'classnames';

interface ClassDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  classId: number;
}

interface TeacherInfo {
  name: string;
  introduction?: string;
  photoUrl?: string;
  education?: string[];
}

interface LocationInfo {
  name: string;
  address?: string;
  mapImageUrl?: string;
}

export function ClassDetailModal({ isOpen, onClose, classId }: ClassDetailModalProps) {
  const [classDetails, setClassDetails] = useState<ClassDetailsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  console.log('ClassDetailModal 렌더링:', { isOpen, classId, classDetails, isLoading });

  useEffect(() => {
    if (isOpen && classId) {
      loadClassDetails();
    }
  }, [isOpen, classId]);

  const loadClassDetails = async () => {
    try {
      setIsLoading(true);
      console.log('클래스 상세 정보 로드 시작, classId:', classId);
      const response = await getClassDetails(classId);
      console.log('클래스 상세 정보 응답:', response);
      setClassDetails(response);
    } catch (error) {
      console.error('클래스 상세 정보 로드 실패:', error);
      toast.error('클래스 정보를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (time: string | Date) => {
    const date = typeof time === 'string' ? new Date(time) : time;
    return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const formatDayOfWeek = (dayOfWeek: string) => {
    const dayMap: Record<string, string> = {
      'MONDAY': '월요일',
      'TUESDAY': '화요일',
      'WEDNESDAY': '수요일',
      'THURSDAY': '목요일',
      'FRIDAY': '금요일',
      'SATURDAY': '토요일',
      'SUNDAY': '일요일',
    };
    return dayMap[dayOfWeek] || dayOfWeek;
  };

  const handleRefundRequest = () => {
    // TODO: 환불 요청 페이지로 이동하거나 환불 요청 모달 열기
    console.log('환불 요청:', classId);
    toast.info('환불 요청 기능이 준비 중입니다.');
  };

  if (!classDetails && !isLoading) {
    return null;
  }

  return (
    <SlideUpModal isOpen={isOpen} onClose={onClose} title="클래스 상세 정보">
      <div className="flex flex-col h-full max-h-[90vh]">
        {/* 스크롤 가능한 본문 */}
        <div className="flex-1 min-h-0 overflow-y-auto px-5 pt-6 pb-2 font-pretendard">
          {/* 수업 제목 */}
          <div className="text-[20px] font-semibold text-[#262626] leading-[130%]">
            {classDetails?.className}
          </div>
          {/* 요일 및 시간 */}
          <div className="mt-2 text-base text-[#262626]">
            {formatDayOfWeek(classDetails?.dayOfWeek ?? '')} {formatTime(classDetails?.startTime ?? '')} - {formatTime(classDetails?.endTime ?? '')}
          </div>
          {/* 구분선 */}
          <div className="my-3 border-b border-gray-200" />
          {/* 수업 설명 */}
          <div className="text-base text-[#262626] whitespace-pre-line">
            {classDetails?.classDetail?.description || classDetails?.description || '클래스 설명이 없습니다.'}
          </div>
          {/* 선생님 정보 */}
          {classDetails?.teacher && (
            <div className="mt-6 flex items-start gap-4">
              <div className="flex-1">
                <div className="font-semibold text-[#262626]">{classDetails.teacher.name}</div>
                <div className="mt-2 text-base text-[#262626] whitespace-pre-line">
                  {(classDetails.teacher as any).education?.length > 0
                    ? (classDetails.teacher as any).education.join('\n')
                    : '학력/경력 정보 없음'}
                </div>
              </div>
              {classDetails.teacher.photoUrl && (
                <img
                  src={classDetails.teacher.photoUrl}
                  alt="프로필"
                  className="w-20 h-20 rounded-lg object-cover"
                />
              )}
            </div>
          )}
        </div>
        {/* 하단 고정 버튼 */}
        <div className="flex-shrink-0 flex flex-col w-full bg-white px-5 pb-4 pt-2">
          <button
            onClick={handleRefundRequest}
            className={cn(
              'flex-1 shrink gap-2.5 self-stretch px-2.5 py-4 rounded-lg min-w-[240px] size-full text-base font-semibold leading-snug text-white',
              'bg-[#AC9592] hover:bg-[#8c7a74] transition-colors',
            )}
          >
            수강 변경/취소
          </button>
          <div className="flex flex-col items-center px-20 pt-2 pb-3 w-full max-sm:hidden">
            <div className="flex shrink-0 bg-black h-[5px] rounded-[100px] w-[134px]" />
          </div>
        </div>
      </div>
    </SlideUpModal>
  );
} 