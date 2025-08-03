'use client';

import React from 'react';
import { PrincipalProfileCard } from './PrincipalProfileCard';

export function PrincipalProfileManagement() {
  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* 프로필 카드 */}
      <div className="flex-1 min-h-0 overflow-y-auto p-5">
        <PrincipalProfileCard 
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