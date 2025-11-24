'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useRouter, useSearchParams } from 'next/navigation';
import { StatusStep } from '@/components/features/student/enrollment/month/StatusStep';
import { InfoBubble } from '@/components/common/InfoBubble';

import { useStudentRefundAccount } from '@/hooks/queries/student/useStudentRefundAccount';
import { useUpdateStudentRefundAccount } from '@/hooks/mutations/student/useUpdateStudentRefundAccount';
import { useCreateRefundRequest } from '@/hooks/mutations/student/useCreateRefundRequest';
import { getRefundReasonOptions, RefundReason } from '@/utils/refundRequestValidation';
import { BANKS } from '@/constants/banks';
import { processBankInfo, getBankNameToSave } from '@/utils/bankUtils';
import { EnrollmentModificationData } from '@/contexts/forms/EnrollmentFormManager';
import { ensureTrailingSlash } from '@/lib/utils/router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { refundRequestSchema, RefundRequestSchemaType } from '@/lib/schemas/enrollment-modification';
import type { StudentRefundAccount } from '@/types/api/student';

interface RefundRequestStepProps {
  modificationData: EnrollmentModificationData;
}

export function RefundRequestStep({ modificationData }: RefundRequestStepProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const enrollmentId = searchParams.get('id') || '';
  const [isSubmitting, setIsSubmitting] = useState(false);

  // React Hook Form 설정
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { isValid, errors },
  } = useForm<RefundRequestSchemaType>({
    resolver: zodResolver(refundRequestSchema),
    defaultValues: {
      bank: '',
      accountNumber: '',
      accountHolder: '',
      customBankName: '',
      reason: RefundReason.PERSONAL_SCHEDULE,
      detailedReason: '',
      saveAccount: false,
    },
    mode: 'onChange', // 입력 후 포커스 아웃 시 검증
  });

  // 조건부 렌더링을 위해 필요한 값들만 watch
  const bank = watch('bank');
  const refundReason = watch('reason');

  // React Query Hooks
  const { data: refundAccountData } = useStudentRefundAccount();
  const refundAccount = refundAccountData as StudentRefundAccount | null | undefined;
  const updateRefundAccountMutation = useUpdateStudentRefundAccount();
  const createRefundRequestMutation = useCreateRefundRequest();

  // 초기 데이터 로드 (기존 계좌 정보)
  useEffect(() => {
    if (refundAccount) {
      const { selectedBank, customBankName } = processBankInfo(
        refundAccount.refundBankName || ''
      );

      setValue('bank', selectedBank);
      setValue('customBankName', customBankName);
      setValue('accountNumber', refundAccount.refundAccountNumber || '');
      setValue('accountHolder', refundAccount.refundAccountHolder || '');

      if (refundAccount.refundBankName) {
        setValue('saveAccount', true);
      }
    }
  }, [refundAccount, setValue]);

  const statusSteps = [
    { icon: '/icons/CourseRegistrationsStatusSteps1.svg', label: '수강 변경', isActive: false, isCompleted: true },
    { icon: '/icons/CourseRegistrationsStatusSteps2.svg', label: '일자 선택', isActive: false, isCompleted: true },
    { icon: '/icons/CourseRegistrationsStatusSteps2.svg', label: '환불 신청', isActive: true, isCompleted: false },
  ];

  const onSubmit = async (formData: RefundRequestSchemaType) => {
    if (isSubmitting) return;
    if (!modificationData) {
      toast.error('수강 변경 정보를 찾을 수 없습니다.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 데이터 준비 로직
      const originalEnrollments = modificationData.originalEnrollments || [];
      const selectedSessionIds = new Set(modificationData.selectedSessionIds || []);

      // 취소된 세션 필터링
      const cancelledSessions = originalEnrollments.filter(enrollment => {
        const enrollmentDate = new Date(enrollment.date).toISOString().split("T")[0];
        const isSelected = originalEnrollments.some(orig => {
          const origDate = new Date(orig.date).toISOString().split("T")[0];
          return origDate === enrollmentDate && selectedSessionIds.has(orig.id);
        });
        
        return !isSelected && enrollment.enrollment && 
          ['CONFIRMED', 'PENDING', 'REFUND_REJECTED_CONFIRMED'].includes(enrollment.enrollment.status);
      });

      const finalBankName = getBankNameToSave(formData.bank, formData.customBankName ?? '');
      const sessionPrice = modificationData.sessionPrice || 50000;
      const refundRequests = [];
      const processedEnrollmentIds = new Set<number>();

      // 환불 요청 생성 Loop
      for (const session of cancelledSessions) {
        if (!session.enrollment || processedEnrollmentIds.has(session.enrollment.id)) continue;
        
        processedEnrollmentIds.add(session.enrollment.id);
        
        const requestData = {
          sessionEnrollmentId: session.enrollment.id,
          reason: formData.reason,
          detailedReason: formData.reason === RefundReason.OTHER ? formData.detailedReason : undefined,
          refundAmount: sessionPrice,
          bankName: finalBankName,
          accountNumber: formData.accountNumber,
          accountHolder: formData.accountHolder
        };

        const response = await createRefundRequestMutation.mutateAsync(requestData);
        refundRequests.push(response);
      }

      // 계좌 정보 저장 (옵션)
      if (formData.saveAccount) {
        try {
          await updateRefundAccountMutation.mutateAsync({
            refundBankName: finalBankName,
            refundAccountNumber: formData.accountNumber,
            refundAccountHolder: formData.accountHolder,
          });
        } catch (error) {
          console.warn('계좌 정보 저장 실패:', error);
        }
      }

      toast.success(`${refundRequests.length}개 세션의 환불 신청이 완료되었습니다.`);
      router.push(ensureTrailingSlash(`/dashboard/student/class/modify?id=${enrollmentId}&step=refund-complete`));

    } catch (error) {
      toast.error(error instanceof Error ? error.message : '환불 신청에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full bg-white font-[Pretendard Variable]">
      {/* 헤더 */}
      <header className="flex-shrink-0 flex flex-col bg-white border-b py-5 border-gray-200">
        <div className="flex gap-10 self-center w-full text-sm font-medium tracking-normal leading-snug max-w-[297px] mt-2 mb-2">
          {statusSteps.map((step, index) => (
            <StatusStep key={index} {...step} />
          ))}
        </div>
        <div className="self-center pb-4 text-base font-medium tracking-normal leading-snug text-center text-[#595959]">
          환불받을 계좌 정보를 입력해주세요.
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="flex-1 min-h-0 overflow-y-auto">
        <div className="flex flex-col items-center px-4 py-6">
          {/* 환불금액 */}
          <div className="mb-4 w-[335px]">
            <InfoBubble
              label="환불금액"
              value={`${(modificationData?.changeAmount || 0).toLocaleString()}원`}
              type="amount"
            />
          </div>

          {/* 환불 사유 (Controller 적용) */}
          <div className="w-[335px] flex flex-col gap-3 mb-4">
            <Controller
              name="reason"
              control={control}
              render={({ field }) => (
                <div className="relative">
                  <InfoBubble
                    label="환불 사유"
                    type="select"
                    ref={field.ref}
                    selectValue={field.value}
                    onSelectChange={field.onChange}
                    options={getRefundReasonOptions()}
                    className={errors.reason ? 'border-red-500 animate-shake' : ''}
                  />
                  {errors.reason && <div className="text-red-500 text-xs mt-1 ml-2">{errors.reason.message}</div>}
                </div>
              )}
            />

            {refundReason === RefundReason.OTHER && (
              <Controller
                name="detailedReason"
                control={control}
                render={({ field }) => (
                  <div className="relative">
                    <InfoBubble
                      label="상세 사유"
                      type="input"
                      ref={field.ref}
                      inputValue={field.value}
                      onChange={field.onChange}
                      placeholder="상세 사유를 입력해주세요"
                      className={errors.detailedReason ? 'border-red-500 animate-shake' : ''}
                    />
                    {errors.detailedReason && <div className="text-red-500 text-xs mt-1 ml-2">{errors.detailedReason.message}</div>}
                  </div>
                )}
              />
            )}
          </div>

          {/* 안내 문구 */}
          <div className="w-[335px] flex flex-col items-center mb-2">
            <div className="flex items-center mb-1">
              <span className="text-[#595959] text-sm font-medium px-1.5 py-0.5 rounded text-center">적어주신 계좌번호로 환불을 도와드리겠습니다.</span>
            </div>
            <div className="text-xs text-[#8C8C8C] mt-1 text-center">환불까지 최대 48시간이 걸릴 수 있습니다.</div>
          </div>

          {/* 계좌 정보 입력 (Controller 적용) */}
          <div className="w-[335px] flex flex-col gap-3 mb-2">
            {/* 은행명 */}
            <Controller
              name="bank"
              control={control}
              render={({ field }) => (
                <div className="relative">
                  <InfoBubble
                    label="은행명"
                    type="select"
                    ref={field.ref}
                    selectValue={field.value}
                    onSelectChange={field.onChange}
                    options={[{ value: '', label: '은행명 선택' }, ...BANKS]}
                    className={errors.bank ? 'border-red-500 animate-shake' : ''}
                  />
                  {errors.bank && <div className="text-red-500 text-xs mt-1 ml-2">{errors.bank.message}</div>}
                </div>
              )}
            />

            {/* 기타 은행명 */}
            {bank === '기타' && (
              <Controller
                name="customBankName"
                control={control}
                render={({ field }) => (
                  <div className="relative">
                    <InfoBubble
                      label="은행명 입력"
                      type="input"
                      ref={field.ref}
                      inputValue={field.value}
                      onChange={field.onChange}
                      placeholder="은행명을 입력하세요"
                      className={errors.customBankName ? 'border-red-500 animate-shake' : ''}
                    />
                    {errors.customBankName && <div className="text-red-500 text-xs mt-1 ml-2">{errors.customBankName.message}</div>}
                  </div>
                )}
              />
            )}

            {/* 계좌번호 */}
            <Controller
              name="accountNumber"
              control={control}
              render={({ field }) => (
                <div className="relative">
                  <InfoBubble
                    label="계좌번호"
                    type="input"
                    ref={field.ref}
                    inputValue={field.value}
                    onChange={(e) => field.onChange(e.target.value.replace(/[^0-9]/g, ''))} // 숫자만 입력
                    placeholder="계좌번호 입력"
                    inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', maxLength: 16, minLength: 8 }}
                    className={errors.accountNumber ? 'border-red-500 animate-shake' : ''}
                  />
                  {errors.accountNumber && <div className="text-red-500 text-xs mt-1 ml-2">{errors.accountNumber.message}</div>}
                </div>
              )}
            />

            {/* 예금주 */}
            <Controller
              name="accountHolder"
              control={control}
              render={({ field }) => (
                <div className="relative">
                  <InfoBubble
                    label="예금주"
                    type="input"
                    ref={field.ref}
                    inputValue={field.value}
                    onChange={field.onChange}
                    placeholder="예금주 입력"
                    className={errors.accountHolder ? 'border-red-500 animate-shake' : ''}
                  />
                  {errors.accountHolder && <div className="text-red-500 text-xs mt-1 ml-2">{errors.accountHolder.message}</div>}
                </div>
              )}
            />
          </div>

          {/* 저장 체크박스 (Controller 적용) */}
          <div className="w-[335px] flex flex-col mb-6">
            <div className="flex items-center mb-1">
              <Controller
                name="saveAccount"
                control={control}
                render={({ field }) => (
                  <input
                    type="checkbox"
                    id="saveAccount"
                    checked={field.value}
                    onChange={field.onChange}
                    ref={field.ref}
                    className="mr-2 w-4 h-4 accent-[#AC9592]"
                  />
                )}
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
            type="submit"
            disabled={!isValid || isSubmitting}
            className={`w-full max-w-[335px] py-4 rounded-lg text-base font-semibold leading-snug transition-colors
              ${isValid && !isSubmitting
                ? 'bg-[#AC9592] text-white hover:bg-[#8c7a74] cursor-pointer opacity-100'
                : 'bg-[#D9D9D9] text-white cursor-not-allowed opacity-60'}
            `}
          >
            {isSubmitting ? '처리 중...' : '환불 신청'}
          </button>
        </div>
      </footer>
    </form>
  );
}