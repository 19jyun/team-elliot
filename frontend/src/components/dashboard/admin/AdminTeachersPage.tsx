'use client';

import { useSession } from 'next-auth/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
import { AddTeacherModal } from '@/components/admin/AddTeacherModal';
import { TrashIcon } from '@heroicons/react/24/outline';
import axiosInstance from '@/lib/axios';

export function AdminTeachersPage() {
  const { data: session } = useSession();
  const [showAddTeacher, setShowAddTeacher] = useState(false);
  const queryClient = useQueryClient();

  const { data: teachersData, error: teachersError } = useQuery({
    queryKey: ['teachers'],
    queryFn: async () => {
      try {
        const response = await axiosInstance.get('/admin/teachers');
        return response.data;
      } catch (error) {
        console.error('Teachers fetch error:', error);
        throw error;
      }
    },
  });

  const deleteTeacherMutation = useMutation({
    mutationFn: (id: number) => axiosInstance.delete(`/admin/teachers/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      toast.success('선생님이 삭제되었습니다.');
    },
  });

  const addTeacherMutation = useMutation({
    mutationFn: (data: any) => axiosInstance.post(`/admin/teachers`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      toast.success('선생님이 추가되었습니다.');
      setShowAddTeacher(false);
    },
  });

  return (
    <div className="flex overflow-hidden flex-col pb-2 mx-auto w-full bg-white">
      {/* 헤더 */}
      <div className="flex flex-col px-5 py-6">
        <h1 className="text-2xl font-bold text-stone-700">
          선생님 관리
        </h1>
        <p className="mt-2 text-stone-500">
          선생님 정보를 관리하세요.
        </p>
      </div>

      {/* 선생님 관리 컨텐츠 */}
      <div className="flex flex-col px-5 space-y-4">
        <div className="bg-white rounded-lg shadow-md border border-stone-100">
          <div className="px-4 py-3 bg-stone-700 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-white">선생님 목록</h2>
            <button
              onClick={() => setShowAddTeacher(true)}
              className="px-4 py-2 bg-white text-stone-700 rounded-lg hover:bg-gray-100 transition-colors"
            >
              선생님 추가
            </button>
          </div>
          <div className="p-4">
            <div className="space-y-4">
              {teachersData?.map((teacher: any) => (
                <div
                  key={teacher.id}
                  className="bg-stone-50 p-3 rounded-lg flex justify-between items-center"
                >
                  <div>
                    <p className="font-semibold text-stone-900">{teacher.name}</p>
                    <p className="text-sm text-stone-600">{teacher.userId}</p>
                  </div>
                  <button
                    onClick={() => deleteTeacherMutation.mutate(teacher.id)}
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

      {/* 선생님 추가 모달 */}
      {showAddTeacher && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <AddTeacherModal
            isOpen={showAddTeacher}
            onSubmit={addTeacherMutation.mutate}
            onClose={() => setShowAddTeacher(false)}
          />
        </div>
      )}
    </div>
  );
} 