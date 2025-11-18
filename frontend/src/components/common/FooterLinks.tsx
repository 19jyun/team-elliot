'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth/AuthProvider';
import { TermsModal } from './TermsModal';
import { PrivacyPolicyModal } from './PrivacyPolicyModal';
import { ensureTrailingSlash } from '@/lib/utils/router';

export default function FooterLinks() {
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();

  const handleWithdrawalClick = () => {
    if (!session?.user?.role) {
      return;
    }

    const role = session.user.role.toLowerCase();
    const withdrawalPath = ensureTrailingSlash(`/dashboard/${role}/profile/withdrawal`);
    router.push(withdrawalPath);
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