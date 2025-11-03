// 은행 목록 상수

export interface BankOption {
  value: string; // 실제 은행명 (한글) - DB에 저장되는 값
  label: string; // 표시명 (한글) - UI에 표시되는 값
}

export const BANKS: BankOption[] = [
  { value: "신한은행", label: "신한은행" },
  { value: "KB국민은행", label: "KB국민은행" },
  { value: "우리은행", label: "우리은행" },
  { value: "하나은행", label: "하나은행" },
  { value: "NH농협은행", label: "NH농협은행" },
  { value: "IBK기업은행", label: "IBK기업은행" },
  { value: "카카오뱅크", label: "카카오뱅크" },
  { value: "토스뱅크", label: "토스뱅크" },
  { value: "케이뱅크", label: "케이뱅크" },
  { value: "기타", label: "기타" },
];
