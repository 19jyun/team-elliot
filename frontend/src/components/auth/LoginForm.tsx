'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { InputField } from '@/components/auth/InputField';
import { Button } from '@/components/auth/Button';
import Image from 'next/image';


export function LoginForm() {
  const { login, setLoginInfo, setAuthMode } = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!login.userId || !login.password) {
      toast.error('아이디와 비밀번호를 입력해주세요');
      return;
    }

    try {
      // 로그인 API 호출
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(login),
      });

      if (response.ok) {
        // 로그인 성공 처리
        toast.success('로그인되었습니다');
        router.push('/dashboard');
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || '로그인에 실패했습니다');
      }
    } catch {
      toast.error('로그인 중 오류가 발생했습니다');
    }
  };

  return (
    <div className="flex flex-col w-full">
      {/* 뒤로가기 버튼 */}
      <div className="flex gap-2.5 items-center px-2.5 py-2">
        <div className="flex gap-2.5 items-center self-stretch p-2.5 my-auto w-11">
          <Image
            loading="lazy"
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/99d663a7cc4ce56bcb24a91168e88c60bb7df63e17dace2e992d6911ce1c206c?placeholderIfAbsent=true&apiKey=1a4d049d8fe54d8aa58f4ebfa539d65f"
            alt="Back"
            width={24}
            height={24}
            className="object-contain self-stretch my-auto w-6 aspect-square"
          />
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="flex flex-col px-5 w-full">
        {/* 로고 */}
        <Image
          loading="lazy"
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/97130cde9aeee244b068f8f7ae85c80577a223db166a059a272277cf5c389cd?placeholderIfAbsent=true&apiKey=1a4d049d8fe54d8aa58f4ebfa539d65f"
          alt="Logo"
          width={220}
          height={49}
          className="object-contain max-w-full aspect-[4.48] w-[220px] mx-auto"
        />

        <h1 className="self-start mt-6 text-xl font-medium leading-tight text-stone-700">
          로그인
        </h1>

        <form onSubmit={handleLogin} className="flex flex-col mt-5 w-full">
          <InputField
            label="아이디"
            value={login.userId}
            onChange={(value: string) => setLoginInfo({ ...login, userId: value })}
            placeholder="아이디를 입력하세요"
          />
          
          <InputField
            label="비밀번호"
            type="password"
            value={login.password}
            onChange={(value: string) => setLoginInfo({ ...login, password: value })}
            placeholder="비밀번호를 입력하세요"
          />

          <Button type="submit" className="mt-6">
            로그인
          </Button>
        </form>

        <div className="flex justify-center mt-6">
          <button
            onClick={() => setAuthMode('signup')}
            className="text-blue-600 hover:text-blue-800"
          >
            회원가입하기
          </button>
        </div>
      </div>
    </div>
  );
} 