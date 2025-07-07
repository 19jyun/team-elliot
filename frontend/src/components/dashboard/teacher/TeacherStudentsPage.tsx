'use client';

import { useSession } from 'next-auth/react';

export function TeacherStudentsPage() {
  const { data: session } = useSession();

  return (
    <div className="flex overflow-hidden flex-col pb-2 mx-auto w-full bg-white">
      {/* 헤더 */}
      <div className="flex flex-col px-5 py-6">
        <h1 className="text-2xl font-bold text-stone-700">
          수강생 관리
        </h1>
        <p className="mt-2 text-stone-500">
          수강생 정보와 출석을 관리하세요.
        </p>
      </div>

      {/* 수강생 관리 컨텐츠 */}
      <div className="flex flex-col px-5 space-y-4">
        <div className="bg-white rounded-lg shadow-md border border-stone-100">
          <div className="px-4 py-3 bg-stone-700">
            <h2 className="text-lg font-semibold text-white">수강생 목록</h2>
          </div>
          <div className="p-4">
            <p className="text-stone-500 text-center py-4">
              수강생 관리 기능이 곧 추가될 예정입니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 