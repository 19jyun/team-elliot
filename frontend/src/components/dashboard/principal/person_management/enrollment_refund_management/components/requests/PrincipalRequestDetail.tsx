'use client';

import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { usePrincipalData } from '@/hooks/redux/usePrincipalData';
import { usePrincipalApi } from '@/hooks/principal/usePrincipalApi';
import { PrincipalRequestCard } from './PrincipalRequestCard';
import { PrincipalRejectionFormModal } from '../modals/PrincipalRejectionFormModal';
import { toast } from 'sonner';
import { useAppDispatch } from '@/store/hooks';
import { updatePrincipalEnrollment, updatePrincipalRefundRequest } from '@/store/slices/principalSlice';
import { extractErrorMessage } from '@/types/api/error';
import { toPrincipalRequestDetailVM } from '@/lib/adapters/principal';
import type { PrincipalEnrollment } from '@/types/api/principal';
import type { PrincipalRequestDetailVM } from '@/types/view/principal';

export function PrincipalRequestDetail() {
  const { form } = useApp();
  const { principalPersonManagement } = form;
  const { selectedTab, selectedSessionId } = principalPersonManagement;
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<{ id: number } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const dispatch = useAppDispatch();
  
  // usePrincipalApi 훅 사용
  const { 
    approveEnrollment, 
    rejectEnrollment, 
    approveRefund, 
    rejectRefund
  } = usePrincipalApi();

  // Redux store에서 데이터 가져오기
  const { 
    getSessionEnrollments, 
    getSessionRefundRequests, 
    isLoading,
    error 
  } = usePrincipalData();

  // 선택된 세션의 요청 목록
  const requests = selectedSessionId 
    ? selectedTab === 'enrollment'
      ? (getSessionEnrollments(selectedSessionId) as unknown as PrincipalEnrollment[])
      : getSessionRefundRequests(selectedSessionId)
    : [];


  // ViewModel 생성
  const requestDetailVM: PrincipalRequestDetailVM = toPrincipalRequestDetailVM({
    requests,
    selectedTab,
    selectedSessionId,
    isLoading,
    error,
    isProcessing,
    showRejectionModal,
    selectedRequest,
  });

  // 승인 처리 함수
  const handleApprove = async (requestId: number) => {
    setIsProcessing(true);
    try {
      let data;
      if (selectedTab === 'enrollment') {
        data = await approveEnrollment(requestId);
      } else {
        data = await approveRefund(requestId);
      }
      
      toast.success('승인 처리가 완료되었습니다.');
      // Redux 상태 즉시 업데이트
      if (selectedTab === 'enrollment') {
        dispatch(updatePrincipalEnrollment(data));
      } else {
        dispatch(updatePrincipalRefundRequest(data));
      }
    } catch (error: unknown) {
      toast.error(extractErrorMessage(error, '승인 처리 중 오류가 발생했습니다.'));
      console.error('Approval error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // 거절 처리 함수
  const handleReject = (requestId: number) => {
    setSelectedRequest({ id: requestId });
    setShowRejectionModal(true);
  };

  const handleRejectionSubmit = async (reason: string, detailedReason?: string) => {
    if (!selectedRequest) return;
    
    setIsProcessing(true);
    try {
      let data;
      if (selectedTab === 'enrollment') {
        data = await rejectEnrollment(selectedRequest.id, reason, detailedReason);
      } else {
        data = await rejectRefund(selectedRequest.id, reason, detailedReason);
      }
      
      toast.success('거절 처리가 완료되었습니다.');
      // Redux 상태 즉시 업데이트
      if (selectedTab === 'enrollment') {
        dispatch(updatePrincipalEnrollment(data));
      } else {
        dispatch(updatePrincipalRefundRequest(data));
      }
      setShowRejectionModal(false);
      setSelectedRequest(null);
    } catch (error: unknown) {
      toast.error(extractErrorMessage(error, '거절 처리 중 오류가 발생했습니다.'));
      console.error('Rejection error:', error);
    } finally {
      setIsProcessing(false);
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
          requestDetailVM.requests.map((request) => (
            <PrincipalRequestCard
              key={request.id}
              request={request}
              requestType={requestDetailVM.selectedTab}
              onApprove={handleApprove}
              onReject={handleReject}
              isProcessing={requestDetailVM.isProcessing}
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