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

// Teacher용 validation 함수들
export const validateTeacherName = (name: string): ValidationResult => {
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

export const validateTeacherPhoneNumber = (
  phoneNumber: string
): ValidationResult => {
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

export const validateTeacherIntroduction = (
  introduction: string
): ValidationResult => {
  const errors: ValidationError[] = [];

  if (!introduction) return { isValid: true, errors: [] };

  if (introduction.length > 1000) {
    errors.push({
      field: "introduction",
      message: "소개는 1000자 이하여야 합니다.",
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateTeacherEducation = (
  education: string[]
): ValidationResult => {
  const errors: ValidationError[] = [];

  if (!education || education.length === 0)
    return { isValid: true, errors: [] };

  education.forEach((item, index) => {
    if (item.length > 200) {
      errors.push({
        field: "education",
        message: `학력 ${index + 1}은 200자 이하여야 합니다.`,
      });
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateTeacherSpecialties = (
  specialties: string[]
): ValidationResult => {
  const errors: ValidationError[] = [];

  if (!specialties || specialties.length === 0)
    return { isValid: true, errors: [] };

  specialties.forEach((item, index) => {
    if (item.length > 100) {
      errors.push({
        field: "specialties",
        message: `전문분야 ${index + 1}은 100자 이하여야 합니다.`,
      });
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateTeacherCertifications = (
  certifications: string[]
): ValidationResult => {
  const errors: ValidationError[] = [];

  if (!certifications || certifications.length === 0)
    return { isValid: true, errors: [] };

  certifications.forEach((item, index) => {
    if (item.length > 200) {
      errors.push({
        field: "certifications",
        message: `자격증 ${index + 1}은 200자 이하여야 합니다.`,
      });
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateTeacherYearsOfExperience = (
  years: number | undefined
): ValidationResult => {
  const errors: ValidationError[] = [];

  if (years === undefined || years === null)
    return { isValid: true, errors: [] };

  if (typeof years !== "number" || isNaN(years)) {
    errors.push({
      field: "yearsOfExperience",
      message: "경력년수는 숫자여야 합니다.",
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Teacher 전체 프로필 데이터 validation
export const validateTeacherProfileData = (data: {
  name?: string;
  phoneNumber?: string;
  introduction?: string;
  education?: string[];
  specialties?: string[];
  certifications?: string[];
  yearsOfExperience?: number;
  availableTimes?: any;
}): ValidationResult => {
  const allErrors: ValidationError[] = [];

  // 각 필드별 validation 실행
  const nameValidation = validateTeacherName(data.name || "");
  const phoneValidation = validateTeacherPhoneNumber(data.phoneNumber || "");
  const introductionValidation = validateTeacherIntroduction(
    data.introduction || ""
  );
  const educationValidation = validateTeacherEducation(data.education || []);
  const specialtiesValidation = validateTeacherSpecialties(
    data.specialties || []
  );
  const certificationsValidation = validateTeacherCertifications(
    data.certifications || []
  );
  const yearsValidation = validateTeacherYearsOfExperience(
    data.yearsOfExperience
  );

  // 모든 에러 수집
  allErrors.push(
    ...nameValidation.errors,
    ...phoneValidation.errors,
    ...introductionValidation.errors,
    ...educationValidation.errors,
    ...specialtiesValidation.errors,
    ...certificationsValidation.errors,
    ...yearsValidation.errors
  );

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
  };
};

// Principal용 validation 함수들
export const validatePrincipalName = (name: string): ValidationResult => {
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

export const validatePrincipalPhoneNumber = (
  phoneNumber: string
): ValidationResult => {
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

export const validatePrincipalIntroduction = (
  introduction: string
): ValidationResult => {
  const errors: ValidationError[] = [];

  if (!introduction) return { isValid: true, errors: [] };

  if (introduction.length > 1000) {
    errors.push({
      field: "introduction",
      message: "소개는 1000자 이하여야 합니다.",
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validatePrincipalEducation = (
  education: string[]
): ValidationResult => {
  const errors: ValidationError[] = [];

  if (!education || education.length === 0)
    return { isValid: true, errors: [] };

  education.forEach((item, index) => {
    if (item.length > 200) {
      errors.push({
        field: "education",
        message: `학력 ${index + 1}은 200자 이하여야 합니다.`,
      });
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validatePrincipalCertifications = (
  certifications: string[]
): ValidationResult => {
  const errors: ValidationError[] = [];

  if (!certifications || certifications.length === 0)
    return { isValid: true, errors: [] };

  certifications.forEach((item, index) => {
    if (item.length > 200) {
      errors.push({
        field: "certifications",
        message: `자격증 ${index + 1}은 200자 이하여야 합니다.`,
      });
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validatePrincipalBankName = (
  bankName: string
): ValidationResult => {
  const errors: ValidationError[] = [];

  if (!bankName) return { isValid: true, errors: [] };

  if (bankName.length > 50) {
    errors.push({
      field: "bankName",
      message: "은행명은 50자 이하여야 합니다.",
    });
  }

  if (!/^[가-힣a-zA-Z\s]+$/.test(bankName)) {
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

export const validatePrincipalAccountNumber = (
  accountNumber: string
): ValidationResult => {
  const errors: ValidationError[] = [];

  if (!accountNumber) return { isValid: true, errors: [] };

  if (accountNumber.length > 20) {
    errors.push({
      field: "accountNumber",
      message: "계좌번호는 20자 이하여야 합니다.",
    });
  }

  if (!/^[0-9-]+$/.test(accountNumber)) {
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

export const validatePrincipalAccountHolder = (
  accountHolder: string
): ValidationResult => {
  const errors: ValidationError[] = [];

  if (!accountHolder) return { isValid: true, errors: [] };

  if (accountHolder.length > 50) {
    errors.push({
      field: "accountHolder",
      message: "예금주는 50자 이하여야 합니다.",
    });
  }

  if (!/^[가-힣a-zA-Z\s]+$/.test(accountHolder)) {
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

// Principal 전체 프로필 데이터 validation
export const validatePrincipalProfileData = (data: {
  name?: string;
  phoneNumber?: string;
  introduction?: string;
  education?: string[];
  certifications?: string[];
  bankName?: string;
  accountNumber?: string;
  accountHolder?: string;
}): ValidationResult => {
  const allErrors: ValidationError[] = [];

  // 각 필드별 validation 실행
  const nameValidation = validatePrincipalName(data.name || "");
  const phoneValidation = validatePrincipalPhoneNumber(data.phoneNumber || "");
  const introductionValidation = validatePrincipalIntroduction(
    data.introduction || ""
  );
  const educationValidation = validatePrincipalEducation(data.education || []);
  const certificationsValidation = validatePrincipalCertifications(
    data.certifications || []
  );
  const bankNameValidation = validatePrincipalBankName(data.bankName || "");
  const accountNumberValidation = validatePrincipalAccountNumber(
    data.accountNumber || ""
  );
  const accountHolderValidation = validatePrincipalAccountHolder(
    data.accountHolder || ""
  );

  // 모든 에러 수집
  allErrors.push(
    ...nameValidation.errors,
    ...phoneValidation.errors,
    ...introductionValidation.errors,
    ...educationValidation.errors,
    ...certificationsValidation.errors,
    ...bankNameValidation.errors,
    ...accountNumberValidation.errors,
    ...accountHolderValidation.errors
  );

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
  };
};
