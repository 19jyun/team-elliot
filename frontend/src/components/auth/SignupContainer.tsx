'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { RoleSelectionStep } from './steps/RoleSelectionStep';
import { PersonalInfoStep } from './steps/PersonalInfoStep';
import { AccountInfoStep } from './steps/AccountInfoStep';
import { TermsStep } from './steps/TermsStep';
import { StatusBar } from '@/components/ui/StatusBar';

export function SignupContainer() {
  const { signup, setAuthMode } = useAuth();
  const { currentStep } = signup;

  // 현재 단계에 따라 적절한 컴포넌트 렌더링
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'role-selection':
        return <RoleSelectionStep />;
      case 'personal-info':
        return <PersonalInfoStep />;
      case 'account-info':
        return <AccountInfoStep />;
      case 'terms':
        return <TermsStep />;
      default:
        return <RoleSelectionStep />;
    }
  };

  return (
    <div className="flex flex-col w-full">
      {/* StatusBar */}
      <StatusBar 
        time="9:41"
        icons={[
          { src: '/icons/signal.svg', alt: 'Signal', width: 'w-4', aspectRatio: 'square' },
          { src: '/icons/wifi.svg', alt: 'WiFi', width: 'w-4', aspectRatio: 'square' },
          { src: '/icons/battery.svg', alt: 'Battery', width: 'w-6', aspectRatio: 'square' }
        ]}
        logoSrc="/icons/logo.svg"
      />

      {/* 뒤로가기 버튼 */}
      <div className="flex gap-2.5 items-center px-2.5 py-2">
        <div className="flex gap-2.5 items-center self-stretch p-2.5 my-auto w-11">
          <img
            loading="lazy"
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/99d663a7cc4ce56bcb24a91168e88c60bb7df63e17dace2e992d6911ce1c206c?placeholderIfAbsent=true&apiKey=1a4d049d8fe54d8aa58f4ebfa539d65f"
            alt="Back"
            className="object-contain self-stretch my-auto w-6 aspect-square"
          />
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="flex flex-col px-5 w-full">
        {/* 로고 */}
        <img
          loading="lazy"
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/97130cde9aeee244b068f8f7ae85c80577a223db166a059a272277cf5c389cd?placeholderIfAbsent=true&apiKey=1a4d049d8fe54d8aa58f4ebfa539d65f"
          alt="Logo"
          className="object-contain max-w-full aspect-[4.48] w-[220px] mx-auto"
        />

        {renderCurrentStep()}

        {/* 로그인으로 돌아가기 버튼 (첫 단계에서만 표시) */}
        {currentStep === 'role-selection' && (
          <div className="flex justify-center mt-6">
            <button
              onClick={() => setAuthMode('login')}
              className="text-blue-600 hover:text-blue-800"
            >
              로그인하기
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 