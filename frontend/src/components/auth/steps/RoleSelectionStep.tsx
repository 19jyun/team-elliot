'use client';

import { useAuth } from '@/contexts/AuthContext';
const ProgressBarItem = ({ current, total }: { current: number; total: number }) => (
  <div className="flex gap-2">
    {Array.from({ length: total }, (_, i) => (
      <div
        key={i}
        className={`w-2 h-2 rounded-full ${
          i < current ? 'bg-blue-500' : 'bg-gray-300'
        }`}
      />
    ))}
  </div>
);

export function RoleSelectionStep() {
  const { signup, setRole, setSignupStep } = useAuth();

  const handleRoleSelect = (role: 'STUDENT' | 'TEACHER') => {
    setRole(role);
    setSignupStep('personal-info');
  };

  return (
    <>
      <ProgressBarItem current={1} total={4} />
      <h1 className="self-start mt-6 text-xl font-medium leading-tight text-stone-700">
        회원 유형을 선택해주세요
      </h1>
      
      <div className="flex gap-4 mt-6">
        <button 
          onClick={() => handleRoleSelect('STUDENT')}
          className={`flex-1 p-4 border rounded-lg transition-colors ${
            signup.role === 'STUDENT' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <h3 className="font-semibold text-lg mb-2">학생</h3>
          <p className="text-sm text-gray-600">수강생으로 가입</p>
        </button>
        
        <button 
          onClick={() => handleRoleSelect('TEACHER')}
          className={`flex-1 p-4 border rounded-lg transition-colors ${
            signup.role === 'TEACHER' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <h3 className="font-semibold text-lg mb-2">선생님</h3>
          <p className="text-sm text-gray-600">강사로 가입</p>
        </button>
      </div>
    </>
  );
} 