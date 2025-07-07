'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export function StudentEnrollPage() {
  const { data: session } = useSession();
  const router = useRouter();

  return (
    <div className="flex overflow-hidden flex-col pb-2 mx-auto w-full bg-white">
      {/* 헤더 */}
      <div className="flex flex-col px-5 py-6">
        <h1 className="text-2xl font-bold text-stone-700">
          수강신청
        </h1>
        <p className="mt-2 text-stone-500">
          원하는 수업을 선택하고 신청하세요.
        </p>
      </div>

      {/* 수강신청 컨텐츠 */}
      <div className="flex flex-col px-5 space-y-4">
        <div className="bg-white rounded-lg shadow-md border border-stone-100">
          <div className="px-4 py-3 bg-stone-700">
            <h2 className="text-lg font-semibold text-white">수강신청 안내</h2>
          </div>
          <div className="p-4">
            <p className="text-stone-500 text-center py-4">
              수강신청 기능이 곧 추가될 예정입니다.
            </p>
            <button
              onClick={() => router.push('/dashboard/student/enroll')}
              className="w-full py-3 bg-stone-700 text-white rounded-lg hover:bg-stone-600 transition-colors"
            >
              수강신청 페이지로 이동
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 