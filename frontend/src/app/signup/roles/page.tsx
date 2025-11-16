'use client';

import { SignupRolePage } from '@/components/auth/pages/SignupRolePage';

export default function SignupRolesPage() {
  return (
    <div className="flex overflow-hidden flex-col mx-auto w-full bg-white max-w-[480px] h-full">
      <main className="flex flex-col px-5 mt-24 w-full flex-1 overflow-hidden">
        <SignupRolePage />
      </main>
    </div>
  );
}

