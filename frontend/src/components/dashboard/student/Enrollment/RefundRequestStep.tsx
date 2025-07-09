'use client';

import React, { useState } from 'react';
import { useDashboardNavigation } from '@/contexts/DashboardContext';
import { StatusStep } from '@/app/(dashboard)/dashboard/student/enroll/[month]/StatusStep';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface RefundRequestStepProps {
  refundAmount: number;
  cancelledSessionsCount: number;
  onComplete: () => void;
}

// 은행 목록
const banks = [
  { value: 'shinhan', label: '신한은행' },
  { value: 'kb', label: 'KB국민은행' },
  { value: 'woori', label: '우리은행' },
  { value: 'hana', label: '하나은행' },
  { value: 'nh', label: 'NH농협은행' },
  { value: 'ibk', label: 'IBK기업은행' },
  { value: 'kakao', label: '카카오뱅크' },
  { value: 'toss', label: '토스뱅크' },
  { value: 'kbank', label: '케이뱅크' },
  { value: 'other', label: '기타' },
];

export function RefundRequestStep({ refundAmount, cancelledSessionsCount, onComplete }: RefundRequestStepProps) {
  const { goBack } = useDashboardNavigation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 계좌 정보 상태
  const [accountInfo, setAccountInfo] = useState({
    bank: '',
    accountNumber: '',
    accountHolder: '',
  });

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
      isActive: true,
      isCompleted: false,
    },
  ];

  const handleInputChange = (field: string, value: string) => {
    setAccountInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    // 필수 필드 검증
    if (!accountInfo.bank || !accountInfo.accountNumber || !accountInfo.accountHolder) {
      toast.error('모든 필드를 입력해주세요.');
      return;
    }

    // 계좌번호 형식 검증 (숫자만)
    if (!/^\d+$/.test(accountInfo.accountNumber.replace(/\s/g, ''))) {
      toast.error('계좌번호는 숫자만 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // TODO: 환불 신청 API 호출
      console.log('환불 신청:', {
        refundAmount,
        cancelledSessionsCount,
        accountInfo
      });
      
      // 임시로 1초 대기
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('환불 신청이 완료되었습니다.');
      onComplete();
    } catch (error) {
      console.error('환불 신청 실패:', error);
      toast.error('환불 신청에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
          환불받을 계좌 정보를 입력해주세요.
        </div>
      </header>

      {/* 환불 정보 요약 */}
      <div className="px-5 py-4 bg-blue-50 border-b border-blue-100">
        <div className="text-center">
          <p className="text-lg font-semibold text-blue-900">
            환불 금액: {refundAmount.toLocaleString()}원
          </p>
          <p className="text-sm text-blue-700 mt-1">
            취소된 세션: {cancelledSessionsCount}개
          </p>
        </div>
      </div>

      {/* 계좌 정보 입력 폼 */}
      <div className="flex-1 px-5 py-6">
        <div className="max-w-md mx-auto space-y-6">
          {/* 은행 선택 */}
          <div className="space-y-2">
            <label htmlFor="bank" className="text-sm font-medium text-gray-700">
              은행
            </label>
            <select
              id="bank"
              value={accountInfo.bank}
              onChange={(e) => handleInputChange('bank', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#AC9592] focus:border-transparent"
            >
              <option value="">은행을 선택해주세요</option>
              {banks.map((bank) => (
                <option key={bank.value} value={bank.value}>
                  {bank.label}
                </option>
              ))}
            </select>
          </div>

          {/* 계좌번호 */}
          <div className="space-y-2">
            <label htmlFor="accountNumber" className="text-sm font-medium text-gray-700">
              계좌번호
            </label>
            <Input
              id="accountNumber"
              type="text"
              placeholder="계좌번호를 입력해주세요"
              value={accountInfo.accountNumber}
              onChange={(e) => handleInputChange('accountNumber', e.target.value)}
              className="w-full"
            />
          </div>

          {/* 예금주 */}
          <div className="space-y-2">
            <label htmlFor="accountHolder" className="text-sm font-medium text-gray-700">
              예금주
            </label>
            <Input
              id="accountHolder"
              type="text"
              placeholder="예금주명을 입력해주세요"
              value={accountInfo.accountHolder}
              onChange={(e) => handleInputChange('accountHolder', e.target.value)}
              className="w-full"
            />
          </div>

          {/* 안내 문구 */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              • 환불은 신청 후 3-5일 내에 처리됩니다.<br/>
              • 계좌 정보는 환불 처리 목적으로만 사용됩니다.<br/>
              • 정확한 계좌 정보를 입력해주세요.
            </p>
          </div>
        </div>
      </div>

      {/* 하단 버튼 */}
      <div className="flex-shrink-0 px-5 pb-6">
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={goBack}
            className="flex-1"
            disabled={isSubmitting}
          >
            뒤로가기
          </Button>
          <Button
            onClick={handleSubmit}
            className="flex-1 bg-[#AC9592] hover:bg-[#8B7A77]"
            disabled={isSubmitting}
          >
            {isSubmitting ? '처리 중...' : '환불 신청하기'}
          </Button>
        </div>
      </div>
    </div>
  );
} 