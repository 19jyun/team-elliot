'use client';

import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export function TeacherClassesPage() {
  const { data: session } = useSession();

  const { data: myClasses } = useQuery({
    queryKey: ['teacher-classes'],
    queryFn: async () => {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/teacher/classes`,
      );
      return response.data;
    },
  });

  return (
    <div className="flex overflow-hidden flex-col pb-2 mx-auto w-full bg-white">
      {/* 헤더 */}
      <div className="flex flex-col px-5 py-6">
        <h1 className="text-2xl font-bold text-stone-700">
          {session?.user?.name}님의 선생님 대시보드
        </h1>
        <p className="mt-2 text-stone-500">
          수업과 수강생 정보를 확인할 수 있습니다.
        </p>
      </div>

      {/* 수업 목록 */}
      <div className="px-5 space-y-4">
        <div className="bg-white rounded-lg shadow-md border border-stone-100">
          <div className="px-4 py-3 bg-stone-700">
            <h2 className="text-lg font-semibold text-white">내 수업</h2>
          </div>
          <div className="p-4">
            <div className="space-y-4">
              {myClasses?.map((class_: any) => (
                <div
                  key={class_.id}
                  className="bg-stone-50 p-3 rounded-lg hover:bg-stone-100 transition-colors duration-200"
                >
                  <p className="font-semibold text-stone-900">
                    {class_.className}
                  </p>
                  <p className="text-sm text-stone-600">
                    {class_.dayOfWeek}요일 {class_.time}
                  </p>
                  <p className="text-sm text-stone-500">
                    수강생: {class_.currentStudents}/{class_.maxStudents}명
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 