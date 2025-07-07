'use client';

import { useSession } from 'next-auth/react';
import { TeacherProfile } from '@/components/teacher/TeacherProfile';

export function TeacherProfilePage() {
  const { data: session } = useSession();

  return (
    <div className="flex overflow-hidden flex-col pb-2 mx-auto w-full bg-white">
      {/* 헤더 */}
      <div className="flex flex-col px-5 py-6">
        <h1 className="text-2xl font-bold text-stone-700">
          나의 정보
        </h1>
        <p className="mt-2 text-stone-500">
          개인정보와 계정 설정을 관리하세요.
        </p>
      </div>

      {/* 프로필 컨텐츠 */}
      <div className="flex flex-col px-5 space-y-4">
        <TeacherProfile teacherId={parseInt(session?.user?.id || '0')} />
      </div>
    </div>
  );
} 