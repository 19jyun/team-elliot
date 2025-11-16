'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import { usePrincipalSessionEnrollments } from '@/hooks/queries/principal/usePrincipalSessionEnrollments';
import { usePrincipalRefundRequests } from '@/hooks/queries/principal/usePrincipalRefundRequests';
import { useApproveEnrollment } from '@/hooks/mutations/principal/useApproveEnrollment';
import { useRejectEnrollment } from '@/hooks/mutations/principal/useRejectEnrollment';
import { useApproveRefund } from '@/hooks/mutations/principal/useApproveRefund';
import { useRejectRefund } from '@/hooks/mutations/principal/useRejectRefund';
import { PrincipalRequestCard } from './PrincipalRequestCard';
import { PrincipalRejectionFormModal } from '../modals/PrincipalRejectionFormModal';
import { toPrincipalRequestDetailVM, toUnifiedRequestVM } from '@/lib/adapters/principal';
import type { PrincipalEnrollment } from '@/types/api/principal';
import type { PrincipalRequestDetailVM, UnifiedRequest } from '@/types/view/principal';
import type { RefundRequestResponse, RefundRequestListResponse } from '@/types/api/refund';

export function PrincipalRequestDetail() {
  const { form } = useApp();
  const { principalPersonManagement } = form;
  const { selectedTab, selectedSessionId } = principalPersonManagement;
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<{ id: number } | null>(null);
  
  // React Query 기반 데이터 관리
  const { 
    data: sessionEnrollmentsData, 
    isLoading: enrollmentsLoading 
  } = usePrincipalSessionEnrollments(selectedSessionId || 0);
  
  const { 
    data: refundRequestsData, 
    isLoading: refundRequestsLoading 
  } = usePrincipalRefundRequests();
  
  // Type-safe access to refundRequests
  const refundRequests = (refundRequestsData as RefundRequestListResponse | undefined)?.refundRequests || [];
  
  // Mutations
  const approveEnrollmentMutation = useApproveEnrollment();
  const rejectEnrollmentMutation = useRejectEnrollment();
  const approveRefundMutation = useApproveRefund();
  const rejectRefundMutation = useRejectRefund();
  
  const isLoading = enrollmentsLoading || refundRequestsLoading;
  const isProcessing = 
    approveEnrollmentMutation.isPending || 
    rejectEnrollmentMutation.isPending ||
    approveRefundMutation.isPending ||
    rejectRefundMutation.isPending;

  // 선택된 세션의 요청 목록
  const rawRequests = useMemo(() => {
    if (!selectedSessionId) return [];
    
    if (selectedTab === 'enrollment') {
      // 세션 수강생 목록에서 enrollment 정보 추출
      const enrollments = sessionEnrollmentsData?.enrollments || [];
      return enrollments.map((enrollment: any) => ({
        ...enrollment,
        sessionId: selectedSessionId,
      })) as PrincipalEnrollment[];
    } else {
      // 환불 요청 목록에서 특정 세션의 것만 필터링
      return refundRequests.filter((refund: RefundRequestResponse) => {
        const refundSessionId = refund.sessionEnrollment?.session?.id;
        return refundSessionId === selectedSessionId;
      });
    }
  }, [selectedSessionId, selectedTab, sessionEnrollmentsData, refundRequests]);

  // 통합된 요청 데이터로 변환
  const requests: UnifiedRequest[] = rawRequests.map((request: PrincipalEnrollment | RefundRequestResponse) => 
    toUnifiedRequestVM(request, selectedTab)
  );


  // ViewModel 생성
  const requestDetailVM: PrincipalRequestDetailVM = toPrincipalRequestDetailVM({
    requests: rawRequests,
    selectedTab,
    selectedSessionId: selectedSessionId || 0,
    isLoading,
    error: null, // React Query가 에러를 처리하므로 null로 설정
    isProcessing,
    showRejectionModal,
    selectedRequest,
  });

  // 승인 처리 함수
  const handleApprove = (requestId: number) => {
    if (selectedTab === 'enrollment') {
      approveEnrollmentMutation.mutate(requestId);
    } else {
      approveRefundMutation.mutate(requestId);
    }
  };

  // 거절 처리 함수
  const handleReject = (requestId: number) => {
    setSelectedRequest({ id: requestId });
    setShowRejectionModal(true);
  };

  const handleRejectionSubmit = (reason: string, detailedReason?: string) => {
    if (!selectedRequest) return;
    
    if (selectedTab === 'enrollment') {
      rejectEnrollmentMutation.mutate(
        { enrollmentId: selectedRequest.id, data: { reason, detailedReason } },
        {
          onSuccess: () => {
            setShowRejectionModal(false);
            setSelectedRequest(null);
          },
        }
      );
    } else {
      rejectRefundMutation.mutate(
        { refundId: selectedRequest.id, data: { reason, detailedReason } },
        {
          onSuccess: () => {
            setShowRejectionModal(false);
            setSelectedRequest(null);
          },
        }
      );
    }
  };

  const handleCloseRejectionModal = () => {
    setShowRejectionModal(false);
    setSelectedRequest(null);
  };



  if (requestDetailVM.isLoading) {
    return (
      <div className="flex items-center justify-center flex-1">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-700" />
      </div>
    );
  }

  if (requestDetailVM.error) {
    return (
      <div className="flex items-center justify-center flex-1">
        <p className="text-stone-500">데이터를 불러오는 중 오류가 발생했습니다.</p>
      </div>
    );
  }

  if (!requestDetailVM.selectedSessionId) {
    return (
      <div className="flex items-center justify-center flex-1">
        <p className="text-stone-500">세션을 선택해주세요.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-5 py-4">
      {/* 요청 목록 */}
      <div className="space-y-4">
        {!requestDetailVM.hasRequests ? (
          <div className="text-center py-8">
            <p className="text-stone-500">
              {requestDetailVM.emptyMessage}
            </p>
          </div>
        ) : (
          requests.map((request) => (
            <PrincipalRequestCard
              key={request.id}
              request={request}
              requestType={selectedTab}
              onApprove={handleApprove}
              onReject={handleReject}
              isProcessing={isProcessing}
            />
          ))
        )}
      </div>

      {/* 거절 모달 */}
      <PrincipalRejectionFormModal
        isOpen={requestDetailVM.showRejectionModal}
        onClose={handleCloseRejectionModal}
        onSubmit={handleRejectionSubmit}
        requestType={requestDetailVM.selectedTab}
        isLoading={requestDetailVM.isProcessing}
      />
    </div>
  );
} 