'use client';

import { PrincipalCreateClassFormProvider } from '@/contexts/forms/PrincipalCreateClassFormContext';

export default function CreateClassLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PrincipalCreateClassFormProvider>
      {children}
    </PrincipalCreateClassFormProvider>
  );
}

