'use client';

import React, { useState, useMemo } from 'react';
// [변경] Context 대신 Next.js 네비게이션 훅 사용
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

import { usePrincipalEnrollments } from '@/hooks/queries/principal/usePrincipalEnrollments';
import { usePrincipalRefundRequests } from '@/hooks/queries/principal/usePrincipalRefundRequests';
import { useApproveEnrollment } from '@/hooks/mutations/principal/useApproveEnrollment';
import { useRejectEnrollment } from '@/hooks/mutations/principal/useRejectEnrollment';
import { useApproveRefund } from '@/hooks/mutations/principal/useApproveRefund';
import { useRejectRefund } from '@/hooks/mutations/principal/useRejectRefund';
import { Button } from '@/components/ui/button';
import { PrincipalRequestCard } from '../components/requests/PrincipalRequestCard';
import { PrincipalRejectionFormModal } from '../components/modals/PrincipalRejectionFormModal';
import { toUnifiedRequestVM } from '@/lib/adapters/principal';
import type { PrincipalEnrollment } from '@/types/api/principal';
import type { RefundRequestResponse, RefundRequestListResponse } from '@/types/api/refund';
import Image from 'next/image';

export function EnrollmentRefundManagementContainer() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // 1. [UI 상태] URL에서 탭과 필터 상태 가져오기 (기본값 설정)
  const selectedTab = (searchParams.get('tab') as 'enrollment' | 'refund') || 'enrollment';
  const selectedStatusFilter = searchParams.get('status') || 'ALL';

  // 2. [UI 상태] URL 업데이트 함수 (Context 메서드 대체)
  const updateQueryParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    // 탭이 바뀌면 필터와 확장 상태를 초기화하는 것이 좋음
    if (key === 'tab') {
      params.set('status', 'ALL');
      setExpandedCardId(null);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  // React Query 데이터 로딩
  const { data: enrollmentsData, isLoading: enrollmentsLoading, error: enrollmentsError } = usePrincipalEnrollments();
  const { data: refundRequestsData, isLoading: refundRequestsLoading, error: refundRequestsError } = usePrincipalRefundRequests();
  
  // 데이터 메모이제이션
  const enrollments = useMemo(() => enrollmentsData || [], [enrollmentsData]);
  const refundRequests = useMemo(
    () => (refundRequestsData as RefundRequestListResponse | undefined)?.refundRequests || [],
    [refundRequestsData]
  );

  const isLoading = enrollmentsLoading || refundRequestsLoading;
  const error = enrollmentsError || refundRequestsError;
  
  // Mutations
  const approveEnrollmentMutation = useApproveEnrollment();
  const rejectEnrollmentMutation = useRejectEnrollment();
  const approveRefundMutation = useApproveRefund();
  const rejectRefundMutation = useRejectRefund();
  
  const isProcessing = 
    approveEnrollmentMutation.isPending || 
    rejectEnrollmentMutation.isPending ||
    approveRefundMutation.isPending ||
    rejectRefundMutation.isPending;
  
  // 로컬 UI 상태 (URL에 저장할 필요 없는 일시적 상태)
  const [expandedCardId, setExpandedCardId] = useState<number | null>(null);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<{ id: number } | null>(null);

  // 통합된 요청 데이터 생성
  const unifiedRequests = useMemo(() => {
    const requests = selectedTab === 'enrollment' 
      ? (enrollments as unknown as PrincipalEnrollment[]) || []
      : (refundRequests as unknown as RefundRequestResponse[]) || [];
    
    return requests.map(request => 
      toUnifiedRequestVM(request, selectedTab)
    );
  }, [selectedTab, enrollments, refundRequests]);

  // 필터링된 요청 목록
  const filteredRequests = useMemo(() => {
    if (selectedStatusFilter === 'ALL') return unifiedRequests;
    return unifiedRequests.filter(request => request.status === selectedStatusFilter);
  }, [unifiedRequests, selectedStatusFilter]);

  // 필터 옵션
  const statusFilterOptions = selectedTab === 'enrollment' 
    ? [
        { value: 'ALL', label: '전체' },
        { value: 'PENDING', label: '대기중' },
        { value: 'CONFIRMED', label: '승인됨' },
        { value: 'REJECTED', label: '거절됨' }
      ]
    : [
        { value: 'ALL', label: '전체' },
        { value: 'PENDING', label: '대기중' },
        { value: 'APPROVED', label: '승인됨' },
        { value: 'REJECTED', label: '거절됨' }
      ];

  // 카드 클릭 핸들러
  const handleCardClick = (requestId: number) => {
    setExpandedCardId(expandedCardId === requestId ? null : requestId);
  };

  // 승인/거절 핸들러 (기존 로직 유지)
  const handleApprove = (requestId: number) => {
    if (selectedTab === 'enrollment') {
      approveEnrollmentMutation.mutate(requestId);
    } else {
      approveRefundMutation.mutate(requestId);
    }
  };

  const handleReject = (requestId: number) => {
    setSelectedRequest({ id: requestId });
    setShowRejectionModal(true);
  };

  const handleRejectionSubmit = (reason: string, detailedReason?: string) => {
      if (!selectedRequest) return;

      const mutationOptions = {
        onSuccess: () => {
          setShowRejectionModal(false);
          setSelectedRequest(null);
        },
      };

      if (selectedTab === 'enrollment') {
        rejectEnrollmentMutation.mutate(
          {
            enrollmentId: selectedRequest.id,
            data: { reason, detailedReason },
          },
          mutationOptions
        );
      } else {
        rejectRefundMutation.mutate(
          {
            refundId: selectedRequest.id,
            data: { reason, detailedReason },
          },
          mutationOptions
        );
      }
    };

  const handleCloseRejectionModal = () => {
    setShowRejectionModal(false);
    setSelectedRequest(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-700" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-full">
        <p className="text-stone-500">데이터를 불러오는 중 오류가 발생했습니다.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white max-w-[480px] mx-auto min-h-0">
      <header className="flex-shrink-0 bg-white border-b border-gray-200 py-5 px-5">
        <div>
          <h1 className="text-2xl font-bold text-stone-700">수강신청/환불신청 관리</h1>
        </div>
        
        {/* 탭 버튼: URL 업데이트 */}
        <div className="flex gap-2 mt-4">
          <Button
            variant={selectedTab === 'enrollment' ? 'default' : 'outline'}
            size="sm"
            className="text-xs px-3 py-2 h-8"
            onClick={() => updateQueryParams('tab', 'enrollment')}
          >
            수강 신청 관리
          </Button>
          <Button
            variant={selectedTab === 'refund' ? 'default' : 'outline'}
            size="sm"
            className="text-xs px-3 py-2 h-8"
            onClick={() => updateQueryParams('tab', 'refund')}
          >
            환불 신청 관리
          </Button>
        </div>
        
        {/* 필터 버튼: URL 업데이트 */}
        <div className="flex gap-2 flex-wrap mt-3">
          {statusFilterOptions.map((option) => (
            <Button
              key={option.value}
              variant={selectedStatusFilter === option.value ? 'default' : 'outline'}
              size="sm"
              className="text-xs px-2 py-1 h-7"
              onClick={() => updateQueryParams('status', option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="flex-1 min-h-0 bg-white px-5 py-4">
        <div className="h-full overflow-y-auto max-h-[calc(100vh-330px)]">
          {filteredRequests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Image
                src="/images/logo/team-eliot-2.png"
                alt="요청이 없습니다."
                width={120}
                height={120}
                className="mx-auto mb-4"
              />
              <p className="text-stone-500">요청이 없습니다.</p>
              <p className="text-sm text-stone-400">필터를 변경해보세요.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRequests.map((request) => (
                <div key={request.id}>
                  <PrincipalRequestCard
                    request={request}
                    requestType={selectedTab}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    isExpanded={expandedCardId === request.id}
                    isProcessing={isProcessing}
                    onClick={() => handleCardClick(request.id)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* 거절 모달 */}
      <PrincipalRejectionFormModal
        isOpen={showRejectionModal}
        onClose={handleCloseRejectionModal}
        onSubmit={handleRejectionSubmit}
        requestType={selectedTab}
        isLoading={isProcessing}
      />
    </div>
  );
}