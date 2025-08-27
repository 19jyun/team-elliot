// 백엔드 DTO와 동일한 validation 규칙들
export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// 이름 validation (한글, 영문, 공백만 허용, 2-50자)
export const validateName = (name: string): ValidationResult => {
  const errors: ValidationError[] = [];

  if (!name) return { isValid: true, errors: [] };

  if (name.length < 2) {
    errors.push({ field: "name", message: "이름은 2자 이상이어야 합니다." });
  }

  if (name.length > 50) {
    errors.push({ field: "name", message: "이름은 50자 이하여야 합니다." });
  }

  if (!/^[가-힣a-zA-Z\s]+$/.test(name)) {
    errors.push({
      field: "name",
      message: "이름은 한글, 영문, 공백만 사용 가능합니다.",
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// 전화번호 validation (01X-XXXX-XXXX 형식, 11자리)
export const validatePhoneNumber = (phoneNumber: string): ValidationResult => {
  const errors: ValidationError[] = [];

  if (!phoneNumber) return { isValid: true, errors: [] };

  if (!/^01[0-9]-[0-9]{4}-[0-9]{4}$/.test(phoneNumber)) {
    errors.push({
      field: "phoneNumber",
      message: "전화번호는 01X-XXXX-XXXX 형식이어야 합니다.",
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// 비상연락처 validation (01X-XXXX-XXXX 형식, 11자리)
export const validateEmergencyContact = (
  emergencyContact: string
): ValidationResult => {
  const errors: ValidationError[] = [];

  if (!emergencyContact) return { isValid: true, errors: [] };

  if (!/^01[0-9]-[0-9]{4}-[0-9]{4}$/.test(emergencyContact)) {
    errors.push({
      field: "emergencyContact",
      message: "비상연락처는 01X-XXXX-XXXX 형식이어야 합니다.",
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// 생년월일 validation (유효한 날짜 형식)
export const validateBirthDate = (birthDate: string): ValidationResult => {
  const errors: ValidationError[] = [];

  if (!birthDate) return { isValid: true, errors: [] };

  const date = new Date(birthDate);
  if (isNaN(date.getTime())) {
    errors.push({
      field: "birthDate",
      message: "생년월일은 유효한 날짜 형식이어야 합니다.",
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// 특이사항 validation (500자 이하)
export const validateNotes = (notes: string): ValidationResult => {
  const errors: ValidationError[] = [];

  if (!notes) return { isValid: true, errors: [] };

  if (notes.length > 500) {
    errors.push({
      field: "notes",
      message: "특이사항은 500자 이하여야 합니다.",
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// 레벨 validation (한글, 영문, 공백만 허용, 20자 이하)
export const validateLevel = (level: string): ValidationResult => {
  const errors: ValidationError[] = [];

  if (!level) return { isValid: true, errors: [] };

  if (level.length > 20) {
    errors.push({ field: "level", message: "레벨은 20자 이하여야 합니다." });
  }

  if (!/^[가-힣a-zA-Z\s]+$/.test(level)) {
    errors.push({
      field: "level",
      message: "레벨은 한글, 영문, 공백만 사용 가능합니다.",
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// 전체 프로필 데이터 validation
export const validateProfileData = (data: {
  name?: string;
  phoneNumber?: string;
  emergencyContact?: string;
  birthDate?: string;
  notes?: string;
  level?: string;
}): ValidationResult => {
  const allErrors: ValidationError[] = [];

  // 각 필드별 validation 실행
  const nameValidation = validateName(data.name || "");
  const phoneValidation = validatePhoneNumber(data.phoneNumber || "");
  const emergencyValidation = validateEmergencyContact(
    data.emergencyContact || ""
  );
  const birthDateValidation = validateBirthDate(data.birthDate || "");
  const notesValidation = validateNotes(data.notes || "");
  const levelValidation = validateLevel(data.level || "");

  // 모든 에러 수집
  allErrors.push(
    ...nameValidation.errors,
    ...phoneValidation.errors,
    ...emergencyValidation.errors,
    ...birthDateValidation.errors,
    ...notesValidation.errors,
    ...levelValidation.errors
  );

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
  };
};
