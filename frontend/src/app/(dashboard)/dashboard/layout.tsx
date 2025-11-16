'use client';

import { CommonHeader } from '@/components/layout/CommonHeader';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col h-screen bg-gray-50 pb-safe">
      <CommonHeader />
      <main className="flex-1 overflow-hidden relative">
        {children}
      </main>
    </div>
  );
}

