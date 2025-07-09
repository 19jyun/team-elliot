'use client';

import React, { useState } from 'react';
import { useDashboardNavigation } from '@/contexts/DashboardContext';
import { StatusStep } from '@/components/features/student/enrollment/month/StatusStep';
import { toast } from 'sonner';
import { InfoBubble } from '@/components/common/InfoBubble';

interface RefundRequestStepProps {
  refundAmount: number;
  cancelledSessionsCount: number;
  onComplete: () => void;
}

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
  const [accountInfo, setAccountInfo] = useState({
    bank: '',
    accountNumber: '',
    accountHolder: '',
  });
  const [saveAccount, setSaveAccount] = useState(false);

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

  // 입력값 모두 채워져야 버튼 활성화 (은행명, 계좌번호(숫자 8~16자리), 예금주 2글자 이상)
  const isFormValid =
    accountInfo.bank &&
    /^[0-9]{8,16}$/.test(accountInfo.accountNumber) &&
    accountInfo.accountHolder.length >= 2;

  return (
    <div className="flex flex-col min-h-screen bg-white font-[Pretendard Variable] items-center">
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

      {/* 환불금액 카드 */}
      <div className="mt-8 mb-4 w-[335px]">
        <InfoBubble
          label="환불금액"
          value={refundAmount.toLocaleString() + '원'}
          type="amount"
        />
      </div>

      {/* 안내문구 */}
      <div className="w-[335px] flex flex-col items-center mb-2">
        <div className="flex items-center mb-1">
          <span className="text-[#595959] text-sm font-medium px-1.5 py-0.5 rounded text-center">적어주신 계좌번호로 환불을 도와드리겠습니다.</span>
        </div>
        <div className="text-xs text-[#8C8C8C] mt-1 text-center">환불까지 최대 48시간이 걸릴 수 있습니다.</div>
      </div>

      {/* 입력 카드들 */}
      <div className="w-[335px] flex flex-col gap-3 mb-2">
        <InfoBubble
          label="은행명"
          type="select"
          selectValue={accountInfo.bank}
          onSelectChange={e => handleInputChange('bank', e.target.value)}
          options={[
            { value: '', label: '은행명 선택' },
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
          ]}
        />
        <InfoBubble
          label="계좌번호"
          type="input"
          placeholder="계좌번호 입력"
          inputValue={accountInfo.accountNumber}
          onChange={e => handleInputChange('accountNumber', e.target.value.replace(/[^0-9]/g, ''))}
          inputProps={{
            inputMode: 'numeric',
            pattern: '[0-9]*',
            maxLength: 16,
            minLength: 8,
            autoComplete: 'off',
          }}
        />
        <InfoBubble
          label="예금주"
          type="input"
          placeholder="예금주 입력"
          inputValue={accountInfo.accountHolder}
          onChange={e => handleInputChange('accountHolder', e.target.value)}
        />
      </div>

      {/* 체크박스 */}
      <div className="w-[335px] flex items-center mb-6">
        <input
          type="checkbox"
          id="saveAccount"
          checked={saveAccount}
          onChange={e => setSaveAccount(e.target.checked)}
          className="mr-2 w-4 h-4 accent-[#AC9592]"
        />
        <label htmlFor="saveAccount" className="text-sm text-[#595959] select-none">계좌정보 저장하기</label>
      </div>

      {/* 하단 버튼 */}
      <div className="w-[335px] mb-4">
        <button
          onClick={handleSubmit}
          disabled={!isFormValid || isSubmitting}
          className={`w-full py-4 rounded-lg text-base font-semibold leading-snug transition-colors
            ${isFormValid && !isSubmitting
              ? 'bg-[#AC9592] text-white hover:bg-[#8c7a74] cursor-pointer opacity-100'
              : 'bg-[#D9D9D9] text-white cursor-not-allowed opacity-60'}
          `}
        >
          환불 신청
        </button>
      </div>
    </div>
  );
} 