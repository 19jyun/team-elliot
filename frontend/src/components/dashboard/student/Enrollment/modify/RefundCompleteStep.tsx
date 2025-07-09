'use client';

import React from 'react';
import { useDashboardNavigation } from '@/contexts/DashboardContext';
import { StatusStep } from '@/components/features/student/enrollment/month/StatusStep';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';

interface RefundCompleteStepProps {
  refundAmount: number;
  cancelledSessionsCount: number;
}

export function RefundCompleteStep({ refundAmount, cancelledSessionsCount }: RefundCompleteStepProps) {
  const { goBack } = useDashboardNavigation();

  const statusSteps = [
    {
      icon: '/icons/CourseRegistrationsStatusSteps1.svg',
      label: '수강 변경',
      isActive: false,
      isCompleted: true,
    },
    {
      icon: '/icons/CourseRegistrationsStatusSteps2.svg',
      label: '일자 선택',
      isActive: false,
      isCompleted: true,
    },
    {
      icon: '/icons/CourseRegistrationsStatusSteps2.svg',
      label: '환불 신청',
      isActive: false,
      isCompleted: true,
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-white font-[Pretendard Variable]">
      {/* 헤더 */}
      <header className="sticky top-0 z-40 flex flex-col bg-white border-b py-5 border-gray-200">
        <div className="flex gap-10 self-center w-full text-sm font-medium tracking-normal leading-snug max-w-[297px] mt-2 mb-2">
          {statusSteps.map((step, index) => (
            <StatusStep key={index} {...step} />
          ))}
        </div>

        <div className="self-center pb-4 text-base font-medium tracking-normal leading-snug text-center" style={{ color: '#595959' }}>
          환불 신청이 완료되었습니다.
        </div>
      </header>

      {/* 완료 메시지 */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 py-8">
        <div className="text-center max-w-md">
          {/* 완료 아이콘 */}
          <div className="flex justify-center mb-6">
            <CheckCircleIcon className="w-20 h-20 text-green-500" />
          </div>

          {/* 환불 정보 */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-green-900 mb-2">
              환불 신청 완료
            </h2>
            <p className="text-lg font-medium text-green-800 mb-1">
              환불 금액: {refundAmount.toLocaleString()}원
            </p>
            <p className="text-sm text-green-700">
              취소된 세션: {cancelledSessionsCount}개
            </p>
          </div>

          {/* 안내 문구 */}
          <div className="space-y-4 text-gray-600">
            <p className="text-sm">
              환불 신청이 성공적으로 접수되었습니다.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
              <p className="font-medium text-blue-900 mb-2">처리 안내</p>
              <ul className="text-blue-800 space-y-1">
                <li>• 환불은 신청 후 3-5일 내에 처리됩니다.</li>
                <li>• 입력하신 계좌로 환불금이 입금됩니다.</li>
                <li>• 처리 상태는 마이페이지에서 확인하실 수 있습니다.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 하단 버튼 */}
      <div className="flex-shrink-0 px-5 pb-6">
        <Button
          onClick={goBack}
          className="w-full bg-[#AC9592] hover:bg-[#8B7A77]"
        >
          완료
        </Button>
      </div>
    </div>
  );
} 