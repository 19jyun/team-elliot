'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { usePrincipalData } from '@/hooks/redux/usePrincipalData';
import { usePrincipalApi } from '@/hooks/principal/usePrincipalApi';
import { useAppDispatch } from '@/store/hooks';
import { updatePrincipalEnrollment, updatePrincipalRefundRequest } from '@/store/slices/principalSlice';
import { extractErrorMessage } from '@/types/api/error';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { PrincipalRequestCard } from '../components/requests/PrincipalRequestCard';
import { PrincipalRejectionFormModal } from '../components/modals/PrincipalRejectionFormModal';
import { toUnifiedRequestVM } from '@/lib/adapters/principal';
import type { PrincipalEnrollment } from '@/types/api/principal';
import type { RefundRequestResponse } from '@/types/api/refund';
import Image from 'next/image';

export function EnrollmentRefundManagementContainer() {
  const { form, switchPrincipalPersonManagementTab } = useApp();
  const { principalPersonManagement } = form;
  const { selectedTab } = principalPersonManagement;
  
  // Redux에서 데이터 가져오기 (백엔드에서 이미 필터링됨)
  const { 
    enrollments, 
    refundRequests, 
    isLoading, 
    error 
  } = usePrincipalData();
  
  // API 훅
  const { approveEnrollment, rejectEnrollment, approveRefund, rejectRefund } = usePrincipalApi();
  
  // Redux dispatch
  const dispatch = useAppDispatch();
  
  // 로컬 상태 관리
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [expandedCardId, setExpandedCardId] = useState<number | null>(null);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<{ id: number } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // 탭 전환 핸들러
  const handleTabChange = (tab: 'enrollment' | 'refund') => {
    // AppContext의 탭 상태 업데이트
    switchPrincipalPersonManagementTab(tab);
    // 필터 초기화
    setSelectedStatusFilter('ALL');
    setExpandedCardId(null);
  };

  // 통합된 요청 데이터 생성 (백엔드에서 이미 필터링됨)
  const unifiedRequests = useMemo(() => {
    const requests = selectedTab === 'enrollment' 
      ? (enrollments as unknown as PrincipalEnrollment[]) || []
      : (refundRequests as unknown as RefundRequestResponse[]) || [];
    
    return requests.map(request => 
      toUnifiedRequestVM(request, selectedTab)
    );
  }, [selectedTab, enrollments, refundRequests]);

  // 필터링된 요청 목록 (프론트엔드에서 상태 필터링)
  const filteredRequests = useMemo(() => {
    if (selectedStatusFilter === 'ALL') return unifiedRequests;
    return unifiedRequests.filter(request => request.status === selectedStatusFilter);
  }, [unifiedRequests, selectedStatusFilter]);

  // 상태별 필터 옵션 (탭에 따라 동적 변경)
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

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-700" />
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-full">
        <p className="text-stone-500">데이터를 불러오는 중 오류가 발생했습니다.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white max-w-[480px] mx-auto min-h-0">
      {/* 헤더 */}
      <header className="flex-shrink-0 bg-white border-b border-gray-200 py-5 px-5">
        <div>
          <h1 className="text-2xl font-bold text-stone-700">수강신청/환불신청 관리</h1>
        </div>
        
        {/* 탭 버튼들 (첫 번째 줄) */}
        <div className="flex gap-2 mt-4">
          <Button
            variant={selectedTab === 'enrollment' ? 'default' : 'outline'}
            size="sm"
            className="text-xs px-3 py-2 h-8"
            onClick={() => handleTabChange('enrollment')}
          >
            수강 신청 관리
          </Button>
          <Button
            variant={selectedTab === 'refund' ? 'default' : 'outline'}
            size="sm"
            className="text-xs px-3 py-2 h-8"
            onClick={() => handleTabChange('refund')}
          >
            환불 신청 관리
          </Button>
        </div>
        
        {/* 상태 필터 버튼들 (두 번째 줄) */}
        <div className="flex gap-2 flex-wrap mt-3">
          {statusFilterOptions.map((option) => (
            <Button
              key={option.value}
              variant={selectedStatusFilter === option.value ? 'default' : 'outline'}
              size="sm"
              className="text-xs px-2 py-1 h-7"
              onClick={() => setSelectedStatusFilter(option.value)}
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