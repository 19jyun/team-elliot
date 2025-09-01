'use client';

import { Academy } from '@/types/api/common';

interface AcademyFormProps {
  academy: Academy | null;
}

export function AcademyForm({ academy }: AcademyFormProps) {
  if (!academy) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>학원 정보를 불러올 수 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">학원명</label>
          <div className="p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-900">{academy.name}</span>
          </div>
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">학원 코드</label>
          <div className="p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-900">{academy.code}</span>
          </div>
        </div>

        {academy.address && (
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">주소</label>
            <div className="p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-900">{academy.address}</span>
            </div>
          </div>
        )}

        {academy.phoneNumber && (
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">전화번호</label>
            <div className="p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-900">{academy.phoneNumber}</span>
            </div>
          </div>
        )}

        {academy.description && (
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">설명</label>
            <div className="p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-900">{academy.description}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 