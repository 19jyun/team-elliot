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
import { InputField } from '@/components/auth/InputField';
import { Button } from '@/components/auth/Button';
import { toast } from 'sonner';

export function PersonalInfoStep() {
  const { signup, setPersonalInfo, setSignupStep } = useAuth();

  const handleNext = () => {
    if (!signup.personalInfo.name || !signup.personalInfo.phoneNumber) {
      toast.error('이름과 전화번호를 입력해주세요');
      return;
    }
    setSignupStep('account-info');
  };

  const handleBack = () => {
    setSignupStep('role-selection');
  };

  return (
    <>
      <ProgressBarItem current={2} total={4} />
      <h1 className="self-start mt-6 text-xl font-medium leading-tight text-stone-700">
        기본 정보를 입력해주세요
      </h1>
      
      <div className="flex flex-col mt-5 w-full gap-4">
        <InputField
          label="이름"
          value={signup.personalInfo.name}
          onChange={(e) => setPersonalInfo({ ...signup.personalInfo, name: e.target.value })}
          placeholder="이름을 입력하세요"
        />
        
        <InputField
          label="전화번호"
          value={signup.personalInfo.phoneNumber}
          onChange={(e) => setPersonalInfo({ ...signup.personalInfo, phoneNumber: e.target.value })}
          placeholder="전화번호를 입력하세요"
        />
      </div>
      
      <div className="flex gap-3 mt-6">
        <Button onClick={handleBack} variant="outline" className="flex-1">
          이전
        </Button>
        <Button onClick={handleNext} className="flex-1">
          다음
        </Button>
      </div>
    </>
  );
} 