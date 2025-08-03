'use client';

import React from 'react';
import { TeacherProfileCard } from './TeacherProfileCard';

export function TeacherProfileManagement() {
  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* 프로필 카드 */}
      <div className="flex-1 min-h-0 overflow-y-auto p-5">
        <TeacherProfileCard 
          isEditable={true}
          onSave={() => {
          }}
          onCancel={() => {
          }}
        />
      </div>
    </div>
  );
} 