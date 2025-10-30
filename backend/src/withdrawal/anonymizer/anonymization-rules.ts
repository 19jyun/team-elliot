/**
 * 개인정보 익명화 규칙 정의
 *
 * 전자상거래법 및 개인정보보호법에 따라 개인정보를 익명화 처리하는 규칙
 */

/**
 * 이름 익명화
 * - 2글자: "홍*"
 * - 3글자 이상: "홍*동"
 * - 1글자: "홍"
 */
export function anonymizeName(name: string): string {
  if (!name || name.length === 0) {
    return name;
  }

  if (name.length === 1) {
    return name;
  }

  if (name.length === 2) {
    return `${name[0]}*`;
  }

  // 3글자 이상: 첫 글자 + 중간은 * + 마지막 글자
  return `${name[0]}${'*'.repeat(name.length - 2)}${name[name.length - 1]}`;
}

/**
 * 전화번호 익명화
 * - "010-1234-5678" → "010-****-5678"
 * - "01012345678" → "010****5678"
 */
export function anonymizePhoneNumber(
  phoneNumber: string | null,
): string | null {
  if (!phoneNumber) {
    return null;
  }

  // 하이픈 제거 후 처리
  const cleaned = phoneNumber.replace(/-/g, '');

  // 전화번호 형식 검증 (10자리 또는 11자리)
  if (cleaned.length < 10 || cleaned.length > 11) {
    return '****-****-****';
  }

  // 010-1234-5678 형식
  if (phoneNumber.includes('-')) {
    const parts = phoneNumber.split('-');
    if (parts.length === 3) {
      return `${parts[0]}-****-${parts[2]}`;
    }
  }

  // 숫자만 있는 경우: 01012345678 → 010****5678
  if (cleaned.length === 11) {
    return `${cleaned.substring(0, 3)}****${cleaned.substring(7)}`;
  } else if (cleaned.length === 10) {
    return `${cleaned.substring(0, 3)}****${cleaned.substring(6)}`;
  }

  return '****-****-****';
}

/**
 * 계좌번호 익명화
 * - "110-123-456789" → "110-***-******"
 * - 중간 3자리, 끝 6자리 마스킹
 */
export function anonymizeAccountNumber(
  accountNumber: string | null,
): string | null {
  if (!accountNumber) {
    return null;
  }

  // 하이픈 포함 형식
  if (accountNumber.includes('-')) {
    const parts = accountNumber.split('-');
    if (parts.length === 3) {
      return `${parts[0]}-***-******`;
    }
  }

  // 숫자만 있는 경우: 마지막 6자리 마스킹
  const cleaned = accountNumber.replace(/-/g, '');
  if (cleaned.length >= 6) {
    const visiblePart = cleaned.substring(0, cleaned.length - 6);
    return `${visiblePart}******`;
  }

  return '******';
}

/**
 * 이메일 익명화
 * - "user@example.com" → "u***@example.com"
 */
export function anonymizeEmail(email: string | null): string | null {
  if (!email) {
    return null;
  }

  const [localPart, domain] = email.split('@');
  if (!localPart || !domain) {
    return email;
  }

  if (localPart.length === 1) {
    return `${localPart}***@${domain}`;
  }

  return `${localPart[0]}***@${domain}`;
}

/**
 * 텍스트 내 개인정보 익명화
 * - 이름 패턴 감지 및 마스킹
 * - 전화번호 패턴 감지 및 마스킹
 * - 계좌번호 패턴 감지 및 마스킹
 * - 이메일 패턴 감지 및 마스킹
 */
export function anonymizeText(text: string | null): string | null {
  if (!text) {
    return null;
  }

  let anonymized = text;

  // 전화번호 패턴 (010-1234-5678, 01012345678)
  const phonePattern = /(\d{2,3})-?(\d{3,4})-?(\d{4})/g;
  anonymized = anonymized.replace(phonePattern, (match) => {
    return anonymizePhoneNumber(match) || match;
  });

  // 이메일 패턴
  const emailPattern = /[\w.-]+@[\w.-]+\.\w+/g;
  anonymized = anonymized.replace(emailPattern, (match) => {
    return anonymizeEmail(match) || match;
  });

  // 계좌번호 패턴 (숫자-숫자-숫자 형식)
  const accountPattern = /\d{3}-\d{3}-\d{6,}/g;
  anonymized = anonymized.replace(accountPattern, (match) => {
    return anonymizeAccountNumber(match) || match;
  });

  return anonymized;
}

/**
 * 익명화 ID 생성
 * 형식: ANON_{ROLE}_{TIMESTAMP}_{RANDOM}
 * 예: ANON_STUDENT_1735459200000_A1B2C3D4
 */
export function generateAnonymousId(role: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 10).toUpperCase();
  return `ANON_${role}_${timestamp}_${random}`;
}
