'use client'
import React, { useEffect, useState } from 'react';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { StatusStep } from '../../StatusStep';


// 타입 정의
interface ClassFee {
  name: string;
  count: number;
  price: number;
}

interface TeacherPaymentInfo {
  teacherId: number;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  classFees: ClassFee[];
  totalAmount: number;
}

// Toast 컴포넌트
function Toast({ show, message }: { show: boolean; message: string }) {
  if (!show) return null;
  return (
    <div className="fixed left-1/2 bottom-24 transform -translate-x-1/2 bg-black text-white px-4 py-2 rounded shadow z-50">
      {message}
    </div>
  );
}

// BankInfo 컴포넌트
function BankInfo({ bankName, accountNumber, accountHolder, onCopy }: { bankName: string; accountNumber: string; accountHolder: string; onCopy: () => void }) {
  return (
    <div className="mb-2">
      <div className="flex items-center gap-2">
        <span className="font-semibold">은행명</span>
        <span>{bankName}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="font-semibold">계좌번호</span>
        <span className="tracking-wider font-mono">{accountNumber}</span>
        <button className="ml-2 px-2 py-1 border rounded text-xs" onClick={onCopy}>복사</button>
      </div>
      <div className="flex items-center gap-2">
        <span className="font-semibold">계좌주</span>
        <span>{accountHolder}</span>
      </div>
    </div>
  );
}

// ClassFeeList 컴포넌트
function ClassFeeList({ classFees }: { classFees: ClassFee[] }) {
  return (
    <div className="my-2 text-sm w-full">
      {classFees.map((fee) => (
        <div key={fee.name} className="flex justify-between">
          <span>{fee.name} {fee.count}회</span>
          <span>{fee.price.toLocaleString()}원</span>
        </div>
      ))}
    </div>
  );
}

// TotalAmount 컴포넌트
function TotalAmount({ amount }: { amount: number }) {
  return (
    <div className="mt-2 font-bold flex justify-between w-full">
      <span>총 결제금액</span>
      <span>{amount.toLocaleString()}원</span>
    </div>
  );
}

// TeacherPaymentBox 컴포넌트
function TeacherPaymentBox({ teacher, onCopy }: { teacher: TeacherPaymentInfo; onCopy: () => void }) {
  return (
    <div
      className="border rounded-xl p-4 bg-white shadow flex flex-col items-start min-w-[335px] max-w-[335px] flex-shrink-0"
      style={{ height: 292 }}
    >
      <BankInfo bankName={teacher.bankName} accountNumber={teacher.accountNumber} accountHolder={teacher.accountHolder} onCopy={onCopy} />
      <ClassFeeList classFees={teacher.classFees} />
      <TotalAmount amount={teacher.totalAmount} />
    </div>
  );
}

// PaymentConfirmFooter 컴포넌트
function PaymentConfirmFooter({ confirmed, setConfirmed, onComplete }: { confirmed: boolean; setConfirmed: (v: boolean) => void; onComplete: () => void }) {
  return (
    <footer className="sticky bottom-0 left-0 w-full bg-white border-t border-gray-200 z-50 mt-auto">
      <div className="flex flex-col items-center px-5 pt-2 pb-4">
        <label className="flex items-center gap-2 text-sm mb-2">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={e => setConfirmed(e.target.checked)}
            style={{ accentColor: confirmed ? '#AC9592' : '#8C8C8C' }}
          />
          입금 완료했습니다
        </label>
        <button
          className={`flex-1 shrink self-stretch px-2.5 py-4 rounded-lg min-w-[240px] size-full transition-colors duration-300 text-center font-semibold ${confirmed ? 'bg-[#AC9592] text-white cursor-pointer' : 'bg-zinc-300 text-white cursor-not-allowed'}`}
          disabled={!confirmed}
          onClick={onComplete}
        >
          결제 완료
        </button>
      </div>
    </footer>
  );
}

// 결제 페이지 (여러 명의 선생님 지원)
export default function PaymentPage() {
  const [selectedClasses, setSelectedClasses] = useState<TeacherPaymentInfo[]>([]);
  const [showToast, setShowToast] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const router = useRouter();
  const statusSteps = [
    {
      icon: '/icons/CourseRegistrationsStatusSteps1.svg',
      label: '클래스 선택',
      isActive: false,
      isCompleted: true, // 완료된 단계
    },
    {
      icon: '/icons/CourseRegistrationsStatusSteps2.svg',
      label: '일자 선택',
      isActive: false,
      isCompleted: true,
    },
    {
      icon: '/icons/CourseRegistrationsStatusSteps2.svg',
      label: '결제하기',
      isActive: true,
      isCompleted: false,
    },
  ]

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const data = localStorage.getItem('selectedClasses');
      console.log('selectedClasses in localStorage:', data);
      if (data) {
        setSelectedClasses(JSON.parse(data));
      }
    }
  }, []);

  // 복사 버튼 클릭 시 toast
  const handleCopy = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 1500);
  };

  // 결제 완료 버튼 클릭 시 (추후 실제 결제 로직 연결)
  const handleComplete = () => {
    alert('결제가 완료되었습니다!');
  };

  return (
    <div className="flex flex-col min-h-screen bg-white font-[Pretendard Variable]">
      <header className="sticky top-0 z-40 flex flex-col bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-4 h-14">
          <button 
            onClick={() => router.back()}
            className="p-2 text-gray-600 hover:text-gray-900"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <h1 className="absolute left-1/2 transform -translate-x-1/2 text-lg font-semibold text-gray-900">
            수강신청
          </h1>
          <div className="w-10" />
        </div>

        <div className="flex gap-10 self-center w-full text-sm font-medium tracking-normal leading-snug max-w-[297px] mt-2 mb-2">
          {statusSteps.map((step, index) => (
            <StatusStep key={index} {...step} />
          ))}
        </div>

        <div className="self-center pb-4 text-base font-medium tracking-normal leading-snug text-center" style={{ color: '#595959' }}>
          신청 완료 전, 수강료 송금을 마무리 해주세요!<br />
          입금이 확인되지 않으면 신청이 취소될 수 있습니다.
        </div>
      </header>

      {/* 가로 스크롤 컨테이너 */}
      <div className="flex flex-row gap-4 overflow-x-auto pb-4 w-full">
        {selectedClasses.map((teacher, idx) => (
          <TeacherPaymentBox key={idx} teacher={teacher} onCopy={handleCopy} />
        ))}
      </div>
      <Toast show={showToast} message="계좌번호가 복사되었습니다!" />
      <PaymentConfirmFooter confirmed={confirmed} setConfirmed={setConfirmed} onComplete={handleComplete} />
    </div>
  );
}
