'use client';

import { useSession } from '@/lib/auth/AuthProvider';
import { AuthGuard } from '@/components/guards/AuthGuard';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ensureTrailingSlash } from '@/lib/utils/router';

export default function DashboardPage() {
  return (
    <AuthGuard requireAuth={true}>
      <DashboardContent />
    </AuthGuard>
  );
}

function DashboardContent() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session?.user) {
      router.push(ensureTrailingSlash('/'));
      return;
    }

    // 역할에 따라 적절한 경로로 리디렉션
    const role = session.user.role?.toLowerCase();
    if (role) {
      router.replace(ensureTrailingSlash(`/dashboard/${role}`));
    }
  }, [session, status, router]);

  // 리디렉션 중 로딩 표시
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-700" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-700" />
    </div>
  );
}
