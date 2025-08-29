// 백엔드 RefundRequestDto와 동일한 validation 규칙들
export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// 환불 사유 enum (백엔드와 동일)
export enum RefundReason {
  PERSONAL_SCHEDULE = "PERSONAL_SCHEDULE",
  HEALTH_ISSUE = "HEALTH_ISSUE",
  DISSATISFACTION = "DISSATISFACTION",
  FINANCIAL_ISSUE = "FINANCIAL_ISSUE",
  OTHER = "OTHER",
}

// 환불 사유 validation
export const validateRefundReason = (reason: string): ValidationResult => {
  const errors: ValidationError[] = [];

  if (!reason) {
    errors.push({ field: "reason", message: "환불 사유는 필수입니다." });
  } else if (!Object.values(RefundReason).includes(reason as RefundReason)) {
    errors.push({
      field: "reason",
      message:
        "유효하지 않은 환불 사유입니다. (PERSONAL_SCHEDULE, HEALTH_ISSUE, DISSATISFACTION, FINANCIAL_ISSUE, OTHER 중 하나여야 합니다.)",
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// 세션 수강 신청 ID validation
export const validateSessionEnrollmentId = (id: number): ValidationResult => {
  const errors: ValidationError[] = [];

  if (!id) {
    errors.push({
      field: "sessionEnrollmentId",
      message: "세션 수강 신청 ID는 필수입니다.",
    });
  } else if (!Number.isInteger(id) || id < 1) {
    errors.push({
      field: "sessionEnrollmentId",
      message: "세션 수강 신청 ID는 1 이상의 정수여야 합니다.",
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// 상세 사유 validation (선택사항, 500자 이하)
export const validateDetailedReason = (
  detailedReason: string
): ValidationResult => {
  const errors: ValidationError[] = [];

  if (!detailedReason) return { isValid: true, errors: [] };

  if (typeof detailedReason !== "string") {
    errors.push({
      field: "detailedReason",
      message: "상세 사유는 문자열이어야 합니다.",
    });
  } else if (detailedReason.length > 500) {
    errors.push({
      field: "detailedReason",
      message: "상세 사유는 500자 이하여야 합니다.",
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// 환불 요청 금액 validation
export const validateRefundAmount = (amount: number): ValidationResult => {
  const errors: ValidationError[] = [];

  if (amount === undefined || amount === null) {
    errors.push({
      field: "refundAmount",
      message: "환불 요청 금액은 필수입니다.",
    });
  } else if (typeof amount !== "number" || isNaN(amount)) {
    errors.push({
      field: "refundAmount",
      message: "환불 요청 금액은 숫자여야 합니다.",
    });
  } else if (amount < 0) {
    errors.push({
      field: "refundAmount",
      message: "환불 요청 금액은 0 이상이어야 합니다.",
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// 은행명 validation (선택사항, 한글/영문/공백만, 50자 이하)
export const validateBankName = (bankName: string): ValidationResult => {
  const errors: ValidationError[] = [];

  if (!bankName) return { isValid: true, errors: [] };

  if (typeof bankName !== "string") {
    errors.push({
      field: "bankName",
      message: "은행명은 문자열이어야 합니다.",
    });
  } else if (bankName.length > 50) {
    errors.push({
      field: "bankName",
      message: "은행명은 50자 이하여야 합니다.",
    });
  } else if (!/^[가-힣a-zA-Z\s]+$/.test(bankName)) {
    errors.push({
      field: "bankName",
      message: "은행명은 한글, 영문, 공백만 사용 가능합니다.",
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// 계좌번호 validation (선택사항, 숫자/하이픈만, 20자 이하)
export const validateAccountNumber = (
  accountNumber: string
): ValidationResult => {
  const errors: ValidationError[] = [];

  if (!accountNumber) return { isValid: true, errors: [] };

  if (typeof accountNumber !== "string") {
    errors.push({
      field: "accountNumber",
      message: "계좌번호는 문자열이어야 합니다.",
    });
  } else if (accountNumber.length > 20) {
    errors.push({
      field: "accountNumber",
      message: "계좌번호는 20자 이하여야 합니다.",
    });
  } else if (!/^[0-9-]+$/.test(accountNumber)) {
    errors.push({
      field: "accountNumber",
      message: "계좌번호는 숫자와 하이픈만 사용 가능합니다.",
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// 예금주 validation (선택사항, 한글/영문/공백만, 50자 이하)
export const validateAccountHolder = (
  accountHolder: string
): ValidationResult => {
  const errors: ValidationError[] = [];

  if (!accountHolder) return { isValid: true, errors: [] };

  if (typeof accountHolder !== "string") {
    errors.push({
      field: "accountHolder",
      message: "예금주는 문자열이어야 합니다.",
    });
  } else if (accountHolder.length > 50) {
    errors.push({
      field: "accountHolder",
      message: "예금주는 50자 이하여야 합니다.",
    });
  } else if (!/^[가-힣a-zA-Z\s]+$/.test(accountHolder)) {
    errors.push({
      field: "accountHolder",
      message: "예금주는 한글, 영문, 공백만 사용 가능합니다.",
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// 환불 요청 데이터 전체 validation
export const validateRefundRequestData = (data: {
  sessionEnrollmentId?: number;
  reason?: string;
  detailedReason?: string;
  refundAmount?: number;
  bankName?: string;
  accountNumber?: string;
  accountHolder?: string;
}): ValidationResult => {
  const allErrors: ValidationError[] = [];

  // 각 필드별 validation 실행
  const sessionEnrollmentIdValidation = validateSessionEnrollmentId(
    data.sessionEnrollmentId || 0
  );
  const reasonValidation = validateRefundReason(data.reason || "");
  const detailedReasonValidation = validateDetailedReason(
    data.detailedReason || ""
  );
  const refundAmountValidation = validateRefundAmount(data.refundAmount || 0);
  const bankNameValidation = validateBankName(data.bankName || "");
  const accountNumberValidation = validateAccountNumber(
    data.accountNumber || ""
  );
  const accountHolderValidation = validateAccountHolder(
    data.accountHolder || ""
  );

  // 모든 에러 수집
  allErrors.push(
    ...sessionEnrollmentIdValidation.errors,
    ...reasonValidation.errors,
    ...detailedReasonValidation.errors,
    ...refundAmountValidation.errors,
    ...bankNameValidation.errors,
    ...accountNumberValidation.errors,
    ...accountHolderValidation.errors
  );

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
  };
};

// 환불 사유에 따른 상세 사유 필수 여부 validation
export const validateDetailedReasonRequired = (
  reason: string,
  detailedReason: string
): ValidationResult => {
  const errors: ValidationError[] = [];

  if (reason === RefundReason.OTHER && !detailedReason) {
    errors.push({
      field: "detailedReason",
      message: "기타 사유를 선택한 경우 상세 사유를 입력해주세요.",
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// 은행 정보 일관성 validation (은행명, 계좌번호, 예금주 중 하나라도 있으면 모두 필수)
export const validateBankInfoConsistency = (data: {
  bankName?: string;
  accountNumber?: string;
  accountHolder?: string;
}): ValidationResult => {
  const errors: ValidationError[] = [];

  const hasBankName = !!data.bankName;
  const hasAccountNumber = !!data.accountNumber;
  const hasAccountHolder = !!data.accountHolder;

  // 은행 정보 중 하나라도 입력된 경우, 모든 은행 정보가 필요
  if (hasBankName || hasAccountNumber || hasAccountHolder) {
    if (!hasBankName) {
      errors.push({ field: "bankName", message: "은행명을 입력해주세요." });
    }
    if (!hasAccountNumber) {
      errors.push({
        field: "accountNumber",
        message: "계좌번호를 입력해주세요.",
      });
    }
    if (!hasAccountHolder) {
      errors.push({
        field: "accountHolder",
        message: "예금주를 입력해주세요.",
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// 환불 요청 전체 validation (모든 규칙 적용)
export const validateCompleteRefundRequest = (data: {
  sessionEnrollmentId?: number;
  reason?: string;
  detailedReason?: string;
  refundAmount?: number;
  bankName?: string;
  accountNumber?: string;
  accountHolder?: string;
}): ValidationResult => {
  const allErrors: ValidationError[] = [];

  // 기본 validation
  const basicValidation = validateRefundRequestData(data);
  allErrors.push(...basicValidation.errors);

  // 상세 사유 필수 여부 validation
  const detailedReasonValidation = validateDetailedReasonRequired(
    data.reason || "",
    data.detailedReason || ""
  );
  allErrors.push(...detailedReasonValidation.errors);

  // 은행 정보 일관성 validation
  const bankInfoValidation = validateBankInfoConsistency({
    bankName: data.bankName,
    accountNumber: data.accountNumber,
    accountHolder: data.accountHolder,
  });
  allErrors.push(...bankInfoValidation.errors);

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
  };
};

// 환불 사유 텍스트 변환 함수
export const getRefundReasonText = (reason: RefundReason): string => {
  const reasonTexts = {
    [RefundReason.PERSONAL_SCHEDULE]: "개인 일정",
    [RefundReason.HEALTH_ISSUE]: "건강 문제",
    [RefundReason.DISSATISFACTION]: "불만족",
    [RefundReason.FINANCIAL_ISSUE]: "재정 문제",
    [RefundReason.OTHER]: "기타",
  };
  return reasonTexts[reason] || "알 수 없음";
};

// 환불 사유 옵션 배열 (select 컴포넌트용)
export const getRefundReasonOptions = () => {
  return Object.values(RefundReason).map((reason) => ({
    value: reason,
    label: getRefundReasonText(reason),
  }));
};
