'use client';

import React, { useState } from 'react';
import { TermsModal } from './TermsModal';
import { PrivacyPolicyModal } from './PrivacyPolicyModal';

export default function FooterLinks() {
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  const handleWithdrawalClick = () => {
    // 회원탈퇴는 모달이나 별도 페이지로 처리 (현재는 WithdrawalPage 컴포넌트가 있음)
    // 필요시 router.push('/dashboard/withdrawal') 또는 모달로 처리
    alert('회원탈퇴 기능은 준비 중입니다.');
  };

  return (
    <>
      <footer className="flex flex-col px-5 pt-3.5 pb-12 w-full text-sm font-medium bg-neutral-100 min-h-[80px] text-neutral-400">
        <nav className="flex gap-6 justify-center items-center w-full">
          <button 
            onClick={() => setIsTermsOpen(true)}
            className="hover:text-neutral-600 cursor-pointer"
          >
            이용약관
          </button>
          <button 
            onClick={() => setIsPrivacyOpen(true)}
            className="hover:text-neutral-600 cursor-pointer"
          >
            개인정보처리방침
          </button>
          <button 
            onClick={handleWithdrawalClick}
            className="hover:text-neutral-600 cursor-pointer"
          >
            회원탈퇴
          </button>
        </nav>
      </footer>

      <TermsModal 
        isOpen={isTermsOpen} 
        onClose={() => setIsTermsOpen(false)} 
      />
      
      <PrivacyPolicyModal 
        isOpen={isPrivacyOpen} 
        onClose={() => setIsPrivacyOpen(false)} 
      />
    </>
  );
} 