'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/auth/Button';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

// 로컬 컴포넌트 정의
const ProgressBarItem = ({ current, total }: { current: number; total: number }) => (
  <div className="flex gap-2 mb-6">
    {Array.from({ length: total }, (_, i) => (
      <div
        key={i}
        className={`h-1 flex-1 rounded ${
          i < current ? 'bg-blue-600' : 'bg-gray-300'
        }`}
      />
    ))}
  </div>
);

const CheckboxItem = ({ text, required }: { text: string; required?: boolean }) => (
  <div className="flex gap-2 items-center py-3">
    <div className="w-5 h-5 border border-gray-300 rounded flex items-center justify-center">
      <div className="w-3 h-3 bg-blue-600 rounded hidden"></div>
    </div>
    <span className="text-sm">
      {text}
      {required && <span className="text-red-500 ml-1">*</span>}
    </span>
  </div>
);

export function TermsStep() {
  const { signup, setSignupStep } = useAuth();
  const router = useRouter();

  const handleSubmit = async () => {
    if (!signup.terms.age || !signup.terms.terms1 || !signup.terms.terms2) {
      toast.error('필수 약관에 동의해주세요');
      return;
    }

    try {
      // 회원가입 API 호출
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: signup.personalInfo.name,
          userId: signup.accountInfo.userId,
          password: signup.accountInfo.password,
          phoneNumber: signup.personalInfo.phoneNumber,
          role: signup.role,
          marketing: signup.terms.marketing,
        }),
      });

      if (response.ok) {
        toast.success('회원가입이 완료되었습니다');
        
        // 선생님인 경우 학원 설정 페이지로, 학생인 경우 대시보드로
        if (signup.role === 'TEACHER') {
          router.push('/teacher/academy-setup');
        } else {
          router.push('/dashboard');
        }
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || '회원가입에 실패했습니다');
      }
    } catch {
      toast.error('회원가입 중 오류가 발생했습니다');
    }
  };

  const handleBack = () => {
    setSignupStep('account-info');
  };



  return (
    <>
      <ProgressBarItem current={4} total={4} />
      <h1 className="self-start mt-6 text-xl font-medium leading-tight text-stone-700">
        약관에 동의해주세요
      </h1>
      
      <form className="flex flex-col mt-5 w-full">
        <div className="flex gap-2 items-center py-4 w-full text-base font-medium tracking-normal leading-snug border-b border-solid border-b-stone-400 text-stone-700">
          <div className="flex gap-2 items-center self-stretch px-1 my-auto">
            <img
              loading="lazy"
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/bec1032544384dfb8d2e50d5c619a90dc6aff4131ada8b881183578489e5c959?placeholderIfAbsent=true&apiKey=1a4d049d8fe54d8aa58f4ebfa539d65f"
              alt=""
              className="object-contain shrink-0 self-stretch my-auto w-6 aspect-square"
            />
            <div className="self-stretch my-auto">모두 동의합니다</div>
          </div>
        </div>

        <div className="flex flex-col mt-4 w-full text-base tracking-normal">
          <CheckboxItem
            text="만 14세 이상입니다"
            required
          />
          <CheckboxItem
            text="이용약관에 동의합니다"
            required
          />
          <CheckboxItem
            text="개인정보 처리방침에 동의합니다"
            required
          />
          <CheckboxItem
            text="마케팅 정보 수신에 동의합니다"
          />
        </div>
      </form>
      
      <div className="flex gap-3 mt-6">
        <Button onClick={handleBack} variant="outline" className="flex-1">
          이전
        </Button>
        <Button onClick={handleSubmit} className="flex-1">
          회원가입 완료
        </Button>
      </div>
    </>
  );
} 