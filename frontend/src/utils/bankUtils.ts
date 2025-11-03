import { BANKS } from "@/constants/banks";

/**
 * 은행명이 BANKS 리스트에 존재하는지 확인
 */
export function isBankInList(bankName: string): boolean {
  return BANKS.some((bank) => bank.value === bankName);
}

/**
 * DB에서 불러온 은행 정보를 폼 상태로 변환
 * - 은행명이 리스트에 있으면 그대로 사용
 * - 없으면 '기타'로 분류하고, customBankName에 저장
 */
export function processBankInfo(bankName: string | null | undefined): {
  selectedBank: string;
  customBankName: string;
} {
  if (!bankName) {
    return {
      selectedBank: "",
      customBankName: "",
    };
  }

  // BANKS 리스트에 있는 은행인지 확인 (대소문자 구분 없이)
  if (isBankInList(bankName)) {
    return {
      selectedBank: bankName,
      customBankName: "",
    };
  }

  // 리스트에 없으면 '기타'로 분류
  return {
    selectedBank: "기타",
    customBankName: bankName,
  };
}

/**
 * 폼 데이터에서 실제 저장할 은행명 추출
 * - '기타'가 선택되었으면 customBankName 사용
 * - 아니면 selectedBank 사용
 */
export function getBankNameToSave(
  selectedBank: string,
  customBankName: string
): string {
  return selectedBank === "기타" ? customBankName : selectedBank;
}
