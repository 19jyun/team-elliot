'use client';

import { useSession } from 'next-auth/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
import { AddClassModal } from '@/components/admin/AddClassModal';
import { TrashIcon } from '@heroicons/react/24/outline';
import axiosInstance from '@/lib/axios';

export function AdminClassesPage() {
  const { data: session } = useSession();
  const [showAddClass, setShowAddClass] = useState(false);
  const queryClient = useQueryClient();

  const { data: classes } = useQuery({
    queryKey: ['classes'],
    queryFn: () => axiosInstance.get('/admin/classes').then((res) => res.data),
  });

  const { data: teachersData } = useQuery({
    queryKey: ['teachers'],
    queryFn: async () => {
      try {
        const response = await axiosInstance.get('/admin/teachers');
        return response.data;
      } catch (error) {
        console.error('Teachers fetch error:', error);
        return [];
      }
    },
  });

  const deleteClassMutation = useMutation({
    mutationFn: (id: number) => axiosInstance.delete(`/admin/classes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      toast.success('수업이 삭제되었습니다.');
    },
  });

  const addClassMutation = useMutation({
    mutationFn: (data: any) => axiosInstance.post(`/admin/classes`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      toast.success('수업이 추가되었습니다.');
      setShowAddClass(false);
    },
  });

  return (
    <div className="flex overflow-hidden flex-col pb-2 mx-auto w-full bg-white">
      {/* 헤더 */}
      <div className="flex flex-col px-5 py-6">
        <h1 className="text-2xl font-bold text-stone-700">
          수업 관리
        </h1>
        <p className="mt-2 text-stone-500">
          수업 정보를 관리하세요.
        </p>
      </div>

      {/* 수업 관리 컨텐츠 */}
      <div className="flex flex-col px-5 space-y-4">
        <div className="bg-white rounded-lg shadow-md border border-stone-100">
          <div className="px-4 py-3 bg-stone-700 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-white">수업 목록</h2>
            <button
              onClick={() => setShowAddClass(true)}
              className="px-4 py-2 bg-white text-stone-700 rounded-lg hover:bg-gray-100 transition-colors"
            >
              수업 추가
            </button>
          </div>
          <div className="p-4">
            <div className="space-y-4">
              {classes?.map((class_: any) => (
                <div
                  key={class_.id}
                  className="bg-stone-50 p-3 rounded-lg flex justify-between items-center"
                >
                  <div>
                    <p className="font-semibold text-stone-900">{class_.className}</p>
                    <p className="text-sm text-stone-600">
                      {class_.teacher?.name} • {class_.dayOfWeek}요일
                    </p>
                  </div>
                  <button
                    onClick={() => deleteClassMutation.mutate(class_.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 수업 추가 모달 */}
      {showAddClass && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <AddClassModal
            isOpen={showAddClass}
            onSubmit={addClassMutation.mutate}
            onClose={() => setShowAddClass(false)}
            teachers={teachersData || []}
          />
        </div>
      )}
    </div>
  );
} 