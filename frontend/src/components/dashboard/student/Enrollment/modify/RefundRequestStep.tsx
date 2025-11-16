'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useRouter, useSearchParams } from 'next/navigation';
import { StatusStep } from '@/components/features/student/enrollment/month/StatusStep';
import { InfoBubble } from '@/components/common/InfoBubble';

import { useStudentRefundAccount } from '@/hooks/queries/student/useStudentRefundAccount';
import { useUpdateStudentRefundAccount } from '@/hooks/mutations/student/useUpdateStudentRefundAccount';
import { useCreateRefundRequest } from '@/hooks/mutations/student/useCreateRefundRequest';
import type { StudentRefundAccount } from '@/types/api/student';
import { 
  validateCompleteRefundRequest, 
  getRefundReasonOptions,
  RefundReason
} from '@/utils/refundRequestValidation';
import { BANKS } from '@/constants/banks';
import { processBankInfo, getBankNameToSave } from '@/utils/bankUtils';
import { EnrollmentModificationData } from '@/contexts/forms/EnrollmentFormManager';
import { ensureTrailingSlash } from '@/lib/utils/router';

interface RefundRequestStepProps {
  modificationData: EnrollmentModificationData;
}

export function RefundRequestStep({ modificationData }: RefundRequestStepProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const enrollmentId = searchParams.get('id') || '';
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [accountInfo, setAccountInfo] = useState({
    bank: '',
    accountNumber: '',
    accountHolder: '',
  });
  const [customBankName, setCustomBankName] = useState(''); // 기타 은행명 입력
  const [saveAccount, setSaveAccount] = useState(false);
  const [refundReason, setRefundReason] = useState<RefundReason>(RefundReason.PERSONAL_SCHEDULE);
  const [detailedReason, setDetailedReason] = useState('');
  
  // React Query 기반 데이터 관리
  const { data: refundAccountData } = useStudentRefundAccount();
  const refundAccount = refundAccountData as StudentRefundAccount | null | undefined;
  const updateRefundAccountMutation = useUpdateStudentRefundAccount();
  const createRefundRequestMutation = useCreateRefundRequest();

  // 환불 계좌 정보가 로드되면 폼에 자동 입력
  useEffect(() => {
    if (refundAccount) {
      // processBankInfo를 사용하여 은행명 처리
      const { selectedBank, customBankName: customBank } = processBankInfo(
        refundAccount.refundBankName || ''
      );
      
      setAccountInfo(prev => ({
        ...prev,
        bank: selectedBank,
        accountNumber: refundAccount.refundAccountNumber || '',
        accountHolder: refundAccount.refundAccountHolder || '',
      }));
      
      setCustomBankName(customBank); // 기타 은행명 설정
      
      // 기존 계좌 정보가 있으면 저장 체크박스를 기본으로 체크
      if (refundAccount.refundBankName && refundAccount.refundAccountNumber && refundAccount.refundAccountHolder) {
        setSaveAccount(true);
      }
    }
  }, [refundAccount]);

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
    
    // 입력 시 해당 필드의 validation 에러 제거
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleRefundReasonChange = (reason: RefundReason) => {
    setRefundReason(reason);
    
    // 환불 사유 변경 시 관련 validation 에러 제거
    if (validationErrors.reason) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.reason;
        return newErrors;
      });
    }
    
    // 기타 사유가 아닌 경우 상세 사유 에러도 제거
    if (reason !== RefundReason.OTHER && validationErrors.detailedReason) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.detailedReason;
        return newErrors;
      });
    }
  };

  const handleDetailedReasonChange = (value: string) => {
    setDetailedReason(value);
    
    // 상세 사유 입력 시 해당 필드의 validation 에러 제거
    if (validationErrors.detailedReason) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.detailedReason;
        return newErrors;
      });
    }
  };

  const handleSubmit = async () => {
    // 중복 제출 방지
    if (isSubmitting) {
      return;
    }
    
    // Context에서 수강 변경 데이터 가져오기
    if (!modificationData) {
      toast.error('수강 변경 정보를 찾을 수 없습니다.');
      return;
    }
    
    // modificationData에서 originalEnrollments와 selectedSessionIds 사용
    const originalEnrollments = modificationData.originalEnrollments || [];
    const selectedSessionIds = new Set(modificationData.selectedSessionIds || []);

    // 기존에 신청된 세션들 (CONFIRMED, PENDING, REFUND_REJECTED_CONFIRMED 상태)
    const originalEnrolledSessions = originalEnrollments.filter(
      (enrollment) =>
        enrollment.enrollment &&
        (enrollment.enrollment.status === "CONFIRMED" ||
          enrollment.enrollment.status === "PENDING" ||
          enrollment.enrollment.status === "REFUND_REJECTED_CONFIRMED")
    );

    // 취소될 세션들 (기존에 신청되었지만 현재 선택되지 않은 세션들)
    const cancelledSessions = originalEnrolledSessions.filter(
      (enrollment) => {
        const enrollmentDate = new Date(enrollment.date).toISOString().split("T")[0];
        // selectedSessionIds에 해당 날짜의 세션이 있는지 확인
        // originalEnrollments에서 날짜로 매칭하여 확인
        return !originalEnrollments.some(orig => {
          const origDate = new Date(orig.date).toISOString().split("T")[0];
          return origDate === enrollmentDate && selectedSessionIds.has(orig.id);
        });
      }
    );

    // 실제 은행명 결정 (getBankNameToSave 사용)
    const finalBankName = getBankNameToSave(accountInfo.bank, customBankName);

    // 각 취소된 세션에 대해 validation 수행
    // modificationData에서 sessionPrice 사용
    const sessionPrice = modificationData.sessionPrice || 50000;
    
    for (const cancelledSession of cancelledSessions) {
      if (!cancelledSession.enrollment) {
        continue; // enrollment가 없으면 건너뛰기
      }
      
      const refundRequestData = {
        sessionEnrollmentId: cancelledSession.enrollment.id,
        reason: refundReason,
        detailedReason: refundReason === RefundReason.OTHER ? detailedReason : undefined,
        refundAmount: sessionPrice,
        bankName: finalBankName,
        accountNumber: accountInfo.accountNumber,
        accountHolder: accountInfo.accountHolder
      };

      // Validation 수행
      const validation = validateCompleteRefundRequest(refundRequestData);
      if (!validation.isValid) {
        // validation 에러를 fieldErrors로 변환
        const fieldErrorMap: Record<string, string> = {};
        validation.errors.forEach(error => {
          fieldErrorMap[error.field] = error.message;
        });
        
        // 에러 상태 설정 및 흔들림 애니메이션 트리거
        setValidationErrors(fieldErrorMap);
        setIsShaking(true);
        setTimeout(() => {
          setIsShaking(false);
          // 1초 후 validation 에러도 자동으로 제거
          setTimeout(() => {
            setValidationErrors({});
          }, 1000);
        }, 1000);
        
        return;
      }
    }

    
    setIsSubmitting(true);
    
    try {
      // 각 취소된 세션에 대해 환불 요청 생성
      const refundRequests = [];
      const processedEnrollmentIds = new Set<number>(); // 중복 방지를 위한 Set

      for (const cancelledSession of cancelledSessions) {
        if (!cancelledSession.enrollment) {
          continue; // enrollment가 없으면 건너뛰기
        }
        
        // 이미 처리된 sessionEnrollmentId인지 확인
        if (processedEnrollmentIds.has(cancelledSession.enrollment.id)) {
          continue;
        }
        
        // 처리된 sessionEnrollmentId로 표시
        processedEnrollmentIds.add(cancelledSession.enrollment.id);
        
        const refundRequest = {
          sessionEnrollmentId: cancelledSession.enrollment.id,
          reason: refundReason,
          detailedReason: refundReason === RefundReason.OTHER ? detailedReason : undefined,
          refundAmount: sessionPrice,
          bankName: finalBankName,
          accountNumber: accountInfo.accountNumber,
          accountHolder: accountInfo.accountHolder
        };

        try {
          const response = await createRefundRequestMutation.mutateAsync(refundRequest);
          refundRequests.push(response);
        } catch (error) {
          throw new Error(`세션 ${cancelledSession.id}의 환불 요청 생성에 실패했습니다.`, error as Error);
        }
      }

      // 계좌 정보 저장 (선택사항)
      if (saveAccount) {
        try {
          const accountData = {
            refundBankName: finalBankName, // 기타 선택 시 customBankName 사용
            refundAccountNumber: accountInfo.accountNumber,
            refundAccountHolder: accountInfo.accountHolder,
          };
          
          await updateRefundAccountMutation.mutateAsync(accountData);
        } catch (error) {
          // 계좌 정보 저장 실패는 환불 신청 성공에 영향을 주지 않음
          console.warn('계좌 정보 저장에 실패했습니다:', error);
        }
      }
      
      toast.success(`${refundRequests.length}개 세션의 환불 신청이 완료되었습니다.`);
      router.push(ensureTrailingSlash(`/dashboard/student/modify?id=${enrollmentId}&step=refund-complete`));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '환불 신청에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 입력값 모두 채워져야 버튼 활성화 (은행명, 계좌번호(숫자 8~16자리), 예금주 2글자 이상, 환불 사유, 기타 선택 시 상세 사유)
  const isFormValid =
    accountInfo.bank &&
    (accountInfo.bank !== '기타' || customBankName.trim().length >= 2) && // 기타 선택 시 customBankName 검증
    /^[0-9]{8,16}$/.test(accountInfo.accountNumber) &&
    accountInfo.accountHolder.length >= 2 &&
    refundReason &&
    (refundReason !== RefundReason.OTHER || detailedReason.trim().length > 0);

  return (
    <div className="flex flex-col h-full bg-white font-[Pretendard Variable]">
      {/* 헤더 */}
      <header className="flex-shrink-0 flex flex-col bg-white border-b py-5 border-gray-200">
        <div className="flex gap-10 self-center w-full text-sm font-medium tracking-normal leading-snug max-w-[297px] mt-2 mb-2">
          {statusSteps.map((step, index) => (
            <StatusStep key={index} {...step} />
          ))}
        </div>

        <div className="self-center pb-4 text-base font-medium tracking-normal leading-snug text-center" style={{ color: '#595959' }}>
          환불받을 계좌 정보를 입력해주세요.
        </div>
      </header>

      {/* 메인 컨텐츠 영역 */}
      <main className="flex-1 min-h-0 overflow-y-auto">
      <div className="flex flex-col items-center px-4 py-6">
      {/* 환불금액 카드 */}
      <div className="mb-4 w-[335px]">
        <InfoBubble
          label="환불금액"
          value={(modificationData?.changeAmount || 0).toLocaleString() + '원'}
          type="amount"
        />
      </div>

      {/* 환불 사유 선택 */}
      <div className="w-[335px] flex flex-col gap-3 mb-4">
        <div className="relative">
          <InfoBubble
            label="환불 사유"
            type="select"
            selectValue={refundReason}
            onSelectChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleRefundReasonChange(e.target.value as RefundReason)}
            options={getRefundReasonOptions()}
            className={isShaking && validationErrors.reason ? 'animate-shake border-red-500' : ''}
          />
          {validationErrors.reason && (
            <div className="text-red-500 text-xs mt-1 ml-2">{validationErrors.reason}</div>
          )}
        </div>
        
        {refundReason === RefundReason.OTHER && (
          <div className="relative">
            <InfoBubble
              label="상세 사유"
              type="input"
              placeholder="상세 사유를 입력해주세요"
              inputValue={detailedReason}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleDetailedReasonChange(e.target.value)}
              className={isShaking && validationErrors.detailedReason ? 'animate-shake border-red-500' : ''}
            />
            {validationErrors.detailedReason && (
              <div className="text-red-500 text-xs mt-1 ml-2">{validationErrors.detailedReason}</div>
            )}
          </div>
        )}
      </div>

      {/* 안내문구 */}
      <div className="w-[335px] flex flex-col items-center mb-2">
        <div className="flex items-center mb-1">
          <span className="text-[#595959] text-sm font-medium px-1.5 py-0.5 rounded text-center">적어주신 계좌번호로 환불을 도와드리겠습니다.</span>
        </div>
        <div className="text-xs text-[#8C8C8C] mt-1 text-center">환불까지 최대 48시간이 걸릴 수 있습니다.</div>
        {refundAccount && refundAccount.refundBankName && (
          <div className="text-xs text-[#AC9592] mt-2 text-center font-medium">
            기존 계좌 정보를 불러왔습니다. 필요시 수정해주세요.
          </div>
        )}
      </div>

      {/* 입력 카드들 */}
      <div className="w-[335px] flex flex-col gap-3 mb-2">
        <div className="relative">
          <InfoBubble
            label="은행명"
            type="select"
            selectValue={accountInfo.bank}
            onSelectChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleInputChange('bank', e.target.value)}
            options={[
              { value: '', label: '은행명 선택' },
              ...BANKS
            ]}
            className={isShaking && validationErrors.bankName ? 'animate-shake border-red-500' : ''}
          />
          {validationErrors.bankName && (
            <div className="text-red-500 text-xs mt-1 ml-2">{validationErrors.bankName}</div>
          )}
        </div>
        
        {/* 기타 은행명 입력 (기타 선택 시에만 표시) */}
        {accountInfo.bank === '기타' && (
          <div className="relative">
            <InfoBubble
              label="은행명 입력"
              type="input"
              placeholder="은행명을 입력하세요"
              inputValue={customBankName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomBankName(e.target.value)}
              className={isShaking && !customBankName.trim() ? 'animate-shake border-red-500' : ''}
            />
            {isShaking && !customBankName.trim() && (
              <div className="text-red-500 text-xs mt-1 ml-2">은행명을 입력해주세요</div>
            )}
          </div>
        )}
        
        <div className="relative">
          <InfoBubble
            label="계좌번호"
            type="input"
            placeholder="계좌번호 입력"
            inputValue={accountInfo.accountNumber}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('accountNumber', e.target.value.replace(/[^0-9]/g, ''))}
            inputProps={{
              inputMode: 'numeric',
              pattern: '[0-9]*',
              maxLength: 16,
              minLength: 8,
              autoComplete: 'off',
            }}
            className={isShaking && validationErrors.accountNumber ? 'animate-shake border-red-500' : ''}
          />
          {validationErrors.accountNumber && (
            <div className="text-red-500 text-xs mt-1 ml-2">{validationErrors.accountNumber}</div>
          )}
        </div>
        
        <div className="relative">
          <InfoBubble
            label="예금주"
            type="input"
            placeholder="예금주 입력"
            inputValue={accountInfo.accountHolder}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('accountHolder', e.target.value)}
            className={isShaking && validationErrors.accountHolder ? 'animate-shake border-red-500' : ''}
          />
          {validationErrors.accountHolder && (
            <div className="text-red-500 text-xs mt-1 ml-2">{validationErrors.accountHolder}</div>
          )}
        </div>
      </div>

      {/* 체크박스 */}
      <div className="w-[335px] flex flex-col mb-6">
        <div className="flex items-center mb-1">
          <input
            type="checkbox"
            id="saveAccount"
            checked={saveAccount}
            onChange={e => setSaveAccount(e.target.checked)}
            className="mr-2 w-4 h-4 accent-[#AC9592]"
          />
          <label htmlFor="saveAccount" className="text-sm text-[#595959] select-none">계좌정보 저장하기</label>
        </div>
        <div className="text-xs text-[#8C8C8C] ml-6">다음 환불 신청 시 이 정보를 자동으로 사용합니다</div>
      </div>
      </div>
      </main>

      {/* 하단 버튼 */}
      <footer className="flex-shrink-0 bg-white border-t border-gray-200 py-4">
        <div className="flex justify-center px-4">
          <button
            onClick={handleSubmit}
            disabled={!isFormValid || isSubmitting}
            className={`w-full max-w-[335px] py-4 rounded-lg text-base font-semibold leading-snug transition-colors
              ${isFormValid && !isSubmitting
                ? 'bg-[#AC9592] text-white hover:bg-[#8c7a74] cursor-pointer opacity-100'
                : 'bg-[#D9D9D9] text-white cursor-not-allowed opacity-60'}
            `}
          >
            환불 신청
          </button>
        </div>
      </footer>
    </div>
  );
} 