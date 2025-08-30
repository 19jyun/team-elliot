'use client';

import React, { useState } from 'react';
import { usePrincipalContext } from '@/contexts/PrincipalContext';
import { usePrincipalData } from '@/hooks/redux/usePrincipalData';
import { usePrincipalApi } from '@/hooks/principal/usePrincipalApi';
import { PrincipalRequestCard } from './PrincipalRequestCard';
import { PrincipalRejectionFormModal } from '../modals/PrincipalRejectionFormModal';
import { toast } from 'sonner';
import { useAppDispatch } from '@/store/hooks';
import { updatePrincipalEnrollment, updatePrincipalRefundRequest } from '@/store/slices/principalSlice';

export function PrincipalRequestDetail() {
  const { 
    personManagement
  } = usePrincipalContext();
  const { selectedTab, selectedSessionId } = personManagement;
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
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
      ? getSessionEnrollments(selectedSessionId)
      : getSessionRefundRequests(selectedSessionId)
    : [];

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
    } catch (error: any) {
      toast.error('승인 처리 중 오류가 발생했습니다.');
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
    } catch (error: any) {
      toast.error('거절 처리 중 오류가 발생했습니다.');
      console.error('Rejection error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCloseRejectionModal = () => {
    setShowRejectionModal(false);
    setSelectedRequest(null);
  };



  if (isLoading) {
    return (
      <div className="flex items-center justify-center flex-1">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-700" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center flex-1">
        <p className="text-stone-500">데이터를 불러오는 중 오류가 발생했습니다.</p>
      </div>
    );
  }

  if (!selectedSessionId) {
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
        {requests.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-stone-500">
              {selectedTab === 'enrollment' ? '수강 신청' : '환불 요청'}이 없습니다.
            </p>
          </div>
        ) : (
          requests.map((request: any) => (
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
        isOpen={showRejectionModal}
        onClose={handleCloseRejectionModal}
        onSubmit={handleRejectionSubmit}
        requestType={selectedTab}
        isLoading={isProcessing}
      />
    </div>
  );
} 