'use client';

import { useAuth } from '@/contexts/AuthContext';
import { InputField } from '@/components/auth/InputField';
import { Button } from '@/components/auth/Button';
import { toast } from 'sonner';

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

export function AccountInfoStep() {
  const { signup, setAccountInfo, setSignupStep } = useAuth();

  const handleNext = () => {
    if (!signup.accountInfo.userId || !signup.accountInfo.password || !signup.accountInfo.confirmPassword) {
      toast.error('모든 필드를 입력해주세요');
      return;
    }

    if (signup.accountInfo.password !== signup.accountInfo.confirmPassword) {
      toast.error('비밀번호가 일치하지 않습니다');
      return;
    }

    if (signup.accountInfo.password.length < 8) {
      toast.error('비밀번호는 8자 이상이어야 합니다');
      return;
    }

    setSignupStep('terms');
  };

  const handleBack = () => {
    setSignupStep('personal-info');
  };

  return (
    <>
      <ProgressBarItem current={3} total={4} />
      <h1 className="self-start mt-6 text-xl font-medium leading-tight text-stone-700">
        계정 정보를 입력해주세요
      </h1>
      
      <div className="flex flex-col mt-5 w-full gap-4">
        <InputField
          label="아이디"
          value={signup.accountInfo.userId}
          onChange={(e) => setAccountInfo({ ...signup.accountInfo, userId: e.target.value })}
          placeholder="아이디를 입력하세요"
        />
        
        <InputField
          label="비밀번호"
          type="password"
          value={signup.accountInfo.password}
          onChange={(e) => setAccountInfo({ ...signup.accountInfo, password: e.target.value })}
          placeholder="비밀번호를 입력하세요"
        />
        
        <InputField
          label="비밀번호 확인"
          type="password"
          value={signup.accountInfo.confirmPassword}
          onChange={(e) => setAccountInfo({ ...signup.accountInfo, confirmPassword: e.target.value })}
          placeholder="비밀번호를 다시 입력하세요"
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