'use client';

import { AuthHeader } from '@/components/layout/AuthHeader';

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AuthHeader />
      {children}
    </>
  );
}

