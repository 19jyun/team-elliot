import React from 'react';

export default function FooterLinks() {
  return (
    <footer className="flex flex-col px-5 pt-3.5 pb-12 w-full text-sm font-medium bg-neutral-100 min-h-[80px] text-neutral-400">
      <nav className="flex gap-6 justify-center items-center w-full">
        <a href="/terms" className="hover:text-neutral-600">
          이용약관
        </a>
        <a href="/privacy" className="hover:text-neutral-600">
          개인정보처리방침
        </a>
        <a href="/withdrawal" className="hover:text-neutral-600">
          회원탈퇴
        </a>
      </nav>
    </footer>
  );
} 